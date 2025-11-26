# Competition System: Edge Cases & Database Schema Guide

## Overview
This document covers the database schema, edge cases, and solutions for the QB Hub cubing competition system.

---

## Database Schema

### Core Tables

#### `competitions`
Represents a single competition event.

```sql
CREATE TABLE competitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status VARCHAR(20), -- 'setup', 'registration_open', 'in_progress', 'completed'
  date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Notes:**
- Status field drives competition workflow visibility
- Date helps parents plan participation

#### `students`
Individual competitor profiles.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  grade VARCHAR(10),
  created_at TIMESTAMP
);
```

#### `registrations`
Student registration for competitions (admin-driven, not self-service).

```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  student_id UUID REFERENCES students(id),
  status VARCHAR(20), -- 'pending', 'confirmed', 'withdrawn'
  registered_at TIMESTAMP,
  registered_by_user_id UUID,
  UNIQUE(competition_id, student_id)
);
```

**Notes:**
- Admin can add students before or after competition creation
- Status allows for withdrawal tracking
- UNIQUE constraint prevents duplicate registrations

#### `competition_events`
Event types within a competition (3x3, 2x2, Pyraminx, etc.).

```sql
CREATE TABLE competition_events (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  event_type_id UUID REFERENCES event_types(id),
  created_at TIMESTAMP
);
```

**Linked to:**
- `event_types` table with event names and formats

#### `rounds`
Rounds within each event.

```sql
CREATE TABLE rounds (
  id UUID PRIMARY KEY,
  competition_event_id UUID REFERENCES competition_events(id),
  round_number INT,
  round_name TEXT, -- "Round 1", "Semifinals", etc.
  best_of_format VARCHAR(20), -- "best_of_5", "best_of_3"
  created_at TIMESTAMP
);
```

#### `competition_groups`
Student groupings for a competition.

```sql
CREATE TABLE competition_groups (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  group_name TEXT, -- "Group A", "Group B", etc.
  color_hex VARCHAR(7), -- "#FF0000"
  color_name VARCHAR(20), -- "Red", "Blue"
  sort_order INT,
  total_students INT DEFAULT 0,
  created_at TIMESTAMP
);
```

**Notes:**
- Color helps visual identification during live entry
- sort_order determines group display order
- Groups are optional but recommended for organization

#### `group_assignments`
Maps students to groups within a competition.

```sql
CREATE TABLE group_assignments (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  student_id UUID REFERENCES students(id),
  group_id UUID REFERENCES competition_groups(id),
  assigned_at TIMESTAMP,
  assigned_by_user_id UUID,
  UNIQUE(competition_id, student_id) -- One group per student per competition
);
```

**Notes:**
- ONE student per group per competition
- Allows manual or automatic assignment
- Timestamp tracks when assignment occurred

#### `results`
Individual solve attempts during competition.

```sql
CREATE TABLE results (
  id UUID PRIMARY KEY,
  round_id UUID REFERENCES rounds(id),
  student_id UUID REFERENCES students(id),
  attempt_number INT, -- 1-5 for standard format
  time_milliseconds INT,
  is_dnf BOOLEAN DEFAULT FALSE,
  solve_started_at TIMESTAMP,
  solve_completed_at TIMESTAMP,
  judge_notes TEXT,
  recorded_by_user_id UUID, -- Judge/Coach ID
  recorded_at TIMESTAMP,
  created_at TIMESTAMP,
  INDEX(round_id, student_id) -- For performance
);
```

**Notes:**
- Millisecond precision for accurate timing
- DNF stored as separate flag (time_milliseconds can be NULL)
- Timestamps support forensic analysis of when solves occurred
- INDEX improves query performance for live entry

#### `final_scores`
Calculated best and average times per student per round.

```sql
CREATE TABLE final_scores (
  id UUID PRIMARY KEY,
  round_id UUID REFERENCES rounds(id),
  student_id UUID REFERENCES students(id),
  best_time_milliseconds INT,
  average_time_milliseconds INT,
  final_ranking INT,
  calculated_at TIMESTAMP,
  UNIQUE(round_id, student_id)
);
```

**Notes:**
- Denormalized for performance
- Ranking includes ties (same rank for same times)
- Updated after each attempt or round completion

#### `competition_live_state`
Tracks real-time state of live competition entry.

```sql
CREATE TABLE competition_live_state (
  id UUID PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id),
  is_live BOOLEAN DEFAULT FALSE,
  current_event_id UUID,
  current_round_id UUID,
  current_group_id UUID,
  current_student_id UUID,
  current_attempt_number INT,
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP
);
```

**Notes:**
- Allows recovery of state if connection drops
- Helps with display synchronization across devices

---

## Edge Cases & Solutions

### 1. **Refresh Mid-Competition**

**Scenario:** User refreshing browser during live time entry loses selected event/round/group.

**Solution Implemented:**
- Store selections in `sessionStorage` automatically
- Restore on page load
- Falls back to defaults if storage is unavailable

**Code Location:** `/src/app/competitions/[id]/live/page.tsx` (lines 71-102)

**Behavior:**
```typescript
// Save on change
sessionStorage.setItem(`live_competition_${competitionId}`,
  JSON.stringify({ event: selectedEvent, round: selectedRound })
);

// Load on mount
const saved = sessionStorage.getItem(`live_competition_${competitionId}`);
if (saved) {
  const { event, round } = JSON.parse(saved);
  setSelectedEvent(event);
  setSelectedRound(round);
}
```

---

### 2. **Pre-existing Results from Previous Rounds**

**Scenario:** Coach enters times for Round 1, but user queries include results from Round 2 that haven't started yet.

**Solution Implemented:**
- Always filter results by `round_id` in queries
- Use `fetchStudentProgress()` to load only current round's results
- Results table has index on (round_id, student_id) for performance

**Code Location:** `/src/app/dashboard/competitions/[id]/live/page.tsx` (lines 165-188)

**Query Pattern:**
```typescript
const { data: allResults } = await supabase
  .from("results")
  .select("student_id, is_dnf")
  .eq("round_id", selectedRound); // Always filter by round!
```

---

### 3. **Duplicate Attempts**

**Scenario:** Network error causes same time to be submitted twice for same student/attempt.

**Potential Issue:**
- Database constraint checks prevent duplicate (round_id, student_id, attempt_number)

**Solution:**
- Database has implicit UNIQUE constraint through application logic
- Coach UI prevents re-entry (input cleared, attempt auto-incremented)
- Server-side validation on results API endpoint (not yet implemented)

**Recommendation:**
- Add database trigger: `CREATE UNIQUE INDEX idx_unique_attempt ON results(round_id, student_id, attempt_number);`

---

### 4. **Incomplete Attempts (< 5 Solves)**

**Scenario:** Student leaves competition after 3 attempts instead of completing all 5.

**Current Behavior:**
- System accepts and stores whatever attempts are completed
- Rankings calculated based on available attempts
- Average calculated from 3 solves instead of 5

**Calculation Rules:**
- Best time: minimum of all non-DNF attempts
- Average: if 5 attempts, remove best & worst, average middle 3
         if < 5 attempts, average all non-DNF attempts
- Ranking: students with fewer attempts ranked lower (in tie-breaker)

**Code Location:** `/src/lib/utils/rankings.ts`

---

### 5. **All DNF Round**

**Scenario:** Student gets DNF on all 5 attempts.

**Current Behavior:**
- `best_time`: null
- `average_time`: null
- Ranked last
- Still eligible for next round

**Handling:**
```typescript
if (a.bestTime === null && b.bestTime === null) return 0;
if (a.bestTime === null) return 1; // Ranks lower
if (b.bestTime === null) return -1;
```

---

### 6. **Network Disconnect During Live Entry**

**Scenario:** Coach enters time but connection drops before save completes.

**Current Solution:**
- User sees loading state
- If timeout occurs (5 second refresh), error toast appears
- Retry button available
- Input value persists in UI

**Enhancement Opportunity:**
- Queue results locally until connection restored
- Use IndexedDB for offline caching

---

### 7. **Multiple Coaches Entering Times Simultaneously**

**Scenario:** Two coaches enter times for different groups, causing race conditions.

**Current Behavior:**
- Supabase handles concurrent writes correctly
- Each result gets unique ID
- Final_scores table includes student_id + round_id

**No Race Condition Because:**
- Results table uses UUID primary keys (no sequence conflicts)
- No aggregate writes (each attempt is independent)
- Ranking calculations run separately after all entry complete

**Mitigation:**
- Don't call finalize/calculate while entry is happening
- Wait for all coaches to finish a group before calculating

---

### 8. **Student Appears in Multiple Groups**

**Scenario:** Data corruption or admin error puts same student in 2 groups.

**Prevention:**
- UNIQUE(competition_id, student_id) on group_assignments table
- Database constraint prevents this

**Detection:**
- Query: `SELECT student_id, COUNT(*) FROM group_assignments WHERE competition_id = ? GROUP BY student_id HAVING COUNT(*) > 1;`

---

### 9. **Empty Groups**

**Scenario:** Admin creates 4 groups but only registers 8 students, leaving group 4 empty.

**Current Behavior:**
- Empty groups still display in UI
- Zero completion percentage shown
- No error or warning

**Handling:**
- Filter empty groups from display if needed
- Prefill with coach notes about why group is empty

---

### 10. **Round Not Created for Event**

**Scenario:** Admin creates competition, selects 3x3 event, but accidentally deletes only round before entering times.

**Prevention:**
- Default first round created automatically on competition creation
- UI doesn't allow event without round

**Recovery:**
- Create new round through `/dashboard/competitions/[id]/rounds/page.tsx`
- Choose to continue current round or start next

---

### 11. **Results Calculated Before All Attempts Complete**

**Scenario:** Coach finalizes results after only 3/5 attempts per student.

**Current Behavior:**
- Leaderboard shows as final
- Can't add more attempts to same round

**Solution:**
- Don't call finalize endpoint until all attempts submitted
- Use manual confirmation in UI

---

### 12. **Time Parsing Edge Cases**

**Scenario:** Invalid time formats entered.

**Handled Cases:**
- Empty input → validation error
- Non-numeric input → stripped and re-parsed
- Raw numbers → converted per digit count
- Formatted times (M:SS.CC) → parsed correctly
- Over 60 seconds (e.g., "1:23.45") → handled correctly

**Code Location:** `/src/lib/utils.ts` (parseTimeInput function)

**Examples:**
```
'12345' → 83450ms (1:23.45) ✓
'1:23.45' → 83450ms ✓
'90' → 900ms (0:00.90) ✓
'2:15.67' → 135670ms ✓
'abc' → error (invalid) ✓
'' → error (empty) ✓
```

---

## Performance Considerations

### Query Optimization

**N+1 Query Problem (SOLVED):**
- ❌ Old: Loop through finalScores and query group_assignments for each
- ✅ New: Single query with IN clause for all students

**Example - PUBLIC LIVE VIEW:**
```typescript
// Instead of this (N+1):
finalScores.forEach(async score => {
  const assignment = await supabase
    .from("group_assignments")
    .select(...)
    .eq("student_id", score.student_id);
});

// Do this (1 query):
const assignments = await supabase
  .from("group_assignments")
  .select(...)
  .in("student_id", studentIds);
```

### Index Strategy

**Required Indexes:**
```sql
-- Results lookups
CREATE INDEX idx_results_round_student ON results(round_id, student_id);
CREATE INDEX idx_results_attempt ON results(round_id, student_id, attempt_number);

-- Group assignments
CREATE INDEX idx_group_assignments_comp_student ON group_assignments(competition_id, student_id);

-- Final scores
CREATE INDEX idx_final_scores_round ON final_scores(round_id);
```

---

## Data Integrity Checks

### Daily Validation

```typescript
// Check for orphaned results (no matching round)
const orphaned = await supabase
  .from("results")
  .select("*")
  .not("round_id", "in", "(SELECT id FROM rounds)");

// Check for students without groups
const ungrouped = await supabase
  .from("registrations")
  .select("*")
  .not("student_id", "in", "(SELECT student_id FROM group_assignments)");
```

---

## Testing Scenarios

### Unit Tests
1. **Time parsing:** Various formats → milliseconds
2. **Ranking:** Array of times → ranked list with ties
3. **Average calculation:** 5 times with DNF → correct average

### Integration Tests
1. **Full workflow:** Create competition → Register students → Assign groups → Enter times → Calculate rankings
2. **Concurrent entry:** Multiple coaches entering times simultaneously
3. **Refresh persistence:** Session storage survives page reload
4. **Error recovery:** Network error during save → retry → success

### End-to-End Tests (Manual)
1. Create competition
2. Register 12 students
3. Create 3 groups of 4
4. Two coaches enter times for different groups (watch for conflicts)
5. Share public link with parent
6. Verify live view updates every 5 seconds
7. Refresh public link mid-competition → selections persist
8. Finalize round
9. View leaderboard

---

## Deployment Checklist

- [ ] All indexes created in production
- [ ] RLS policies configured for public access
- [ ] sessionStorage cleared on app update
- [ ] Error monitoring (Sentry/LogRocket) configured
- [ ] Database backups tested
- [ ] API rate limiting configured
- [ ] CDN configured for static assets

---

## Schema Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-01 | Initial schema with groups and assignments |
| 1.1 | 2024-01-15 | Added live_state table for session recovery |
| 1.2 | 2024-02-01 | Added indexes for performance optimization |

---

## Further Reading

- [Supabase Documentation](https://supabase.com/docs)
- [WCA Competition Rules](https://www.worldcubeassociation.org/regulations/)
- [Database Design Patterns](https://en.wikipedia.org/wiki/Database_design)
