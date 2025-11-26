# Cubing Hub - Competition Structure & WCA Format Guide

## Overview

The Cubing Hub supports **WCA-inspired competition formats** with flexible round structures, cutoff rules, and automatic ranking calculations. This guide explains how competitions work and how the app manages them.

---

## Table of Contents

1. [WCA Format Basics](#wca-format-basics)
2. [Competition Structure](#competition-structure)
3. [Round System](#round-system)
4. [Results & Scoring](#results--scoring)
5. [Badge Earning](#badge-earning)
6. [Database Schema](#database-schema)
7. [Example Competition Flow](#example-competition-flow)

---

## WCA Format Basics

### What is WCA?

**WCA** = World Cube Association (the official speedcubing governing body)

The WCA standardizes competition rules, event formats, and how times are recorded and ranked. The Cubing Hub follows WCA-inspired conventions.

### Standard Competition Format: "Best of 5" (Bo5)

**5 Attempts Rule**:
- Each competitor makes 5 attempts in a round
- Best attempt = **fastest single solve**
- Average = **mean of the middle 3 attempts** (excludes best and worst)

#### Example:
```
Attempts: 25.50s, 24.30s, 26.10s, 24.80s, 25.90s

Sorted: 24.30s, 24.80s, 25.50s, 25.90s, 26.10s

Best:    24.30s (fastest)
Average: (24.80 + 25.50 + 25.90) / 3 = 25.40s
```

### Time Measurement

- Times recorded in **milliseconds** (ms)
- Displayed as seconds with 2 decimal places
- Example: 24300 ms = 24.30 seconds

### Special Cases

**DNF (Did Not Finish)**
- Competitor did not complete the solve
- Counts as 600000 ms (~10 minutes) for ranking purposes
- If 2+ DNFs: competitor is not ranked in that round
- Example: Best time 25.50s, but got 2 DNFs in attempts → not ranked

**DNS (Did Not Start)**
- Competitor did not show up for the attempt
- Counts as DNF

**+2 Penalty**
- Not currently implemented in Cubing Hub
- WCA allows for "stop at 15 seconds then +2 penalty"
- Can be added in future

---

## Competition Structure

### Competition Hierarchy

```
Competition (Big Event)
├── Competition Event 1 (e.g., 3x3 Rubik's Cube)
│   ├── Round 1 (Qualification Round)
│   ├── Round 2 (Semi-Final Round)
│   └── Round 3 (Final Round)
│
├── Competition Event 2 (e.g., Pyraminx)
│   ├── Round 1
│   └── Round 2
│
└── Competition Event 3 (e.g., 2x2 Pocket Cube)
    └── Round 1
```

### Competition Status

```
upcoming          → Created, not yet registered
registration_open → Open for students to register
in_progress       → Competition is happening
completed         → All rounds finished, results final
```

### Event Status

```
scheduled → Created, not yet started
in_progress → Currently running
completed   → All attempts recorded
```

---

## Round System

### Basic Round Structure

**Example: 3x3 Rubik's Cube at School Championship**

#### Round 1 (Qualification)
- **Participants**: All 50 registered students
- **Format**: Best of 5 (5 attempts)
- **Cutoff**: Top 50% advance to Round 2 (top 25)
- **Ranking**: By average, then by best time
- **Result**: Top 25 students qualify

#### Round 2 (Semi-Final)
- **Participants**: Top 25 from Round 1
- **Format**: Best of 5
- **Cutoff**: Top 8 advance to Final
- **Result**: Top 8 qualify for finals

#### Round 3 (Final)
- **Participants**: Top 8 from Round 2
- **Format**: Best of 5 (often best of 3 in real WCA)
- **Cutoff**: None (all compete)
- **Result**: Final rankings 1-8

---

## Cutoff Rules

### Cutoff Types

**Percentage-Based**
```
cutoff_percentage: 50
= Top 50% of competitors advance

Example: 50 competitors in Round 1
→ Top 25 advance to Round 2
```

**Count-Based**
```
cutoff_count: 32
= Exactly 32 competitors advance

Example: 150 competitors in Round 1
→ Top 32 (by ranking) advance to Round 2
```

**No Cutoff**
```
cutoff_percentage: null
cutoff_count: null
= Everyone can attempt next round (final round usually)
```

### Advancement Logic

1. **Calculate Round 1 Rankings**: All students ranked by average (then best time)
2. **Apply Cutoff**: Determine number who advance
   - If `cutoff_percentage = 50` with 50 students → top 25 advance
   - If `cutoff_count = 16` → top 16 advance regardless of count
3. **Select Advancing Students**: Only selected students can compete in Round 2
4. **Repeat**: Same process for subsequent rounds

---

## Results & Scoring

### Result Entry

**For Each Attempt**:
```javascript
{
  attempt_number: 1-5,           // Which attempt
  time_milliseconds: 25300,      // 25.30 seconds
  is_dnf: false,                 // Did not finish?
  is_dns: false,                 // Did not start?
  penalty_seconds: 0,            // +2 penalty?
  scramble: "R U R' U' R' F R2 U' R' U' R U R' F'" // Scramble code
}
```

### Automatic Calculations

**Best Time**:
```javascript
best = MIN(attempt_1, attempt_2, ..., attempt_5)
// Ignores DNF/DNS
```

**Average Time**:
```javascript
// Sort times (excluding DNF/DNS)
// Remove best and worst
// Calculate mean of remaining 3

average = (time_2 + time_3 + time_4) / 3
```

**Ranking**:
```
1. Primary: Sort by average time (ascending)
2. Tiebreaker: Sort by best time (ascending)

Example Rankings:
1st Place: Average 25.40s, Best 24.30s
2nd Place: Average 25.50s, Best 24.50s
3rd Place: Average 25.50s, Best 24.40s ← Lower best time wins
```

### Final Scores Table

Stores calculated results for each student per round:

```sql
final_scores {
  round_id,
  student_id,
  best_time_milliseconds,      // Best single attempt
  average_time_milliseconds,   // Average of 5 attempts
  final_ranking                // Position in this round
}
```

---

## Badge Earning

### Automatic Badge Awards

Badges are awarded automatically when conditions are met:

#### Performance Badges

**🥇 Champion** (rare)
- Requirement: Win 1st place in a competition
- Awarded: After final round results confirmed

**🥉 Podium Finish** (uncommon)
- Requirement: Top 3 in any competition round
- Awarded: Per round completed

**⭐ Personal Best** (common)
- Requirement: Set new PB in any event type
- Awarded: Immediately when time recorded

#### Participation Badges

**🎯 First Timer** (common)
- Requirement: Complete 1 competition
- Awarded: After first competition

**🎖️ Regular** (common)
- Requirement: Complete 5 competitions
- Awarded: After 5th competition

**🏅 Dedicated** (uncommon)
- Requirement: Complete 10 competitions
- Awarded: After 10th competition

**🎗️ Veteran** (rare)
- Requirement: Complete 25 competitions
- Awarded: After 25th competition

#### Streak Badges

**🔥 On Fire** (common)
- Requirement: 3-week participation streak
- Awarded: After 3rd consecutive week

**⚡ Unstoppable** (uncommon)
- Requirement: 5-week participation streak
- Awarded: After 5th consecutive week

**👑 Legend** (legendary)
- Requirement: 10-week participation streak
- Awarded: After 10th consecutive week

#### Speed Badges (3x3 Cube)

**⚡ Sub-30** (uncommon)
- Requirement: Single solve under 30 seconds
- Awarded: When time achieved

**🌟 Sub-20** (rare)
- Requirement: Single solve under 20 seconds
- Awarded: When time achieved

**👑 Sub-15** (legendary)
- Requirement: Single solve under 15 seconds
- Awarded: When time achieved

### Improvement Badges

**📈 Getting Better** (common)
- Requirement: 10% improvement from previous week
- Awarded: When improvement detected

**🚀 Major Progress** (uncommon)
- Requirement: 25% improvement from previous week
- Awarded: When improvement detected

**💪 Breakthrough** (rare)
- Requirement: 50% improvement from previous week
- Awarded: When improvement detected

---

## Database Schema

### Core Competition Tables

#### `competitions` table
```sql
CREATE TABLE competitions (
  id UUID PRIMARY KEY,
  name TEXT,                    -- "School Championship 2025"
  description TEXT,
  location TEXT,                -- "Central High School"
  competition_date DATE,        -- 2025-03-15
  competition_time TIME,        -- 14:00
  registration_deadline DATE,
  max_participants INTEGER,
  status TEXT,                  -- upcoming, registration_open, in_progress, completed
  is_public BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `competition_events` table
```sql
CREATE TABLE competition_events (
  id UUID PRIMARY KEY,
  competition_id UUID,          -- FK to competitions
  event_type_id UUID,           -- FK to event_types (3x3, 2x2, etc.)
  scheduled_time TIMESTAMPTZ,   -- When this event runs
  max_participants INTEGER,     -- Can limit per event
  status TEXT,                  -- scheduled, in_progress, completed
  current_round INTEGER,        -- Which round we're on
  total_rounds INTEGER,         -- How many total rounds
  created_at TIMESTAMPTZ
);
```

#### `rounds` table
```sql
CREATE TABLE rounds (
  id UUID PRIMARY KEY,
  competition_event_id UUID,    -- FK to competition_events
  round_number INTEGER,         -- 1, 2, 3, etc.
  round_name TEXT,              -- "Qualification Round", "Final"
  cutoff_percentage DECIMAL,    -- 50 = top 50%
  cutoff_count INTEGER,         -- 32 = top 32
  status TEXT,                  -- pending, in_progress, completed
  created_at TIMESTAMPTZ
);
```

#### `results` table
```sql
CREATE TABLE results (
  id UUID PRIMARY KEY,
  round_id UUID,                -- FK to rounds
  student_id UUID,              -- FK to students
  attempt_number INTEGER,       -- 1-5
  time_milliseconds INTEGER,    -- 25300 = 25.30 seconds
  is_dnf BOOLEAN,               -- Did not finish?
  is_dns BOOLEAN,               -- Did not start?
  penalty_seconds INTEGER,      -- +2 penalty
  scramble TEXT,                -- Cube scramble code
  recorded_at TIMESTAMPTZ,
  recorded_by UUID              -- Coach who recorded
);
```

#### `final_scores` table
```sql
CREATE TABLE final_scores (
  id UUID PRIMARY KEY,
  round_id UUID,
  student_id UUID,
  best_time_milliseconds INTEGER,
  average_time_milliseconds INTEGER,
  final_ranking INTEGER,        -- 1, 2, 3, etc.
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### `registrations` table
```sql
CREATE TABLE registrations (
  id UUID PRIMARY KEY,
  competition_id UUID,
  student_id UUID,
  registration_date TIMESTAMPTZ,
  status TEXT,                  -- confirmed, withdrawn
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Personal Bests Tracking

#### `personal_bests` table
```sql
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY,
  student_id UUID,
  event_type_id UUID,           -- Which event (3x3, Pyraminx, etc.)
  best_single_milliseconds INTEGER,
  best_single_competition_id UUID,
  best_single_date DATE,
  best_average_milliseconds INTEGER,
  best_average_competition_id UUID,
  best_average_date DATE,
  last_updated TIMESTAMPTZ
);
```

Example: A student might have:
```
Jaden Smith - 3x3 Cube:
  Best Single: 24300 ms (24.30s)
  Best Average: 26500 ms (26.50s)

Jaden Smith - Pyraminx:
  Best Single: 8200 ms (8.20s)
  Best Average: 9400 ms (9.40s)
```

---

## Example Competition Flow

### "School Championship 2025" - 3x3 Rubik's Cube

#### SETUP PHASE
```
1. Create Competition
   - Name: "School Championship 2025"
   - Date: March 15, 2025
   - Location: Central High School

2. Create Event
   - Event: 3x3 Rubik's Cube
   - Total Rounds: 3

3. Create Rounds
   Round 1 (Qualification):
     - Cutoff: 50%
     - Expected: ~50 competitors → 25 advance

   Round 2 (Semi-Final):
     - Cutoff: Top 8
     - Expected: 25 competitors → 8 advance

   Round 3 (Final):
     - Cutoff: None (all compete)
     - Expected: 8 competitors
```

#### REGISTRATION PHASE
```
Coach opens registration
Students register:
- Jaden Smith ✓
- Nelson Johnson ✓
- Andrew Williams ✓
- Zi Chen ✓
- (... 46 more students)
Total: 50 registered

Status changes to: "registration_open"
```

#### COMPETITION PHASE

**ROUND 1 - QUALIFICATION**
```
Participants: All 50 students
Attempt 1: Jaden - 25.50s
Attempt 2: Jaden - 24.30s  ← Best time
Attempt 3: Jaden - 26.10s
Attempt 4: Jaden - 24.80s
Attempt 5: Jaden - 25.90s

Calculation:
Best: 24.30s
Average: (24.80 + 25.50 + 25.90) / 3 = 25.40s

All 50 students complete 5 attempts
Ranking calculated by average time
Top 25 advance to Round 2
```

**ROUND 2 - SEMI-FINAL**
```
Participants: Top 25 from Round 1
(Jaden finished 5th, so qualifies)

Jaden's Round 2:
Attempts: 23.50s, 23.80s, 24.00s, 24.50s, 23.40s
Best: 23.40s ← NEW PERSONAL BEST!
Average: 23.90s

Top 8 advance to Final
Jaden finishes 3rd → PODIUM! ← 🥉 Badge earned!
Jaden sets PB → ⭐ Badge earned!
```

**ROUND 3 - FINAL**
```
Participants: Top 8 from Round 2
(Jaden qualified)

Jaden's Final:
Attempts: 23.50s, 23.20s, 23.90s, 23.60s, 24.00s
Best: 23.20s
Average: 23.70s

FINAL RESULTS:
1st: Zi Chen (23.10s avg)
2nd: Jaden Smith (23.70s avg) ← 🥈 SILVER MEDAL!
3rd: Andrew Williams (24.20s avg)
...

Jaden wins: 🥇 Champion badge (if 1st place)
Jaden gets: Podium badge (top 3)
```

#### RESULTS PHASE
```
Personal Bests Updated:
Jaden's 3x3:
- Best Single: 23.20s (was 24.30s) ✓ IMPROVED
- Best Average: 23.70s (was 25.40s) ✓ IMPROVED

Badges Awarded:
✓ Podium Finish (🥉 uncommon, 40 pts)
✓ Personal Best (⭐ common, 20 pts)
✓ Major Progress (🚀 uncommon, 35 pts) - if >25% improvement

Total New Points: 95 pts

Student Profile Updated:
- Competitions: 1
- Wins: 0 (got 2nd)
- Podiums: 1
- Best Time: 23.20s
- Badges: 3 new
- Points: +95
```

---

## Weekly Competitions

**Different from Big Competitions!**

Weekly competitions use a **simpler format**:
```
weekly_competitions table:
- Single event type per week
- Same students each week
- Automatic best/average calculation
- Results feed into Termly League standings
- Points awarded: 1st=10pts, 2nd=8pts, 3rd=6pts, etc.
```

### Termly League Integration

```
Term 1 League (8 weeks of 3x3)
├── Week 1: Jaden 1st (10pts), Nelson 2nd (8pts)
├── Week 2: Nelson 1st (10pts), Jaden 2nd (8pts)
├── Week 3: Zi 1st (10pts), Jaden 3rd (6pts)
└── ... (5 more weeks)

CUMULATIVE STANDING:
1. Jaden: 68 pts
2. Nelson: 64 pts
3. Zi: 58 pts
```

---

## Summary

- **WCA Format**: 5 attempts, best time + average ranking
- **Rounds**: Multiple rounds with cutoff rules
- **Results**: Auto-calculated best, average, ranking
- **Badges**: Earned automatically for achievements
- **Personal Bests**: Tracked by event type
- **Termly Leagues**: Weekly competitions aggregating to term standings

**The system handles all calculations automatically!** Coaches just record times, and the app does the rest. 🚀

---

**Questions?** Check the other documentation files:
- `QUICK_REFERENCE.md` - Quick lookup guide
- `ENHANCEMENTS_COMPLETED.md` - Feature overview
- `GETTING_STARTED.md` - Initial setup
