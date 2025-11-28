# Cubing Competition Database Structure

## Overview

This database powers a comprehensive cubing competition management system with built-in gamification features including badges, tiers, point systems, and school standings.

---

## Core Tables

### **Competitions & Events**

```
competitions (id, name, location, date, status, created_by)
    ↓
competition_events (id, competition_id, event_type_id, current_round, total_rounds)
    ↓
rounds (id, competition_event_id, round_number, cutoff)
    ↓
results (id, round_id, student_id, attempt_number, time_ms, is_dnf)
    ↓
final_scores (id, round_id, student_id, best_time, average_time, ranking)
```

**Relationships:**
- `competitions` → `competition_events` (one-to-many): A competition has multiple events
- `competition_events` → `rounds` (one-to-many): An event has multiple rounds
- `rounds` → `results` (one-to-many): A round has multiple attempt results
- `rounds` → `final_scores` (one-to-many): Final scores computed from results

### **Students & Registrations**

```
students (id, first_name, last_name, email, phone, dob, school, grade, student_class, guardian_info, status)
    ↓
registrations (id, competition_id, student_id, status, notes)
```

**Relationships:**
- `registrations` → `competitions` (many-to-many through join table)
- `registrations` → `students` (many-to-many through join table)
- `results` → `students` (many-to-one): Results reference the student who competed
- `final_scores` → `students` (many-to-one): Final scores are per student

### **Events & Personal Bests**

```
event_types (id, name, display_name, description, format, icon_url, sort_order)
    ↓
personal_bests (id, student_id, event_type_id, best_single_ms, best_single_competition_id, best_average_ms, best_average_competition_id)
```

**Relationships:**
- `event_types` referenced by `competition_events` and many other gamification tables
- `personal_bests` → `students` (one-to-many): Each student has PBs for each event
- `personal_bests` → `event_types` (many-to-one): PB is tracked per event type

**Built-in Event Types:**
- 3x3x3 (Standard Rubik's Cube)
- 2x2x2 (Pocket Cube)
- 4x4x4 (Rubik's Revenge)
- 5x5x5 (Professor's Cube)
- Pyraminx
- Megaminx
- Skewb
- Square-1

---

## Gamification System

### **School Management**

```
schools (id, name, abbreviation, division, logo_url, color_hex, contact_info, active)
    ↓ (referenced by students)
students (school field)
    ↓
school_standings (competition_id, school_id, total_points, ranking)
```

**Division Levels:** A, B, C

**Relationships:**
- Students can be assigned to schools
- Schools have multiple students
- School standings computed per competition

### **Badges & Awards**

```
badges (id, badge_code, badge_name, badge_type, icon_url, color_hex, criteria_json, active)
    ↓
badge_awards (id, badge_id, competition_id, student_id/school_id, awarded_for, awarded_at)
```

**Badge Types:**
- `individual`: Awarded to students
- `school`: Awarded to schools

**Criteria Examples (stored as JSON):**
```json
{
  "min_best_time_ms": 20000,
  "min_consecutive_improvements": 3,
  "zero_dnfs": true,
  "percent_improvement": 15
}
```

**Pre-loaded Badges:**
- **Participation**: First Timer, Regular, Dedicated, Veteran
- **Streaks**: On Fire, Unstoppable, Legend
- **Achievement**: Podium Finish, Champion, Personal Best
- **Improvement**: Getting Better, Major Progress, Breakthrough
- **Speed**: Sub-30, Sub-20, Sub-15

### **Tier System**

```
tier_thresholds (id, event_type_id, tier_name, min_time_ms, max_time_ms, base_points, color_hex, description)
```

**Tier Structure (per event type):**
| Tier | Name | Points | Color | Time Range |
|------|------|--------|-------|-----------|
| S | Elite | Highest | Gold | Fastest |
| A | Advanced | High | Silver | Fast |
| B | Intermediate | Medium | Bronze | Medium |
| C | Beginner | Low | Blue | Slow |
| D | Attempt | Lowest | Gray | Very Slow |

**Relationships:**
- One entry per `event_type_id` + `tier_name` combination
- Time ranges are customizable per event

### **Points System**

```
point_transactions (id, competition_id, competition_event_id, round_id, student_id, school_id, point_type, tier_achieved, base_points, grade_multiplier, final_points)
```

**Point Types:**
- `best_time`: Points from best single solve
- `average_time`: Points from average of attempts
- `pb_bonus`: Bonus for setting personal best
- `clutch_bonus`: Bonus for strong performance under pressure
- `streak_bonus`: Bonus for participation streaks
- `school_momentum_bonus`: Bonus for school performance trends

**Point Calculation:**
```
final_points = base_points × grade_multiplier + bonuses
```

**Grade Multipliers:**
- Lower grades (5-7) get higher multipliers (e.g., 2.0)
- Higher grades (10-12) get lower multipliers (e.g., 1.0)
- This encourages younger students while keeping competition fair

**Relationships:**
- Points are per round per student per point type
- Includes full audit trail of how points were earned
- Tracks tier achieved for transparency

### **School Standings**

```
school_standings (id, competition_id, school_id, total_points, best_time_points, average_time_points, bonus_points, total_students, average_points_per_student, total_pb_count, total_dnf_count, overall_rank, division_rank, improvement_percentage, previous_competition_id)
```

**Computed Metrics:**
- `total_points`: Sum of all point_transactions for the school
- `best_time_points`: Sum of best_time point_transactions only
- `average_time_points`: Sum of average_time point_transactions only
- `bonus_points`: Sum of all bonus point_transactions
- `total_students`: Number of students who competed
- `average_points_per_student`: For fair small school comparison
- `total_pb_count`: School-wide PB achievements
- `total_dnf_count`: Total DNFs across all students
- `overall_rank`: Ranking among all schools
- `division_rank`: Ranking within school's division (A, B, or C)
- `improvement_percentage`: Change from previous competition

**Relationships:**
- One entry per `competition_id` + `school_id` combination
- References `previous_competition_id` to track improvement trends
- Aggregates all `point_transactions` for students in the school

### **Weekly Competitions**

```
weekly_competitions (id, name, term, week_number, event_type_id, grade_filter, start_date, end_date, status)
    ↓
weekly_results (id, weekly_competition_id, student_id, attempt_1...5, dnf_1...5, best_time, average_time, ranking, is_pb, improvement_percent)
```

**Relationships:**
- Weekly competitions reference `event_types` for specific event focus
- `grade_filter` is array of grades eligible to compete
- Each student has one result per weekly competition

### **Achievements & Streaks**

```
student_achievements (id, student_id, badge_id, earned_at, weekly_competition_id, competition_id)
student_streaks (id, student_id, streak_type, current_streak, best_streak, last_updated)
```

**Streak Types:**
- `participation_streak`: Consecutive weeks participated
- Other custom streak types as defined

**Relationships:**
- `student_achievements` → `badges` (many-to-one)
- `student_achievements` → `students` (many-to-one)
- Multiple badges can be earned per student
- Unique constraint prevents duplicate badge awards

---

## Complete Data Flow for Points

### Step 1: Student Competes
1. Student registers for competition
2. Competes in a round
3. 5 attempts recorded in `results` table with individual times

### Step 2: Scoring
1. `final_scores` table calculated:
   - Best time from 5 attempts
   - Average of middle 3 attempts (drop best and worst)
   - Student's ranking for the round

### Step 3: Tier Assignment
1. `tier_thresholds` consulted for the event type
2. Student's best time matched to appropriate tier
3. Base points determined from tier

### Step 4: Grade Multiplier Applied
1. Student's grade retrieved
2. Appropriate multiplier applied (e.g., 2.0 for 6th grade, 1.0 for 11th)
3. Base points multiplied

### Step 5: Bonus Detection
1. Check if personal best set → `pb_bonus` points
2. Check participation streak → `streak_bonus` points
3. Check clutch conditions (top performance) → `clutch_bonus`
4. Check school momentum → `school_momentum_bonus`

### Step 6: Point Transactions Recorded
1. Each point type stored as separate transaction for audit trail
2. One transaction per student per round per point type
3. Full context stored: tier, multiplier, base points, final points

### Step 7: School Standings Aggregated
1. All `point_transactions` for school summed
2. Metrics calculated:
   - Total points
   - Points by type
   - Student count
   - Rankings
   - Improvement percentage

### Step 8: Badge Evaluation
1. Badge criteria checked against:
   - Student stats (best times, PBs, etc.)
   - School stats (team points, rankings)
   - Streak history
2. Matching badges awarded to `badge_awards`

### Step 9: Tier & Streak Updates
1. Student's current tier displayed in UI
2. Streaks updated in `student_streaks`
3. Achievements recorded in `student_achievements`

---

## Database Indexes for Performance

### Students & Competitions
```sql
idx_students_status ON students(status)
idx_students_school ON students(school)
idx_students_grade ON students(grade)
idx_competitions_date ON competitions(competition_date)
idx_competitions_status ON competitions(status)
```

### Registration & Results
```sql
idx_registrations_competition ON registrations(competition_id)
idx_registrations_student ON registrations(student_id)
idx_results_round ON results(round_id)
idx_results_student ON results(student_id)
```

### Gamification
```sql
idx_tier_thresholds_event_type ON tier_thresholds(event_type_id)
idx_tier_thresholds_sort ON tier_thresholds(event_type_id, sort_order)

idx_point_transactions_school ON point_transactions(school_id)
idx_point_transactions_competition ON point_transactions(competition_id)
idx_point_transactions_student ON point_transactions(student_id)
idx_point_transactions_round ON point_transactions(round_id)

idx_school_standings_competition ON school_standings(competition_id)
idx_school_standings_rank ON school_standings(competition_id, overall_rank)
idx_school_standings_division_rank ON school_standings(competition_id, division_rank)
idx_school_standings_points ON school_standings(competition_id, total_points DESC)

idx_badges_code ON badges(badge_code)
idx_badge_awards_student ON badge_awards(student_id)
idx_badge_awards_school ON badge_awards(school_id)
idx_badge_awards_competition ON badge_awards(competition_id)
```

### Weekly Competitions
```sql
idx_weekly_results_competition ON weekly_results(weekly_competition_id)
idx_weekly_results_student ON weekly_results(student_id)
```

---

## Row Level Security (RLS)

All tables have RLS policies enabled for Supabase:

**Public Access:**
- View: `event_types`, `schools`, `badges`, `tier_thresholds`, `point_transactions`, `school_standings`, `badge_awards`

**Authenticated Access:**
- Full management access for admins and authorized users

---

## Database Constraints

### Unique Constraints
```sql
UNIQUE(competition_id, event_type_id)          -- One event per competition
UNIQUE(competition_event_id, round_number)     -- One round number per event
UNIQUE(round_id, student_id, attempt_number)   -- One attempt per student per round
UNIQUE(round_id, student_id)                   -- One final score per student per round
UNIQUE(competition_id, student_id)             -- One registration per competition
UNIQUE(student_id, event_type_id)              -- One PB record per student per event
UNIQUE(weekly_competition_id, student_id)      -- One result per student per week
UNIQUE(student_id, badge_id)                   -- Each student gets each badge once
UNIQUE(student_id, streak_type)                -- One streak per type per student
UNIQUE(event_type_id, tier_name)               -- One tier per event type
UNIQUE(round_id, student_id, point_type)       -- One transaction per type per student
UNIQUE(competition_id, school_id)              -- One standing per school per competition
```

### Check Constraints
```sql
CHECK (attempt_number BETWEEN 1 AND 5)         -- Valid attempts 1-5
CHECK (badge_type IN ('individual', 'school')) -- Valid badge types
CHECK (tier_name IN ('S', 'A', 'B', 'C', 'D')) -- Valid tiers
CHECK (point_type IN ('best_time', 'average_time', 'pb_bonus', ...)) -- Valid point types
CHECK (division IN ('A', 'B', 'C'))            -- Valid school divisions
CHECK ((student_id IS NOT NULL AND school_id IS NULL) OR (student_id IS NULL AND school_id IS NOT NULL))
       -- Badge awards to either student OR school, not both
```

---

## Migration Files

Key migration files in `database/`:
- `schema.sql` - Core competition tables
- `schools-schema.sql` - School management
- `badges-schema-enhanced.sql` - Flexible badge system
- `tier-thresholds-schema.sql` - Tier definitions
- `grade-multipliers-schema.sql` - Grade-based point multipliers
- `point-transactions-schema.sql` - Complete point audit trail
- `school-standings-schema.sql` - Pre-computed school rankings
- `seed-badges.sql` - Default badge data
- `seed-tier-thresholds.sql` - Default tier thresholds

---

## Key Design Decisions

1. **Grade-based Multipliers**: Younger students get higher point multipliers to encourage participation while keeping higher grades competitive

2. **Flexible Badge Criteria**: Criteria stored as JSON allows easy addition of new badge types without schema changes

3. **Point Transactions Audit Trail**: Every point earned is recorded with full context (tier, multiplier, source) for transparency and debugging

4. **Pre-computed School Standings**: Rankings pre-calculated for fast leaderboard display rather than computing on-the-fly

5. **Weekly Competitions**: Separate table allows term-time engagement with smaller scope than full competitions

6. **Tier System Per Event**: Different time ranges per event type since 3x3 speeds differ from 2x2, Pyraminx, etc.

7. **School-level Achievements**: Badges can be awarded to schools as a whole to encourage team spirit

8. **Streak Tracking**: Separate table tracks multiple streak types (participation, accuracy, improvement, etc.)

---

## Sample Queries

### Get Student's Total Points in a Competition
```sql
SELECT
  students.first_name,
  students.last_name,
  SUM(point_transactions.final_points) as total_points
FROM point_transactions
JOIN students ON point_transactions.student_id = students.id
WHERE point_transactions.competition_id = 'competition-uuid'
GROUP BY students.id, students.first_name, students.last_name
ORDER BY total_points DESC;
```

### Get School Leaderboard
```sql
SELECT
  schools.name,
  schools.division,
  school_standings.total_points,
  school_standings.overall_rank,
  school_standings.total_students
FROM school_standings
JOIN schools ON school_standings.school_id = schools.id
WHERE school_standings.competition_id = 'competition-uuid'
ORDER BY school_standings.overall_rank;
```

### Get Student's Earned Badges
```sql
SELECT
  badges.badge_name,
  badges.icon_url,
  badge_awards.awarded_at
FROM badge_awards
JOIN badges ON badge_awards.badge_id = badges.id
WHERE badge_awards.student_id = 'student-uuid'
ORDER BY badge_awards.awarded_at DESC;
```

### Get Points Breakdown
```sql
SELECT
  point_type,
  COUNT(*) as count,
  SUM(final_points) as total_points
FROM point_transactions
WHERE competition_id = 'competition-uuid'
GROUP BY point_type
ORDER BY total_points DESC;
```

---

## Contact & Questions

For questions about the database structure, refer to:
- Individual migration files in `database/` directory
- TypeScript actions in `src/app/actions/`
- Utility functions in `src/lib/utils/`
