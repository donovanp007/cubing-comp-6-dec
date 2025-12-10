# Gamified School League System - Complete Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Point Calculation System](#point-calculation-system)
4. [Admin Configuration](#admin-configuration)
5. [User-Facing Features](#user-facing-features)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The gamified school league transforms individual cubing competitions into a **team sport** where schools compete for glory. Students earn points not just for winning, but for consistent improvement, and their points count toward their school's standing.

### Key Features

- **Fair Competition**: Schools with different sizes compete fairly through division system (A: 8+, B: 4-7, C: 0-3 students)
- **Inclusive Scoring**: Points for BOTH best time AND average time, plus bonuses for achievements
- **Grade-Based Multipliers**: Lower grades earn higher point multipliers (Grade 5: 2.0x → Grade 12: 1.0x) to encourage younger participation
- **Transparent Scoring**: Every point transaction is recorded and visible in student/school profiles
- **Real-Time Leaderboards**: Live updates as students complete rounds
- **Achievement Badges**: Individual and school badges for special accomplishments

---

## Architecture

### Database Schema

```
schools
├─ id (UUID)
├─ name
├─ abbreviation
├─ division (A/B/C - auto-assigned by student count)
├─ color_hex (for visual branding)
└─ contact info

tier_thresholds
├─ id
├─ event_type_id (e.g., 3x3, 2x2)
├─ tier (S/A/B/C/D)
├─ min/max milliseconds
├─ base_points

grade_multipliers
├─ grade (5-12)
└─ multiplier (2.0x to 1.0x)

point_transactions (immutable audit trail)
├─ student_id
├─ school_id
├─ competition_id
├─ round_id
├─ point_type (best_time, average_time, pb_bonus, etc.)
└─ final_points (after grade multiplier)

school_standings (pre-computed for performance)
├─ school_id
├─ competition_id
├─ total_points
├─ points breakdown (best_time, average_time, bonus)
├─ overall_rank
├─ division_rank
└─ improvement metrics
```

### Component Structure

#### Server Actions
- `src/app/actions/students.ts` - Student profile data (points history, summary)
- `src/app/actions/school-standings.ts` - School leaderboard queries
- `src/app/actions/badges.ts` - Badge management
- `src/app/actions/tier-thresholds.ts` - Tier configuration
- `src/app/actions/grade-multipliers.ts` - Grade multiplier management

#### Utility Functions
- `src/lib/utils/determine-tier.ts` - Map time → tier (S/A/B/C/D)
- `src/lib/utils/tier-points.ts` - Calculate points from tier + grade
- `src/lib/utils/bonus-detection.ts` - Detect PB, Clutch, Streak, School Momentum
- `src/lib/utils/record-points.ts` - Save transactions to database
- `src/lib/utils/aggregate-school-standings.ts` - Compute school leaderboards
- `src/lib/utils/badge-evaluator.ts` - Auto-award badges

#### Pages
- `/dashboard/competitions/[id]/school-standings` - School leaderboard
- `/dashboard/competitions/[id]/leaderboards` - Dual leaderboard (individual + school)
- `/dashboard/competitions/[id]/live` - Live data entry with tier display
- `/dashboard/competitions/[id]/display` - Projector display board
- `/dashboard/schools/[id]` - School profile with roster & history
- `/dashboard/students/[id]` - Student profile with points history
- `/dashboard/admin/tier-thresholds` - Configure tier thresholds
- `/dashboard/admin/grade-multipliers` - Configure grade multipliers
- `/dashboard/admin/badges` - Manage achievement badges

#### Components
- `TierBadge` - Visual tier indicator (S/A/B/C/D)
- `BadgeDisplay` - Achievement badge display
- `SchoolStandingsTable` - Reusable standings table
- `LiveTierDisplay` - Real-time tier info during competition
- `RealTimeScores` - Live leaderboard as students complete rounds
- `TierProgressBar` - Visual tier threshold visualization

---

## Point Calculation System

### How Points Are Earned

Each student earns points through multiple channels:

```
Total Points = Best Time Points + Average Time Points + Bonuses (all × Grade Multiplier)
```

### 1. Best Time Points

- Student's fastest single solve is mapped to a **tier** (S/A/B/C/D)
- Each tier has a **base point value** (configurable per event type)
- Example (3x3):
  - S tier: < 20 sec → 10 base points
  - A tier: 20-45 sec → 5 base points
  - B tier: 45-60 sec → 2 base points
  - C tier: 60-120 sec → 1 base point
  - D tier: > 120 sec → 0 points
  - DNF: Did Not Finish → 0 points

### 2. Average Time Points

- Student's average (of 5 solves, average of middle 3) maps to a tier
- Points calculated same way as best time
- Encourages consistency, not just fast singles

### 3. Bonuses

All bonuses are **multiplied by grade multiplier** for fairness:

#### PB Bonus (+1 point)
- Triggered when student's best time beats their previous PB across ALL competitions
- Rewards breaking personal records
- Example: Grade 8 student with PB gains 1 × 1.55x = 1.55 points

#### Clutch Bonus (+2 points)
- Triggered when student achieves PB in the **Finals** round
- Rewards performing under pressure
- Only applies if finals round is identified

#### Streak Bonus (+3 points)
- Triggered when student shows 3+ consecutive solve improvements
- Rewards upward momentum throughout round
- Calculated by comparing each solve's time

#### School Momentum Bonus (+5 points per student)
- Triggered when **entire school** has zero DNFs in a round
- Rewards team cohesion and preparation
- Distributed equally to all students in school who competed

### Grade Multipliers

Points are multiplied by grade to balance different skill levels:

```
Grade 5:  2.0x (10 points becomes 20)
Grade 6:  1.85x
Grade 7:  1.70x
Grade 8:  1.55x
Grade 9:  1.40x
Grade 10: 1.25x
Grade 11: 1.10x
Grade 12: 1.0x  (baseline, no multiplier)
```

**Why inverse multipliers?**
- Grade 5 students are slower (solve times are higher)
- Yet, they should earn similar points for same effort
- Inverse multiplier makes 2.0x multiplier from solving "relatively fast" for their grade
- Encourages younger students to participate (they're competitive!)

### Example Calculation

**Student: Sarah, Grade 7, 3x3 Cube**

Round 1:
- Best time: 35 seconds → A tier → 5 base points × 1.70x = 8.5 points
- Average time: 40 seconds → A tier → 5 base points × 1.70x = 8.5 points
- **Is this a PB?** Yes! → +1 base × 1.70x = 1.7 bonus
- **Round Total: 8.5 + 8.5 + 1.7 = 18.7 points**

Her school had zero DNFs → Each student gets +5 × 1.70x = 8.5 school momentum bonus
**New Total: 18.7 + 8.5 = 27.2 points toward school standing**

---

## Admin Configuration

### Tier Thresholds

**Path**: `/dashboard/admin/tier-thresholds`

Configure how times map to tiers (S/A/B/C/D):

```
Event: 3x3 Cube
- S tier: 0-19.99 sec (10 points)
- A tier: 20.00-44.99 sec (5 points)
- B tier: 45.00-59.99 sec (2 points)
- C tier: 60.00-119.99 sec (1 point)
- D tier: 120.00+ sec (0 points)

Event: 2x2 Cube
- S tier: 0-9.99 sec (10 points)
- A tier: 10.00-14.99 sec (5 points)
- B tier: 15.00-24.99 sec (2 points)
- C tier: 25.00-59.99 sec (1 point)
- D tier: 60.00+ sec (0 points)
```

**How to adjust:**
1. Select event type from dropdown
2. Click tier row to edit min/max times
3. Enter times as seconds (e.g., "19.99" for 19.99 seconds)
4. Adjust base points if needed
5. Click Save
6. Use "Reset to Defaults" if you mess up

### Grade Multipliers

**Path**: `/dashboard/admin/grade-multipliers`

Adjust how much each grade's points are multiplied:

```
Grade 5: 2.0x (highest multiplier for youngest)
Grade 6: 1.85x
...
Grade 12: 1.0x (baseline)
```

**How to adjust:**
1. Use slider for each grade (0.5x to 3.0x range)
2. Preview shows: "Tier S (10 pts): 20" for Grade 5
3. Points preview updates in real-time
4. Use "Reset to Defaults" to restore
5. Changes apply immediately to future competitions

### Badge Management

**Path**: `/dashboard/admin/badges`

Configure achievement badges:

```
Individual Badges:
- Speed Demon: Achieved sub-20 second solve
- Consistency King: Completed competition with zero DNFs
- PB Breaker: Set a new personal best
- Clutch Performer: Achieved PB in finals round
- Streak Master: 3+ consecutive solve improvements
- First Timer: Competed in first competition

School Badges:
- Full Force: All registered students competed and completed solves
- Zero DNF: School had zero DNFs across all students
- Growth Warriors: School improved 15%+ from previous competition
- Podium Sweep: School took 1st, 2nd, 3rd in a grade
- Champion School: School champion (highest points)
- Rising Stars: School had 5+ personal bests
```

**How to manage:**
1. Click badge row to see details
2. View criteria JSON (how it's evaluated)
3. Activate/Deactivate badge
4. Badges are auto-awarded at end of competition
5. Deactivated badges won't be awarded in future comps

---

## User-Facing Features

### For Students

**Student Profile** (`/dashboard/students/[id]`)
- Career points summary
- Points history table (10 most recent competitions)
- Bonus breakdown (total PB, Clutch, Streak bonuses)
- School and grade multiplier info
- Achievement badges
- Personal streaks
- Competition history with times

**School Profile** (`/dashboard/schools/[id]`)
- School roster grouped by grade
- School's competition history
- Performance trend (improvement %)
- Latest standing and rank

### For Competition Directors

**Live Competition Entry** (`/dashboard/competitions/[id]/live`)
- Input student times
- See real-time tier indicators
- View estimated points earned
- Track advancement to finals
- Complete round and trigger point calculation

**Projector Display** (`/dashboard/competitions/[id]/display`)
- Large-text leaderboard (schools or individuals)
- Auto-refresh every 3 seconds
- Fullscreen mode for projector
- Medal emojis (🥇🥈🥉) for top 3
- Color-coded by school

**School Standings** (`/dashboard/competitions/[id]/school-standings`)
- Overall and division-based rankings
- Points breakdown by source
- School details sidebar
- Top students in each school
- Personal best counts

**Dual Leaderboard** (`/dashboard/competitions/[id]/leaderboards`)
- Side-by-side individual and school rankings
- Filter by grade
- Select event and round
- Personal best counts per school

---

## Testing Checklist

### Unit Tests (Pending)

```typescript
// src/__tests__/tier-calculation.test.ts
- [ ] determineTier() correctly maps times to S/A/B/C/D
- [ ] Different event types have different thresholds
- [ ] DNF times return tier D
- [ ] Boundary times map correctly (e.g., exactly 20.00 sec)

// src/__tests__/bonus-detection.test.ts
- [ ] checkPBBonus() detects personal bests correctly
- [ ] checkClutchBonus() only triggers in finals
- [ ] checkStreakBonus() requires 3+ consecutive improvements
- [ ] checkSchoolMomentumBonus() validates zero DNFs

// src/__tests__/tier-points.test.ts
- [ ] Grade multipliers applied correctly
- [ ] Base points × grade multiplier = final points
- [ ] Bonuses are multiplied by grade multiplier
- [ ] Different grades get different point totals for same performance
```

### Integration Tests (Pending)

```typescript
// src/__tests__/point-flow.integration.test.ts
- [ ] Complete flow: time entry → tier determination → point calculation → recording
- [ ] School standings correctly aggregate student points
- [ ] Points transaction audit trail is created
- [ ] Division standings calculated correctly
- [ ] Rank calculations (overall and by division) are accurate
- [ ] Badge criteria evaluation works end-to-end
```

### Manual Testing

- [ ] **Tier Thresholds Admin**
  - [ ] Can edit and save tier times
  - [ ] Time conversion (seconds ↔ milliseconds) works
  - [ ] Reset to defaults restores original values
  - [ ] Different events have different thresholds

- [ ] **Grade Multipliers Admin**
  - [ ] Slider updates show correct multiplier
  - [ ] Points preview calculates correctly
  - [ ] Reset to defaults works
  - [ ] Changes apply to new competitions

- [ ] **Live Competition Entry**
  - [ ] Can enter times for students
  - [ ] Tier indicators appear (S/A/B/C/D)
  - [ ] Estimated points calculated
  - [ ] DNF flag works
  - [ ] Advancement to finals works

- [ ] **School Standings**
  - [ ] Schools ranked by total points
  - [ ] Division filtering works (A/B/C)
  - [ ] Points breakdown shown in sidebar
  - [ ] Top students displayed correctly

- [ ] **Student Profile**
  - [ ] Points history shows recent competitions
  - [ ] Bonus breakdown calculated correctly
  - [ ] Grade multiplier info displayed
  - [ ] School contribution shown

- [ ] **Live Display Board**
  - [ ] Loads on `/display` route
  - [ ] Shows school and individual modes
  - [ ] Auto-refreshes every 3 seconds
  - [ ] Fullscreen mode works
  - [ ] Displays current date/time

- [ ] **Badge Awarding**
  - [ ] Individual badges awarded after competition
  - [ ] School badges awarded after competition
  - [ ] Only active badges awarded
  - [ ] Badges appear in student profile

---

## Troubleshooting

### Points Not Calculating

**Problem**: Student completed round but points don't appear

**Solutions**:
1. Check that `apply-advancement.ts` is called after round completion
2. Verify database has `point_transactions` entries
3. Check that `school_standings` table was updated
4. Look at server logs for calculation errors

```sql
-- Debug: Check point transactions
SELECT * FROM point_transactions
WHERE student_id = 'xxx' AND competition_id = 'yyy'
ORDER BY created_at DESC;

-- Debug: Check school standings
SELECT * FROM school_standings
WHERE school_id = 'xxx' AND competition_id = 'yyy';
```

### Incorrect Multiplier Applied

**Problem**: Grade 5 student's points don't reflect 2.0x multiplier

**Solutions**:
1. Verify student's grade is set correctly (check `students` table)
2. Check `grade_multipliers` table has Grade 5 entry with 2.0x
3. Clear browser cache (might be cached old calculation)
4. Check that `final_points = base_points × grade_multiplier`

```sql
-- Debug: Check grade multiplier
SELECT * FROM grade_multipliers WHERE grade = '5';

-- Debug: Check student's grade
SELECT id, first_name, last_name, grade FROM students WHERE id = 'xxx';
```

### Bonuses Not Triggering

**Problem**: PB bonus not awarded even though time is faster

**Solutions**:
1. **PB Bonus**: Check across ALL competitions, not just current
2. **Clutch Bonus**: Only works in Finals round, check round type
3. **Streak Bonus**: Requires 3+ consecutive improvements, check all 5 attempts
4. **School Momentum**: Entire school must have zero DNFs

```sql
-- Debug: Check PB history
SELECT student_id, MAX(best_time_milliseconds) as pb
FROM final_scores
WHERE student_id = 'xxx'
GROUP BY student_id;

-- Debug: Check for DNFs
SELECT * FROM final_scores
WHERE round_id = 'yyy' AND is_dnf = true;
```

### Badge Not Awarded

**Problem**: Student meets badge criteria but badge isn't awarded

**Solutions**:
1. Check that badge is **active** (not deactivated)
2. Verify `badge_evaluator.ts` is called after competition
3. Check `badge_awards` table for entry
4. Verify criteria JSON logic is correct

```sql
-- Debug: Check active badges
SELECT * FROM badges WHERE active = true;

-- Debug: Check awarded badges
SELECT * FROM badge_awards
WHERE student_id = 'xxx' AND competition_id = 'yyy';
```

### School Division Wrong

**Problem**: School assigned to wrong division (A/B/C)

**Solutions**:
1. Division is auto-calculated: A (8+ students), B (4-7), C (0-3)
2. Check student count for school
3. Divisions recalculate after student registration changes
4. May need to refresh leaderboard

```sql
-- Debug: Check student count
SELECT school_id, COUNT(*) as student_count
FROM students
GROUP BY school_id;

-- Debug: Check school division
SELECT id, name, division FROM schools;
```

---

## Key Metrics to Monitor

**Competition Health**:
- Average points per student (should be 20-50)
- Distribution of tiers (should have mix of S/A/B/C/D)
- Bonus frequency (PB, Clutch, Streak)
- School momentum bonus %

**System Health**:
- Point transaction count (should match total attempts)
- School standings update time (should be <1 sec)
- Leaderboard query performance
- Database size of `point_transactions` table

---

## Future Enhancements

- [ ] Historical analytics dashboard
- [ ] ELO rating system for students
- [ ] Tournament brackets
- [ ] Team formation assistant
- [ ] Mobile app
- [ ] Email notifications for records
- [ ] Integration with World Cube Association (WCA) database

---

## Support & Feedback

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review database schema and sample data
3. Check server logs for error messages
4. Contact development team with:
   - Specific student/school/competition ID
   - Expected vs actual result
   - Relevant error messages

---

**Last Updated**: November 2024
**System Version**: 1.0 - Initial Release
