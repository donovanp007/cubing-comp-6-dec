# Complete User Guide & User Flow

## What Was Built - The Big Picture

You now have a **complete school-based competition league system** that works with your existing cubing app. Here's the architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR CUBING APP                       │
│                 (Already Exists)                         │
│  - Students, Schools, Competitions, Events, Rounds      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│            LEAGUE SYSTEM (NEW - BUILT)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ POINT CALCULATION ENGINE                         │   │
│  │ ├─ Tier Determination (S/A/B/C/D)               │   │
│  │ ├─ Base Points (per tier)                       │   │
│  │ ├─ Grade Multipliers (2.0x to 1.0x)            │   │
│  │ ├─ Bonus Detection (PB, Clutch, Streak)        │   │
│  │ └─ Transaction Recording (audit trail)         │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ SCHOOL STANDINGS ENGINE                          │   │
│  │ ├─ Aggregate student points → school total      │   │
│  │ ├─ Calculate rankings (overall + by division)   │   │
│  │ ├─ Compute avg points per student               │   │
│  │ └─ Division assignment (A/B/C)                  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ BADGE SYSTEM                                     │   │
│  │ ├─ Evaluate individual criteria                 │   │
│  │ ├─ Evaluate school criteria                     │   │
│  │ └─ Auto-award badges                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              USER-FACING PAGES (NEW)                     │
│  ├─ Student Profiles (with points history)             │
│  ├─ School Profiles (with roster & standing)           │
│  ├─ School Standings Leaderboard                       │
│  ├─ Dual Leaderboard (individual + school)            │
│  ├─ Live Competition Entry (with tier display)        │
│  └─ Projector Display Board                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              ADMIN CONFIGURATION PAGES                   │
│  ├─ Tier Thresholds Editor                             │
│  ├─ Grade Multipliers Controller                       │
│  └─ Badge Management                                   │
└─────────────────────────────────────────────────────────┘
```

---

## System Overview - What You Get

### 🏫 School-Based Competition
- Schools compete as **teams**, not individuals
- Fair competition through **Division system** (A/B/C based on school size)
- **School pride** - see your school's ranking vs other schools

### 📊 Transparent Scoring
Every point is tracked and visible:
- **Best Time Points**: Points from fastest single solve
- **Average Time Points**: Points from average of 5 solves
- **Bonuses**: PB, Clutch, Streak, School Momentum
- **Grade Multiplier**: Different per grade to be fair

### 🎯 Student Incentives
- Earn points for **consistency** (average time, not just best)
- Earn **bonuses** for achievements (PB, improvement streaks)
- Younger students earn **more points** for same performance (Grade 5 gets 2.0x)
- **Achievement badges** for special accomplishments

### 📈 Real-Time Features
- Live tier indicators during competition
- Projector display for live viewing
- Instant point calculation after round
- Auto-updating leaderboards

---

## User Flow - How It Actually Works (Step by Step)

### USER GROUP 1: ADMIN / COMPETITION DIRECTOR

#### Flow: Set Up Competition

```
Step 1: Go to /dashboard/admin/tier-thresholds
┌─────────────────────────────────────┐
│ Tier Thresholds Configuration       │
│                                     │
│ Event: [3x3 Cube ▼]                │
│                                     │
│ Tier  Min Time  Max Time  Points    │
│ ─────────────────────────────────── │
│ S     0.00      19.99     10        │
│ A     20.00     44.99     5         │
│ B     45.00     59.99     2         │
│ C     60.00     119.99    1         │
│ D     120.00+   ∞         0         │
│                                     │
│ [Save] [Reset to Defaults]          │
└─────────────────────────────────────┘

What admin does:
- Check if tiers look good
- Edit if needed (e.g., change S from <20 to <18.5 seconds)
- Different events have different thresholds (2x2 is faster)
- Click Save → changes apply immediately
```

```
Step 2: Go to /dashboard/admin/grade-multipliers
┌─────────────────────────────────────────────────┐
│ Grade Multipliers                               │
│                                                 │
│ Grade │ Multiplier │ Preview         │ Action  │
│ ──────┼────────────┼─────────────────┼─────── │
│ 5     │ 2.0x ──●── │ Tier S: 20 pts │ [Edit] │
│ 6     │ 1.85x ──●── │ Tier S: 18.5   │ [Edit] │
│ 7     │ 1.70x ──●── │ Tier S: 17     │ [Edit] │
│ 8     │ 1.55x ──●── │ Tier S: 15.5   │ [Edit] │
│ ...   │ ...    ... │ ...             │ ...    │
│ 12    │ 1.0x  ──●── │ Tier S: 10 pts │ [Edit] │
│                                                 │
│ [Reset to Defaults]                             │
└─────────────────────────────────────────────────┘

What admin does:
- Drag slider to adjust multiplier
- Watch preview update in real-time
- Ensure fairness (Grade 5 earns more)
- Reset if accidentally changed
```

```
Step 3: Go to /dashboard/admin/badges
┌──────────────────────────────────────────┐
│ Achievement Badges                       │
│                                          │
│ Filter: [All] [Individual] [School]     │
│                                          │
│ INDIVIDUAL BADGES:                      │
│ ┌─ Speed Demon (Yellow)                │
│ │  Achieved sub-20 second solve        │
│ │  Status: ✓ Active                    │
│ │  [Deactivate]                        │
│ │                                      │
│ ├─ PB Breaker (Orange)                 │
│ │  Set a new personal best             │
│ │  Status: ✓ Active                    │
│ │  [Deactivate]                        │
│ │                                      │
│ └─ Streak Master (Red)                 │
│    3+ consecutive improvements         │
│    Status: ✓ Active                    │
│    [Deactivate]                        │
│                                        │
│ SCHOOL BADGES:                         │
│ ┌─ Champion School (Gold)              │
│ │  Highest total points in comp       │
│ │  Status: ✓ Active                    │
│ │  [Deactivate]                        │
└──────────────────────────────────────────┘

What admin does:
- View all badges and criteria
- Activate/deactivate as needed
- Badges auto-awarded after competition
```

```
Step 4: Run Competition Live Entry

Go to /dashboard/competitions/[id]/live

Step 4a: Select Event & Round
┌─────────────────────────────────────────┐
│ Live Competition Entry                  │
│                                         │
│ Event: [3x3 Cube ▼]                    │
│ Round: [Qualification ▼]                │
│ Group: [All Students ▼]                 │
│ Student: [Select Student ▼]             │
└─────────────────────────────────────────┘

Step 4b: Enter Student Times (5 solves for each student)
┌──────────────────────────────────────────┐
│ John Doe - Grade 8 - Lincoln High       │
│                                         │
│ Attempt 1: [35.23 ▼] sec  ☐ DNF        │
│ Attempt 2: [34.89 ▼] sec  ☐ DNF        │
│ Attempt 3: [35.12 ▼] sec  ☐ DNF        │
│ Attempt 4: [33.45 ▼] sec  ☐ DNF        │
│ Attempt 5: [34.67 ▼] sec  ☐ DNF        │
│                                         │
│ Best:   33.45s  → A tier (5 pts)        │
│ Average: 34.67s → A tier (5 pts)        │
│                                         │
│ Estimated: 5 + 5 = 10 × 1.55x = 15.5   │
│ (Before bonuses)                        │
│                                         │
│ [Previous Student] [Next Student ▶]    │
└──────────────────────────────────────────┘

Step 4c: Complete Round & Calculate Points
┌──────────────────────────────────────────┐
│ ✓ All 8 students entered                │
│                                         │
│ [Complete Round & Calculate Points]    │
│                                         │
│ Processing...                          │
│ ├─ Determining tiers... ✓              │
│ ├─ Calculating points... ✓             │
│ ├─ Detecting bonuses... ✓              │
│ ├─ Recording transactions... ✓         │
│ ├─ Updating school standings... ✓      │
│ ├─ Evaluating badges... ✓              │
│ │                                      │
│ ✓ Complete! 8 students × 5 = 40 solves │
│ Total points: 127.3 for Lincoln HS      │
└──────────────────────────────────────────┘
```

---

### USER GROUP 2: STUDENTS / COMPETITORS

#### Flow: See Your Performance After Competition

```
Day of Competition:
- You compete
- Times are entered by director
- Points calculated immediately

Day After (or hours after):
You want to see: "How did I do? How many points did I earn?"

Step 1: Go to /dashboard/students/[your-id]
┌──────────────────────────────────────────────────────────┐
│ Sarah Chen | Grade 7 | Lincoln High School              │
│                                                          │
│ ┌────┬──────────┬──────────┬─────────┬──────────┐       │
│ │    │Competi-  │Wins │Podiums│Best Time│Career Pts│   │
│ │    │tions: 5  │ 0   │   2   │ 33.45s  │ 127.3   │   │
│ └────┴──────────┴─────┴───────┴────────┴─────────┘      │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│ POINTS HISTORY - Last 10 Competitions                   │
│ ───────────────────────────────────────────────────────│
│ Competition  │ Event │ Best  │ Avg  │ Bonus │ Total    │
│              │       │ Time  │Time  │       │          │
│ ──────────────────────────────────────────────────────│
│ Regionals 1  │ 3x3   │ 8.5   │ 8.5  │ +1.7  │ 18.7    │
│ (Nov 15)     │       │ pts   │ pts  │ PB    │ pts     │
│              │       │       │      │       │         │
│ Regionals 2  │ 3x3   │ 8.5   │ 8.5  │ +3.4  │ 20.4    │
│ (Nov 22)     │       │       │      │ PB+   │         │
│              │       │       │      │ Clutch│         │
│              │       │       │      │       │         │
│ ... (8 more rows) ...                                   │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│ BONUS SUMMARY                                           │
│ ┌──────────────┬──────────────┬──────────────┐         │
│ │ Best Time    │ Avg Time     │ PB Bonuses   │         │
│ │ 95.2 pts     │ 87.3 pts     │ 12.5 pts     │         │
│ └──────────────┴──────────────┴──────────────┘         │
│ ┌──────────────┐                                        │
│ │ Clutch       │                                        │
│ │ 8.4 pts      │                                        │
│ └──────────────┘                                        │
│                                                          │
│ ═══════════════════════════════════════════════════════ │
│ SCHOOL & SCORING INFO                                   │
│ School: Lincoln High School                             │
│ Grade 7 Multiplier: 1.70x                               │
│ "For every 10 points from solving, you earn 17 points" │
│                                                          │
│ "Your points help Lincoln compete in the league!"       │
└──────────────────────────────────────────────────────────┘

What you see:
✓ Your career points (127.3 total)
✓ Each competition's point breakdown
✓ Which bonuses you earned (PB, Clutch, Streak)
✓ How your grade multiplier works
✓ That your points matter to your school
```

```
Step 2: Check Your School's Standing

Click "School" in navigation → select school page

Go to /dashboard/schools/lincoln-high

┌──────────────────────────────────────────────────────┐
│ Lincoln High School                                  │
│ Division A | LHS | 12 Students | Contact Info       │
│                                                      │
│ ┌────────┬────────────┬─────────┬────────┐          │
│ │Students│Competitions│Latest   │Latest  │          │
│ │: 12    │: 5         │Points   │Rank    │          │
│ │        │            │427.3    │#2 OA   │          │
│ │        │            │         │#1 DIV  │          │
│ └────────┴────────────┴─────────┴────────┘          │
│                                                      │
│ ═════════════════════════════════════════════════    │
│ TEAM ROSTER                                          │
│ Grade 7 (3 students)                                 │
│ ├─ Sarah Chen (sarah@email.com) ← YOU ARE HERE      │
│ ├─ Emma Davis (emma@email.com)                      │
│ └─ Lisa Wong (lisa@email.com)                       │
│                                                      │
│ Grade 8 (4 students)                                 │
│ ├─ John Smith (john@email.com)                      │
│ ├─ Mike Johnson (mike@email.com)                    │
│ └─ ...                                               │
│                                                      │
│ ═════════════════════════════════════════════════    │
│ COMPETITION HISTORY                                  │
│ Nov 22 | Regionals 2 | 427.3 pts | #2 OA | #1 DIV   │
│ Nov 15 | Regionals 1 | 415.2 pts | #3 OA | #2 DIV   │
│ ... (more competitions)                              │
│                                                      │
│ PERFORMANCE TREND: +2.9% improvement                │
└──────────────────────────────────────────────────────┘

What you see:
✓ Your entire team roster
✓ School's total points
✓ Your school's rank
✓ Division standing
✓ Performance improvement over time
```

---

### USER GROUP 3: EVENT SPECTATORS / COMPETITION VIEWERS

#### Flow: Watch Live Competition on Projector

```
While competition is running...

Go to /dashboard/competitions/[id]/display

Step 1: See Live Board Setup
┌────────────────────────────────────────────────────────┐
│                  REGIONALS 2024                        │
│         Sacramento Convention Center                   │
│                                                        │
│ [🏆 School Standings] [👤 Individual Rankings]        │
│                            [⛶ Fullscreen]             │
│ Display Auto-Refreshes                                │
└────────────────────────────────────────────────────────┘

Step 2: View School Standings (large text for projector)
┌────────────────────────────────────────────────────────┐
│                                                        │
│ 🥇 LINCOLN HIGH SCHOOL                               │
│    427.3 PTS | 12 STUDENTS | 35.6 AVG/STUDENT       │
│                                                        │
│ 🥈 CENTRAL HIGH                                       │
│    415.2 PTS | 10 STUDENTS | 41.5 AVG/STUDENT       │
│                                                        │
│ 🥉 WEST HIGH                                          │
│    402.1 PTS | 9 STUDENTS | 44.7 AVG/STUDENT        │
│                                                        │
│ #4 EAST ACADEMY                                       │
│    387.5 PTS | 11 STUDENTS | 35.2 AVG/STUDENT       │
│                                                        │
│ Last updated: 2024-11-22 3:45:32 PM                  │
│ Auto-refresh: Every 3 seconds                         │
└────────────────────────────────────────────────────────┘

Spectators see:
✓ All schools' standings (HUGE text)
✓ Points and student counts
✓ Changes update every 3 seconds
✓ Can switch to individual rankings

Step 3: View Individual Rankings
[Click 👤 Individual Rankings button]

┌────────────────────────────────────────────────────────┐
│                                                        │
│ 🥇 SARAH CHEN (33.45s | 36.22s avg)                 │
│    Lincoln High School | Grade 7                      │
│                                                        │
│ 🥈 JOHN SMITH (34.12s | 37.55s avg)                 │
│    Central High School | Grade 8                      │
│                                                        │
│ 🥉 EMMA DAVIS (34.67s | 37.89s avg)                 │
│    West High School | Grade 7                         │
│                                                        │
│ #4 LISA WONG (35.23s | 38.12s avg)                  │
│    Lincoln High School | Grade 8                      │
│                                                        │
│ ... (more students)                                   │
│                                                        │
│ Last updated: 2024-11-22 3:45:35 PM                  │
└────────────────────────────────────────────────────────┘

Spectators see:
✓ Top individual performers
✓ Their schools
✓ Best times and averages
✓ Real-time updates

Step 4: Use Fullscreen for Projector
[Click ⛶ Fullscreen button]
→ Browser goes fullscreen
→ Perfect for wall projector
→ Huge readable text
→ Auto-refreshing
```

---

### USER GROUP 4: COMPETITION ORGANIZERS / LEAGUE RUNNERS

#### Flow: After Competition - View Complete Results

```
Right after all rounds are complete:

Step 1: Go to School Standings Leaderboard
/dashboard/competitions/[id]/school-standings

┌────────────────────────────────────────────────────────┐
│ SCHOOL STANDINGS - REGIONALS 2024                     │
│                                                        │
│ Filter: [All Divisions] [DIV A] [DIV B] [DIV C]      │
│                                                        │
│ ┌─────┬──────────────┬────────┬────────┬──────┬─────┐ │
│ │Rank │ School       │ Points │Students│ Avg  │ Div │ │
│ ├─────┼──────────────┼────────┼────────┼──────┼─────┤ │
│ │ 🥇  │ Lincoln HS   │ 427.3  │   12   │ 35.6 │ A   │ │
│ │ 🥈  │ Central HS   │ 415.2  │   10   │ 41.5 │ A   │ │
│ │ 🥉  │ West HS      │ 402.1  │    9   │ 44.7 │ A   │ │
│ │ #4  │ East Academy │ 387.5  │   11   │ 35.2 │ A   │ │
│ │ #5  │ South HS     │ 295.3  │    7   │ 42.2 │ B   │ │
│ │ #6  │ North HS     │ 187.2  │    4   │ 46.8 │ B   │ │
│ │ #7  │ Charter Acad │  98.5  │    3   │ 32.8 │ C   │ │
│ │ #8  │ River HS     │  92.1  │    2   │ 46.1 │ C   │ │
│ └─────┴──────────────┴────────┴────────┴──────┴─────┘ │
│                                                        │
│ Legend: OA = Overall Rank | Div = Division           │
└────────────────────────────────────────────────────────┘

Step 2: Click on School for Details
Click "Lincoln HS" row → Right sidebar loads:

┌────────────────────────────────┐
│ Lincoln High School            │
│                                │
│ POINTS BREAKDOWN               │
│ Best Time:        195.2 pts    │
│ Avg Time:         187.3 pts    │
│ Bonuses:           44.8 pts    │
│ ────────────────────────────── │
│ TOTAL:            427.3 pts    │
│                                │
│ TEAM STATS                     │
│ Total Students:        12      │
│ Personal Bests:         8      │
│ DNFs:                   1      │
│                                │
│ TOP STUDENTS                   │
│ 🥇 Sarah Chen     27.3 pts     │
│ 🥈 John Smith     24.1 pts     │
│ 🥉 Emma Davis     23.7 pts     │
│ #4 Lisa Wong      22.5 pts     │
│ #5 Mike Johnson   21.3 pts     │
│                                │
│ [VIEW FULL DETAILS]            │
└────────────────────────────────┘

Step 3: Download/Export Results
After competition, you have:
✓ Point transactions for every student
✓ School standings with rankings
✓ Badge awards for individuals and schools
✓ Detailed breakdown of points

All stored in database:
- point_transactions: 200+ rows per competition
- school_standings: 8 rows per competition
- badge_awards: variable per competition
```

---

### USER GROUP 5: ANALYSTS / DATA REVIEWERS

#### Flow: Deep Dive into Point Calculations

```
Question: "How did Lincoln High earn 427.3 points?"

Step 1: Get all transactions for school
/dashboard/schools/[id]/details

Shows:
┌──────────────────────────────────────────┐
│ Lincoln High School - Points Breakdown   │
│                                          │
│ TOTAL: 427.3 points from:               │
│                                          │
│ Best Time Points:     195.2              │
│ └─ 12 students × avg 16.3 pts each      │
│                                          │
│ Avg Time Points:      187.3              │
│ └─ 12 students × avg 15.6 pts each      │
│                                          │
│ Bonuses:               44.8              │
│ ├─ PB Bonuses:         12.5              │
│ ├─ Clutch Bonuses:      8.4              │
│ ├─ Streak Bonuses:     16.2              │
│ └─ School Momentum:     7.7              │
│                                          │
│ GRADE BREAKDOWN:                        │
│ Grade 5 (1 student):   25.4 × 2.0x      │
│ Grade 6 (2 students):  48.2 × 1.85x     │
│ Grade 7 (3 students):  68.1 × 1.70x     │
│ Grade 8 (4 students):  78.4 × 1.55x     │
│ Grade 9 (2 students):  39.2 × 1.40x     │
└──────────────────────────────────────────┘

Step 2: View Individual Student Calculation
Click "Sarah Chen" → shows her specific breakdown:

┌──────────────────────────────────────────┐
│ Sarah Chen - Regionals 2 Results        │
│ Grade 7 (Multiplier: 1.70x)             │
│                                          │
│ SOLVE TIMES:                            │
│ Attempt 1: 35.23s                       │
│ Attempt 2: 34.89s                       │
│ Attempt 3: 35.12s                       │
│ Attempt 4: 33.45s ← Best                │
│ Attempt 5: 34.67s                       │
│ Average: 34.67s                         │
│                                          │
│ TIER DETERMINATION:                     │
│ Best (33.45s) → A tier (20-45s range)   │
│ Avg (34.67s) → A tier                   │
│                                          │
│ POINT CALCULATION:                      │
│ Best Time:  5 base × 1.70x = 8.5 pts   │
│ Avg Time:   5 base × 1.70x = 8.5 pts   │
│ PB Bonus:   1 base × 1.70x = 1.7 pts   │
│ Clutch:     YES (Finals) 2 × 1.70x = 3.4 pts │
│ School Momentum: 5 × 1.70x = 8.5 pts   │
│ ─────────────────────────────────────   │
│ TOTAL:                      30.6 pts    │
│                                          │
│ Grade Multiplier Explained:             │
│ Grade 7 = 2.0 - (7-5) × 0.15 = 1.70x  │
│ This means Grade 7 earns 70% more      │
│ points than Grade 12 (who get 1.0x)    │
└──────────────────────────────────────────┘

Step 3: Verify Calculations
You can verify:
✓ Times recorded correctly
✓ Tiers assigned per thresholds
✓ Grade multiplier calculated
✓ All bonuses detected
✓ Points match formula
```

---

## Complete Data Flow - What Happens Behind The Scenes

```
┌─────────────────────────────────────────────────────────────────┐
│ STUDENT ENTERS 5 TIMES IN LIVE COMPETITION                      │
│ John Doe, Grade 8, 3x3 Cube                                    │
│ Times: 35.23, 34.89, 35.12, 33.45, 34.67 seconds              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN CLICKS "COMPLETE ROUND"                                  │
│ System starts automatic processing...                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: DETERMINE TIER (determine-tier.ts)                     │
│ ├─ Best time: 33.45s → check against thresholds               │
│ │  Threshold: S (0-19.99), A (20-45) ← MATCH!                │
│ │  Result: A tier                                              │
│ │                                                              │
│ └─ Avg time: 34.67s → check against thresholds               │
│    Threshold: A (20-45) ← MATCH!                            │
│    Result: A tier                                             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: GET GRADE MULTIPLIER (grade-multipliers table)         │
│ John's Grade: 8                                                 │
│ Formula: 2.0 - (8-5) × 0.15 = 2.0 - 0.45 = 1.55x            │
│ Multiplier: 1.55x                                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: CALCULATE BASE POINTS (tier-points.ts)                 │
│ Best time (A tier):  5 base points                             │
│ Avg time (A tier):   5 base points                             │
│ Subtotal: 10 base points                                       │
│                                                                 │
│ Apply Grade Multiplier:                                        │
│ 10 base × 1.55x = 15.5 points                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: DETECT BONUSES (bonus-detection.ts)                    │
│                                                                 │
│ PB Bonus? Query: "Has John ever solved faster than 33.45s?"  │
│ ├─ Check ALL previous competitions                             │
│ ├─ Previous best: 33.78s                                       │
│ ├─ Current: 33.45s (FASTER!)                                   │
│ └─ YES → +1 bonus × 1.55x = 1.55 points                       │
│                                                                 │
│ Clutch Bonus? Is this Finals round?                           │
│ ├─ Check round_type = 'Finals'                                │
│ ├─ It IS Finals                                               │
│ ├─ AND he got a PB (just detected above)                      │
│ └─ YES → +2 bonus × 1.55x = 3.1 points                        │
│                                                                 │
│ Streak Bonus? Are attempts improving?                         │
│ ├─ 35.23 → 34.89 (improvement ✓)                              │
│ ├─ 34.89 → 35.12 (decline ✗)                                  │
│ ├─ Only 1 improvement streak = NO (need 3+)                   │
│ └─ NO → 0 points                                               │
│                                                                 │
│ School Momentum? Does school have 0 DNFs this round?         │
│ ├─ Check: DNF count for all Lincoln HS students this round    │
│ ├─ Lincoln HS: 8 students, 0 DNFs                            │
│ └─ YES → +5 bonus × 1.55x = 7.75 points                       │
│                                                                 │
│ BONUS TOTAL: 1.55 + 3.1 + 0 + 7.75 = 12.4 points             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: FINAL POINTS (tier-points.ts summary)                   │
│ Base Points:          15.5                                      │
│ Bonuses:              12.4                                      │
│ ──────────────────────────────                                 │
│ JOHN'S ROUND TOTAL:   27.9 points                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: RECORD TRANSACTIONS (record-points.ts)                  │
│ Create 6 rows in point_transactions table:                      │
│                                                                 │
│ Row 1: best_time | 8.5 pts | John Doe                         │
│ Row 2: average_time | 8.5 pts | John Doe                      │
│ Row 3: pb_bonus | 1.55 pts | John Doe                         │
│ Row 4: clutch_bonus | 3.1 pts | John Doe                      │
│ Row 5: school_momentum_bonus | 7.75 pts | John Doe            │
│                                                                 │
│ (Streak bonus not recorded - was 0)                            │
│                                                                 │
│ Each row includes:                                             │
│ - student_id: john-doe-123                                     │
│ - school_id: lincoln-hs-456                                    │
│ - competition_id: regionals-2024-789                           │
│ - final_points: (as shown above)                               │
│ - created_at: timestamp                                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: PROCESS ALL STUDENTS (for all 8 Lincoln HS students)    │
│ Repeat Steps 1-6 for remaining 7 students:                     │
│                                                                 │
│ Student 1: John Doe     → 27.9 pts ✓                          │
│ Student 2: Sarah Chen   → 30.6 pts ✓                          │
│ Student 3: Emma Davis   → 28.2 pts ✓                          │
│ Student 4: Lisa Wong    → 26.4 pts ✓                          │
│ Student 5: Mike Johnson → 25.8 pts ✓                          │
│ Student 6: David Liu    → 29.1 pts ✓                          │
│ Student 7: Amy Park     → 24.9 pts ✓                          │
│ Student 8: Chris Taylor → 23.5 pts ✓                          │
│                                                                 │
│ School Total (Lincoln HS): 216.4 points                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 8: UPDATE SCHOOL STANDINGS (aggregate-school-standings.ts) │
│                                                                 │
│ For Lincoln HS:                                                │
│ ├─ Sum best_time points: 98.4                                  │
│ ├─ Sum avg_time points: 87.2                                   │
│ ├─ Sum all bonuses: 30.8                                       │
│ ├─ Total: 98.4 + 87.2 + 30.8 = 216.4 ✓                       │
│ ├─ Avg per student: 216.4 / 8 = 27.05                         │
│ ├─ Total students: 8                                           │
│ ├─ PB count: 3 (3 students had PBs)                           │
│ └─ DNF count: 0 (no DNFs)                                      │
│                                                                 │
│ Update school_standings table:                                 │
│ ├─ overall_rank: (calculated later with all schools)          │
│ ├─ division_rank: (calculated later within Division A)         │
│ └─ improvement: +12.5% (vs previous competition)              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 9: RECALCULATE ALL RANKINGS                                │
│                                                                 │
│ Sort all 8 schools by total_points:                            │
│ 1. Lincoln HS: 427.3 pts (12 students) → Overall Rank #1      │
│ 2. Central HS: 415.2 pts (10 students) → Overall Rank #2      │
│ 3. West HS: 402.1 pts (9 students) → Overall Rank #3          │
│ ... etc                                                         │
│                                                                 │
│ Then sort WITHIN each division:                                │
│ Division A (8+ students):                                      │
│ 1. Lincoln HS → Division Rank #1                              │
│ 2. Central HS → Division Rank #2                              │
│ 3. West HS → Division Rank #3                                 │
│ ... etc                                                         │
│                                                                 │
│ Division B (4-7 students):                                     │
│ 1. South HS → Division Rank #1                                │
│ 2. North HS → Division Rank #2                                │
│ ... etc                                                         │
│                                                                 │
│ Division C (0-3 students):                                     │
│ 1. Charter Academy → Division Rank #1                         │
│ 2. River HS → Division Rank #2                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 10: EVALUATE BADGES (badge-evaluator.ts)                   │
│                                                                 │
│ Individual Badges to Check:                                    │
│ ├─ John Doe: Check if eligible for "Speed Demon" (sub-20s)    │
│ │  His best: 33.45s → NO                                      │
│ ├─ Sarah Chen: Check if eligible for "PB Breaker"             │
│ │  Got PB this round → YES! Award badge                       │
│ ├─ John Doe: Check if eligible for "Streak Master" (3+ improve)│
│ │  Only 1 improvement → NO                                     │
│ └─ ... (check all students for all criteria)                   │
│                                                                 │
│ School Badges to Check:                                        │
│ ├─ Lincoln HS: Check "Zero DNF" (0 DNFs)                      │
│ │  Lincoln had 0 DNFs → YES! Award badge                      │
│ ├─ Lincoln HS: Check "Rising Stars" (5+ PBs)                  │
│ │  Lincoln had 3 PBs this round → NO (need 5+)               │
│ └─ Lincoln HS: Check "Champion School" (highest points)       │
│    Lincoln #1 overall → YES! Award badge                      │
│                                                                 │
│ Create badge_awards entries for all earned badges              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ COMPLETE!                                                        │
│                                                                 │
│ System has:                                                     │
│ ✓ Calculated points for 8 students                             │
│ ✓ Recorded 40+ transactions (5 solves × 8 students)           │
│ ✓ Updated school standings                                    │
│ ✓ Recalculated all rankings                                   │
│ ✓ Awarded 5 badges (individual + school)                      │
│                                                                 │
│ Time elapsed: ~2 seconds                                       │
│                                                                 │
│ Results now visible in:                                        │
│ ✓ Student profiles (points history)                           │
│ ✓ School standings leaderboard                                │
│ ✓ Projector display board                                     │
│ ✓ Individual profiles                                         │
│ ✓ Achievement badges section                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Summary of What You Get

| Component | What It Does | Who Uses It |
|-----------|--------------|-----------|
| **Tier System** | Maps times to S/A/B/C/D tiers | Everyone (automatic) |
| **Point Calculator** | Earns points from times + bonuses | Students (automatic) |
| **Grade Multiplier** | Adjusts points by grade | Students (automatic) |
| **School Standings** | Aggregates student points → school rank | Directors, Students |
| **Achievement Badges** | Auto-awards for achievements | Students |
| **Student Profile** | Shows point history & breakdown | Students |
| **School Profile** | Shows roster & competition history | Students, Parents |
| **Live Display** | Projector board for event | Spectators |
| **Admin Config** | Adjust tiers, multipliers, badges | Directors, Admin |

---

## Key Metrics You Now Track

**Per Student:**
- Career points
- Points per competition
- Best time achieved
- Average consistency
- Personal bests
- Badges earned

**Per School:**
- Total points
- Average points per student (fairness metric)
- Division assignment (A/B/C)
- Overall rank
- Division rank
- Improvement trend

**Per Competition:**
- Total points distributed
- Number of PBs set
- Number of badges awarded
- Distribution of tiers

This is your **complete gamified league system**! 🎉
