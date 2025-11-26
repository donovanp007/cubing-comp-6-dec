# 🏆 Round Advancement & Elimination Guide

This document explains how the automatic round advancement system works in Cubing Hub, following World Cubing Association (WCA) standards.

## 📋 Overview

The round advancement system automatically determines which students progress to the next round based on their solve times, without manual selection required.

### Key Principles

1. **Round-Based Format**: Each event has multiple rounds
2. **Automatic Advancement**: Students advance based on cutoff rules
3. **Time-Based Ranking**: Fastest times always advance
4. **Finals Auto-Generation**: Top competitors automatically determined
5. **Real-Time Updates**: Parents see live advancement status

---

## 🎯 Round Types & Advancement Rules

### Round 1: Qualification Round
- **Participants**: Everyone registered
- **Advancement**: 100% proceed to next round
- **Cutoff**: None (everyone continues)
- **Purpose**: Establish baseline times, qualify everyone

```
Round 1 (Qualification)
├─ All competitors compete
├─ No eliminations
└─ Everyone proceeds to Round 2
```

### Round 2+: Competitive Rounds
- **Participants**: Those who advanced from previous round
- **Advancement**: Based on cutoff (percentage or count)
- **Cutoff Types**:
  - **Percentage-Based**: Top X% advance (e.g., 75%)
  - **Count-Based**: Top X competitors advance (e.g., Top 8)
  - **Time-Based**: Anyone under time limit advances (e.g., < 30 seconds)

```
Round 2 (Eliminating)
├─ Competitors: Those who advanced from R1
├─ 20 competitors start
├─ Cutoff: Top 75% advance (15 competitors)
└─ Eliminated: 5 slowest competitors (3)
```

### Finals: Championship Round
- **Participants**: Top 8-12 from final qualifying round
- **Advancement**: None (championship)
- **Medals**: Top 3 winners determined
  - 🥇 Gold: 1st Place (Fastest Time)
  - 🥈 Silver: 2nd Place
  - 🥉 Bronze: 3rd Place

---

## 📊 WCA-Style Elimination Examples

### Example 1: Progressive Elimination (WCA Standard)

```
Event: 3x3 Cube Solve

Round 1: Qualification
├─ Competitors: 40
├─ Format: Best of 1 solve
└─ Advancement: All 40 continue

Round 2: Preliminary Round
├─ Competitors: 40
├─ Format: Best of 1 solve
├─ Cutoff: Top 75% (30 competitors)
└─ Eliminated: Bottom 10

Round 3: Semi-Finals
├─ Competitors: 30
├─ Format: Best of 1 solve
├─ Cutoff: Top 50% (15 competitors)
└─ Eliminated: Bottom 15

Round 4: Finals
├─ Competitors: 15
├─ Format: Best of 1 solve
├─ Medal Winners:
│  ├─ 🥇 1st Place: Fastest time
│  ├─ 🥈 2nd Place: 2nd fastest
│  └─ 🥉 3rd Place: 3rd fastest
└─ Champion: Determined by fastest time
```

### Example 2: Top-Count Advancement

```
Round 1: Registration Round
├─ Competitors: 50
├─ Advancement: All continue

Round 2: Competitive
├─ Competitors: 50
├─ Cutoff: Top 16 (count-based)
├─ Eliminated: 34 competitors
└─ Advancing: 16 competitors

Finals: Championship
├─ Competitors: 16
├─ Top 3 medals awarded
└─ Winner: Fastest time
```

### Example 3: Time-Based Cutoff

```
Round 1: Open Round
├─ Competitors: 30
├─ Advancement: All continue

Round 2: Competitive
├─ Competitors: 30
├─ Cutoff: < 20 seconds (time-based)
├─ Advancing: 12 under 20s
├─ Eliminated: 18 over 20s
└─ Next: Top 12 to Finals

Finals
├─ Competitors: 12
├─ Champion: Fastest time overall
└─ Medals: Top 3
```

---

## ⚙️ Automatic Advancement Algorithm

### Step 1: Collect Round Results
After a round is completed, the system:
1. Fetches all solve times from that round
2. Filters out DNF/DNS entries (or includes them at bottom)
3. Sorts by best time (ascending)

### Step 2: Apply Cutoff Logic

#### Percentage-Based Advancement
```javascript
let advanceCount = Math.ceil(totalCompetitors * (percentage / 100))
// Example: 20 competitors, 75% = ceil(20 * 0.75) = 15 advance
```

#### Count-Based Advancement
```javascript
let advanceCount = topCount
// Example: Top 8 competitors advance
```

#### Time-Based Advancement
```javascript
let advancingCompetitors = times.filter(t => t < timeCutoff)
// Example: All times < 30 seconds advance
```

### Step 3: Generate Advancement List
```
1. Person A: 12.34s ✅ ADVANCE
2. Person B: 13.56s ✅ ADVANCE
3. Person C: 14.23s ✅ ADVANCE
...
15. Person O: 19.45s ✅ ADVANCE
---
16. Person P: 21.12s ❌ ELIMINATE
17. Person Q: 22.56s ❌ ELIMINATE
...
20. Person T: 28.90s ❌ ELIMINATE
```

### Step 4: Mark Competitors' Status
- **Advancing**: Status = "advanced" (visible for next round)
- **Eliminated**: Status = "eliminated" (removed from competition)
- **Advancing to Finals**: Status = "finalist" (in finals round)

---

## 🎓 Finals Auto-Generation

### When Finals Are Created
- After the last qualifying round completes
- Top 8-12 competitors (configurable) automatically selected
- Based on their best time across all rounds

### Finals Bracket
```
Top Competitors Determine Finals

Round N-1 (Last Qualifying Round)
├─ 20 competitors
├─ Top 8 advance to Finals
└─ Finals auto-created with these 8

Finals (Championship Round)
├─ 8 competitors (selected automatically)
├─ Format: 1 solve each
└─ Winner: Fastest time
    ├─ 🥇 Gold: #1 fastest
    ├─ 🥈 Silver: #2 fastest
    └─ 🥉 Bronze: #3 fastest
```

### Medal Assignment
```
Position in Finals | Medal | Status
1st (Fastest)      | 🥇   | Champion
2nd                | 🥈   | Runner-up
3rd                | 🥉   | 3rd Place
4th-8th            | -    | Finalist
```

---

## 👥 Parent View: Live Advancement Link

### What Parents See

Parents access: **`/competitions/[id]/live`**

This public link shows:
- ✅ Live competitor rankings
- ✅ Which competitors advanced to next round
- ✅ Which competitors were eliminated
- ✅ Their child's current status
- ✅ Times recorded throughout the day
- ✅ Real-time updates (no refresh needed)

### Live Link Display Example

```
🎯 3x3 Cube - Round 1 Qualification
Status: IN PROGRESS

Current Standings:
1. 🟢 John Smith (12.34s) - ADVANCING ✅
2. 🟢 Sarah Johnson (13.56s) - ADVANCING ✅
3. 🟢 Mike Davis (14.23s) - ADVANCING ✅
...
19. 🔴 Tom Wilson (28.90s) - ELIMINATED ❌
20. 🔴 Lisa Brown (29.45s) - ELIMINATED ❌

📊 Your Child: Sarah Johnson
├─ Status: ADVANCING ✅
├─ Best Time: 13.56s
├─ Rank: #2
└─ Next Round: Round 2 (Semi-Finals)
```

### Real-Time Updates
- Scores update automatically as times are entered
- Status changes (advancing/eliminated) show instantly
- Parents don't need to refresh to see updates
- Notifications when their child's status changes

---

## 🔄 Dashboard Coach View: Live Entry

### What Coaches See
URL: **`/dashboard/competitions/[id]/live`**

Coaches can:
- Record solve times in real-time
- See advancement status update automatically
- View who's advancing to next round
- Manually confirm/adjust if needed
- Print/export results

### Live Entry Display

```
Round 1 - 3x3 Cube
Status: IN PROGRESS

Students to Record:
[ ] John Smith - (no time yet)
[ ] Sarah Johnson - 13.56s ✅
[ ] Mike Davis - (no time yet)

Advancement Calculations:
Cutoff: Top 75% (15/20)
├─ 13 competitors with times ✅
├─ 7 competitors pending
└─ Auto-refresh advancement when all complete

Advanced (Auto-Calculated):
1. John Smith: 12.34s ✅
2. Sarah Johnson: 13.56s ✅
...
15. Person O: 19.45s ✅

Eliminated (Auto-Calculated):
16. Person P: 21.12s ❌
...
20. Person T: 28.90s ❌
```

---

## ⚡ Automatic Advancement Flow

### Timeline of Events

```
Coaches Recording Times
    ↓
Times Entered in System
    ↓
[Times Collected for Round]
    ↓
Round Marked Complete
    ↓
🤖 AUTOMATIC ADVANCEMENT CALCULATION
    ├─ Sort by fastest time
    ├─ Apply cutoff logic
    ├─ Generate advancing list
    ├─ Generate eliminated list
    └─ Update student statuses
    ↓
Dashboard Updated (Real-Time)
    ├─ Show advancement details
    ├─ Highlight who's advancing
    └─ Show who's eliminated
    ↓
Parent View Updates (Real-Time)
    ├─ Show advancement status
    ├─ Update rankings
    └─ Notify families of status
    ↓
Finals Preparation (If Last Round)
    ├─ Auto-create finals round
    ├─ Select top 8-12
    └─ Show medal brackets
```

---

## 🎯 Configuration per Round

### Round Settings UI

For each round, coaches configure:

```
Round Name: "Round 1 - Qualification"
Format: "Best of 1"
Advancement Type: ○ Percentage ○ Count ○ Time-Based

If Percentage Selected:
├─ Percentage: [50%] ← input
└─ Example: "Top 50% advance (X competitors)"

If Count Selected:
├─ Top Count: [8] ← input
└─ Example: "Top 8 competitors advance"

If Time-Based Selected:
├─ Time Limit: [30.00s] ← input
└─ Example: "All under 30 seconds advance"
```

---

## 📈 Advanced Features

### Tiebreaker Handling
- If two competitors have same time:
  - By default: Both advance
  - Alternative: Earlier solvers advance
  - Can be configured per round

### DNF/DNS Handling
- **DNF** (Did Not Finish): Competitor included in standings at bottom
- **DNS** (Did Not Start): Competitor marked but doesn't advance
- Both count toward advancement percentage

### Double Advancement
- All competitors who meet cutoff advance
- Example: 50% cutoff with 3 tied for cutoff line → all 3 advance

---

## 📊 Real-World Scenario

### School Cubing Competition

```
Event: 3x3 Cube
Registered: 50 students

ROUND 1: Qualification
├─ Format: Everyone competes
├─ Participants: 50
├─ Cutoff: 100% (everyone advances)
├─ Times Recorded: All 50 ✅
└─ Outcome: All 50 to Round 2 ✅

ROUND 2: Preliminary Round
├─ Format: Top 75%
├─ Participants: 50
├─ Cutoff: Top 37-38 students (75% of 50)
├─ Times Recorded: All 50 ✅
├─ Result:
│  ├─ Advancing: 38 students ✅
│  └─ Eliminated: 12 students ❌
└─ Families Notified: Yes ✅

ROUND 3: Semi-Finals
├─ Format: Top 50%
├─ Participants: 38
├─ Cutoff: Top 19 students (50% of 38)
├─ Times Recorded: All 38 ✅
├─ Result:
│  ├─ Advancing: 19 students ✅
│  └─ Eliminated: 19 students ❌
└─ Families Notified: Yes ✅

FINALS: Championship
├─ Format: Top 8 + 1 reserve
├─ Participants: 8 (auto-selected)
├─ Times Recorded: All 8 ✅
├─ Results:
│  ├─ 🥇 Champion: Sarah Johnson (12.34s)
│  ├─ 🥈 Runner-up: John Smith (12.45s)
│  ├─ 🥉 3rd Place: Mike Davis (12.67s)
│  └─ Finalists: 5 others
└─ Event Complete ✅

Parent Timeline:
08:00 - Registration Opens
09:00 - Round 1 begins → All children competing ✅
10:00 - Round 1 complete → All 50 advancing ✅
10:30 - Round 2 begins → 38 kids advancing ✅
11:15 - Round 2 complete → 19 advancing, 19 eliminated
11:30 - Round 3 begins → Semi-finals start
12:30 - Round 3 complete → 8 finalists selected
13:00 - FINALS BEGIN → Championship round
14:00 - AWARDS CEREMONY → 🥇🥈🥉
```

---

## 🔧 Implementation Checklist

- [ ] Rounds page shows cutoff configuration options
- [ ] Advancement algorithm implemented
- [ ] Finals auto-generation when last qualifying round complete
- [ ] Dashboard updates show advancement status in real-time
- [ ] Parent live link shows advancement indicators
- [ ] Real-time score updates (WebSocket or polling)
- [ ] Automatic notifications when advancement status changes
- [ ] Medal/champion determination automated
- [ ] Export results with advancement data
- [ ] Mobile-friendly live link for parents

---

## 🚀 Testing the Advancement System

### Test Scenario 1: Percentage-Based Advancement
1. Create competition with 1 event
2. Add Round 1 (100% advancement)
3. Add Round 2 (Top 75%)
4. Register 20 students
5. Record times for all 20 in Round 1
6. Complete Round 1 → All 20 should advance
7. Record times for all 20 in Round 2
8. Complete Round 2 → Only top 15 (75%) should advance
9. Verify dashboard shows who's advancing
10. Verify parent link shows advancement status

### Test Scenario 2: Finals Auto-Generation
1. Create Finals round configuration
2. Set to select top 8 for finals
3. Complete all qualifying rounds
4. Finals should auto-generate with top 8
5. Record times for finals
6. Champion/medals should auto-determine

### Test Scenario 3: Parent View
1. Get public live link URL
2. Open in parent's device
3. See live rankings
4. See child's advancement status
5. Receive notifications of status changes

---

This system ensures fair, transparent, and automatic advancement throughout the competition day! 🏆
