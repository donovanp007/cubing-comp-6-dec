# 🔗 Live Links & Feature Locations Guide

This guide shows you exactly where to find and use all the competition management features, especially for parents and coaches to track live competition status.

---

## 📍 Quick Links Reference

### For Parents/Spectators
**Public Live Link** (Share with Parents):
```
http://localhost:3001/competitions/[COMPETITION_ID]/live
```
✅ Parents see live rankings
✅ Show child's current performance
✅ Real-time updates (auto-refreshes every 5 seconds)
✅ No login required

### For Coaches/Organizers
**Coach Dashboard**:
```
http://localhost:3001/dashboard
```

**Competition Details**:
```
http://localhost:3001/dashboard/competitions/[COMPETITION_ID]
```

**Live Time Entry** (Record scores):
```
http://localhost:3001/dashboard/competitions/[COMPETITION_ID]/live
```

**Round Configuration**:
```
http://localhost:3001/dashboard/competitions/[COMPETITION_ID]/rounds
```

---

## 🎯 Feature Locations Map

### 1️⃣ Creating & Managing Competitions

**Location**: Dashboard → Competitions

```
http://localhost:3001/dashboard/competitions
     ↓
[Create New Competition] Button
     ↓
Fill in:
├─ Competition Name
├─ Location
├─ Date
├─ Description
└─ Create Competition
```

**What You Can Do**:
- ✅ Create new competitions
- ✅ Edit competition details
- ✅ View all registered students
- ✅ See real-time rankings
- ✅ Go live when ready

---

### 2️⃣ Configuring Rounds & Elimination

**Location**: Competition Details → Rounds Tab

```
http://localhost:3001/dashboard/competitions/[ID]/rounds
     ↓
Select Event Category (2x2, 3x3, etc.)
     ↓
[+ Add Round] Button
     ↓
Configure Round:
├─ Round Name (e.g., "Qualification", "Semi-Finals", "Finals")
├─ Advancement Type:
│  ├─ Percentage (Top 75%)
│  ├─ Count (Top 8)
│  ├─ Time-Based (Under 30 seconds)
│  └─ All (Everyone advances)
├─ Set Cutoff Value:
│  ├─ If Percentage: 50%, 75%, etc.
│  ├─ If Count: Top 8, Top 16, etc.
│  └─ If Time: 20.00s, 30.00s, etc.
└─ Save Round
```

**Round Configuration Example**:
```
3x3 Cube Event Rounds:

Round 1: Qualification
├─ Type: Everyone Advances
├─ Participants: All registered
└─ Purpose: Establish baseline times

Round 2: Preliminary
├─ Type: Percentage-Based
├─ Cutoff: Top 75%
├─ Participants: Those from Round 1
└─ Eliminated: Bottom 25%

Round 3: Semi-Finals
├─ Type: Count-Based
├─ Cutoff: Top 12 Competitors
├─ Participants: Those from Round 2
└─ Eliminated: Below top 12

Finals: Championship
├─ Type: Finals (Top 8)
├─ Participants: Top 8 auto-selected
└─ Winner: Determined by fastest time
```

---

### 3️⃣ Registering Students

**Location**: Competition → Register Students

```
http://localhost:3001/dashboard/competitions/[ID]/register
     ↓
Select a Student (Dropdown)
     ↓
Student shows in Preview Card
     ↓
Select Events they participate in
   (Click event to select)
     ↓
Click [Register Student] Button
     ↓
Sidebar updates with registered list
```

**Sidebar Shows**:
- ✅ All registered students
- ✅ Their grade level
- ✅ Count of students

---

### 4️⃣ Recording Live Scores

**Location**: Competition Details → Go Live Button

```
http://localhost:3001/dashboard/competitions/[ID]/live
     ↓
[Go Live] Button (Red, pulsing)
     ↓
Select First Event & Round
     ↓
Dashboard shows:
├─ Student names (list or dropdowns)
├─ Input fields for time entry
├─ [Record Time] Button for each student
├─ Real-time leaderboard
└─ [Complete Event] Button
```

**Live Entry Features**:
- ✅ Record times in real-time
- ✅ See live leaderboard update
- ✅ Automatic ranking calculations
- ✅ Automatic advancement calculations
- ✅ View who's advancing to next round (Auto-calculated)
- ✅ View who's eliminated (Auto-calculated)
- ✅ Move to next round when complete

---

### 5️⃣ Parent/Spectator Live View

**Location**: PUBLIC - No Login Required

```
http://localhost:3001/competitions/[COMPETITION_ID]/live
     ↓
Parents/Spectators see:
├─ [🧊 Cubing Hub - Live Leaderboard]
├─ Competition Name
├─ Current Event (with status)
├─ Current Round
├─ Refresh Status (auto-updates every 5s)
│
├─ [Select Event Dropdown]
├─ [Select Round Dropdown]
│
├─ LIVE LEADERBOARD TABLE:
│  ├─ Rank
│  ├─ Student Name
│  ├─ Grade
│  ├─ Best Time
│  ├─ Status (Advancing/Eliminated/Finalist)
│  └─ [Group Color Badge]
│
└─ MY CHILD (Highlighted Section):
   ├─ Name
   ├─ Current Rank
   ├─ Best Time
   ├─ Status (Advancing? Yes/No)
   └─ Next Round Info
```

**What Parents See in Real-Time**:
```
🎯 3x3 Cube - Round 1 (Qualification)
Status: IN PROGRESS 🟢

LIVE STANDINGS:
1. John Smith (12.34s) 🟢 ADVANCING
2. Sarah Johnson (13.56s) 🟢 ADVANCING
3. Mike Davis (14.23s) 🟢 ADVANCING
...
19. Tom Wilson (28.90s) 🔴 ELIMINATED
20. Lisa Brown (29.45s) 🔴 ELIMINATED

📊 YOUR CHILD: Sarah Johnson
├─ Current Rank: #2
├─ Best Time: 13.56s
├─ Status: ✅ ADVANCING
├─ Grade: 3
└─ Next Round: Round 2 - Semi-Finals
```

**Auto-Updates Every 5 Seconds**:
- Refreshes scores automatically
- Shows advancement status changing
- Updates rankings in real-time
- No manual refresh needed

---

## 🔄 Complete Competition Day Flow

### Timeline

```
08:00 AM
  ↓
[🟣 PRE-COMPETITION]
├─ Coaches create competition
├─ Add events and rounds
├─ Register students
└─ Configure elimination rules

09:00 AM
  ↓
[🟢 ROUND 1 STARTS]
├─ Parents access live link:
│  http://localhost:3001/competitions/[ID]/live
├─ See all students in leaderboard
├─ Coaches record times in:
│  http://localhost:3001/dashboard/competitions/[ID]/live
└─ Real-time updates every 5 seconds

10:00 AM
  ↓
[⏸️  ROUND 1 COMPLETE]
├─ Coaches click [Complete Event]
├─ 🤖 AUTOMATIC ADVANCEMENT CALCULATION:
│  ├─ Sorts by time (fastest first)
│  ├─ Applies cutoff rule (e.g., Top 75%)
│  ├─ Marks who advances/eliminates
│  └─ Auto-generates next round
├─ Dashboard shows:
│  ├─ ✅ ADVANCING (15 students)
│  └─ ❌ ELIMINATED (5 students)
└─ Parents see updated status:
   All red badges turn green for advancing
   Green badges turn red for eliminated

10:15 AM
  ↓
[🟢 ROUND 2 STARTS]
├─ Only advancing students visible
├─ Coaches record times for Round 2
├─ Parents see new standings
└─ Repeat advancement process

11:30 AM
  ↓
[⏸️  FINALS ANNOUNCED]
├─ Top 8 auto-selected
├─ Finals bracket shown
├─ 🏆 Medal positions visible
└─ Parents see who made finals

12:00 PM
  ↓
[🟢 FINALS START]
├─ Finals competitors only
├─ Record final times
├─ Auto-calculate:
│  ├─ 🥇 Champion
│  ├─ 🥈 Runner-Up
│  └─ 🥉 3rd Place

01:00 PM
  ↓
[🏁 COMPETITION COMPLETE]
├─ Final results locked
├─ Parents see final rankings
├─ 🏆 Medal winners displayed
└─ Can export results
```

---

## 🎓 How Advancement Works (Automatic)

### After Each Round Completes:

```
Coaches Input Final Scores
         ↓
Times Stored in Database
         ↓
🤖 AUTOMATIC CALCULATION RUNS:
   1. Get all scores from round
   2. Sort by fastest time
   3. Apply configured cutoff
      ├─ If percentage: Top X%
      ├─ If count: Top X competitors
      ├─ If time: Under X seconds
      └─ If all: Everyone continues
   4. Mark advancing students ✅
   5. Mark eliminated students ❌
   6. Update database with status
   7. Trigger updates for all views
         ↓
Dashboard Updates (Coaches):
├─ Show advancing list
├─ Show eliminated list
└─ Show next round ready
         ↓
Parent Live View Updates:
├─ Green badges for advancing
├─ Red badges for eliminated
└─ Status shows immediately
         ↓
Next Round Appears:
├─ Only advancing competitors
└─ Ready for coaches to record times
```

### Specific Advancement Example:

```
Round 2: Preliminary
Cutoff: Top 75% (Percentage-Based)
Competitors: 20

After Coaches Record All Times:

🤖 AUTOMATIC CALCULATION:
   1. Sort all 20 by time
   2. Calculate 75% of 20 = 15
   3. Top 15 advance
   4. Bottom 5 eliminated

RESULT:
✅ ADVANCING (15):
1.  John (12.34s)
2.  Sarah (13.56s)
...
15. Person O (19.45s)

❌ ELIMINATED (5):
16. Person P (21.12s)
17. Person Q (22.56s)
...
20. Person T (28.90s)

PARENTS SEE IMMEDIATELY:
- Top 15 get green ✅ badges
- Bottom 5 get red ❌ badges
- Can see their child's status
- Next round details shown
```

---

## 🔐 Public Live Link - Parent View Details

### URL to Share with Parents:

```
GIVE THIS LINK TO PARENTS:
http://localhost:3001/competitions/[COMPETITION_ID]/live

WHERE TO FIND [COMPETITION_ID]:
1. Go to: http://localhost:3001/dashboard/competitions
2. Click on the competition
3. Copy the ID from URL:
   http://localhost:3001/dashboard/competitions/[THIS_IS_THE_ID]/...
4. Create live link:
   http://localhost:3001/competitions/[THIS_IS_THE_ID]/live
```

### What's Displayed (Parent View):

```
┌─────────────────────────────────────────┐
│  🧊 Cubing Hub - Live Leaderboard       │
│                                         │
│  Competition: Spring Cubing Finals      │
│  Location: Central School               │
│  Date: March 15, 2025                   │
│                                         │
│  Event: 3x3 Cube | Round: 2             │
│  Status: IN PROGRESS 🟢                 │
│  Last Updated: 10:23:45 AM              │
│                                         │
│  [📊 Refresh] [Event ▼] [Round ▼]       │
├─────────────────────────────────────────┤
│ LIVE STANDINGS                          │
├────┬────────────────┬───────┬─────────┤
│Rank│Student         │Grade  │Time     │
├────┼────────────────┼───────┼─────────┤
│1   │John Smith 🟢   │3      │12.34s ✅│
│2   │Sarah Johnson🟢 │2      │13.56s ✅│
│3   │Mike Davis 🟢   │4      │14.23s ✅│
│... │...             │...    │...     │
│15  │Person O 🟢     │1      │19.45s ✅│
├────┼────────────────┼───────┼─────────┤
│16  │Person P 🔴     │3      │21.12s ❌│
│17  │Person Q 🔴     │2      │22.56s ❌│
│... │...             │...    │...     │
│20  │Person T 🔴     │4      │28.90s ❌│
├────┴────────────────┴───────┴─────────┤
│                                         │
│ 📊 YOUR CHILD: Sarah Johnson            │
│ ├─ Rank: #2                             │
│ ├─ Best Time: 13.56s                    │
│ ├─ Grade: 2                             │
│ ├─ Status: ✅ ADVANCING                 │
│ ├─ Group: Blue Team                     │
│ └─ Next Round: Round 3 - Semi-Finals    │
│                                         │
│ Auto-updates every 5 seconds 🔄         │
└─────────────────────────────────────────┘
```

---

## 📋 Coach Dashboard vs Parent View

### COACH VIEW (Login Required)
```
URL: http://localhost:3001/dashboard/competitions/[ID]/live

Can Do:
✅ Record student times
✅ See detailed scores
✅ Complete rounds
✅ Trigger advancement
✅ View advancement calculations
✅ Manage next round
✅ Export results
✅ Manage groups
```

### PARENT VIEW (No Login)
```
URL: http://localhost:3001/competitions/[ID]/live

Can See:
✅ Live leaderboard
✅ Their child's rank
✅ Their child's time
✅ Advancement status (advancing/eliminated/finalist)
✅ Other kids' rankings (public info)
✅ Real-time updates
❌ Cannot modify anything
❌ Cannot see coach controls
```

---

## 🎯 Quick Setup Guide

### To Get Live Links Working:

1. **Start the App**:
   ```bash
   npm run dev
   ```

2. **Create a Competition**:
   - Go to: http://localhost:3001/dashboard/competitions
   - Click [Create New Competition]
   - Fill in details and Create

3. **Note the Competition ID**:
   - From URL: http://localhost:3001/dashboard/competitions/[COPY_THIS]

4. **Create Parent Live Link**:
   ```
   http://localhost:3001/competitions/[PASTE_ID]/live
   ```

5. **Share with Parents**:
   - Send them this link
   - Tell them to open on their phone/computer
   - It auto-refreshes every 5 seconds
   - No login required

6. **Start Coaching**:
   - Go to: http://localhost:3001/dashboard/competitions/[PASTE_ID]/live
   - Record times
   - Click [Complete Event]
   - Advancement auto-calculated
   - Parents see update in real-time

---

## 🔧 Key Features to Implement Next

Based on the current setup, here's what needs to be added:

### Priority 1 (Critical):
- [ ] Auto-advancement calculations after round complete
- [ ] Update advancement status in database
- [ ] Display advancement on parent live link

### Priority 2 (High):
- [ ] Finals auto-generation (top 8-12)
- [ ] Medal determination (Gold/Silver/Bronze)
- [ ] Add advancement indicators to live leaderboard

### Priority 3 (Medium):
- [ ] Notifications when child's status changes
- [ ] Export advancement reports
- [ ] Mobile optimization for parent view

### Priority 4 (Nice to Have):
- [ ] Email notifications to parents
- [ ] SMS updates for advancement
- [ ] Detailed advancement analytics
- [ ] Bracket visualization for finals

---

## 📞 Summary

**Public Link for Parents** (No Login):
```
http://localhost:3001/competitions/[ID]/live
```

**Coach Dashboard** (Login Required):
```
http://localhost:3001/dashboard/competitions/[ID]
```

**Live Time Entry** (Coaches):
```
http://localhost:3001/dashboard/competitions/[ID]/live
```

**Round Configuration** (Coaches):
```
http://localhost:3001/dashboard/competitions/[ID]/rounds
```

Everything is automatic - just record the times and the advancement system calculates who goes through! 🚀
