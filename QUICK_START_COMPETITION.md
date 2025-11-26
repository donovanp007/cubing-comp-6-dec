# Live Competition System - Quick Start

**Get started in 3 steps:**

---

## 🚀 STEP 1: Database Setup (5 minutes)

### What to do:
1. Go to **Supabase Dashboard** → SQL Editor
2. Click **"New Query"**
3. Open this file: `database/competition-groups-schema.sql`
4. **Copy entire contents**
5. **Paste** into SQL Editor
6. Click **"Run"**
7. **Wait** for "Success" message

### What this does:
- Creates 4 new database tables
- Creates 3 helpful views
- Creates indexes for speed
- Enables row-level security

✅ You're done with database setup!

---

## 🎯 STEP 2: Create Your First Competition

### Navigate to:
```
Dashboard → Competitions → "New Competition" button
```

### Fill in:
```
Name: "Class A - Round 1"
Description: "First class competition"
Location: "Room 101"
Date: (select today)
Time: (select time)

Select Events:
✅ 3x3x3 Cube
✅ Pyraminx

Max Participants: 20
Public: Yes
```

### Click: "Create Competition"

✅ Competition created!

---

## 👥 STEP 3: Add Students & Create Groups

### Add Students:
```
Competition Detail → Participants section
Select student → Click "Add" button
(Repeat for 8+ students)
```

### Create Groups:
```
Click "Groups" tab
Enter: "2" (number of groups)
Click: "Create Groups" button
→ System creates: Group A (red), Group B (blue)
→ Distributes students evenly
```

✅ Students grouped and ready!

---

## ⏱️ STEP 4: Go Live (Time Entry)

### Start competition:
```
Competition Detail → "Live Entry" tab
Select: Event (3x3x3)
Select: Round (Round 1)
Select: Group (Group A)
Click: "Go Live" button
```

### Enter times:
```
For each student's 5 attempts:
1. Type time (example: "2534" = 25.34 seconds)
2. Press Enter or click "Record Attempt"
3. System shows: "1/5", "2/5", "3/5", "4/5", "5/5"
4. Auto-moves to next student after 5 attempts
```

**Time Entry Tips:**
```
Just type numbers:
"5"       → 5.0 seconds
"234"     → 23.4 seconds
"2534"    → 25.34 seconds
"123456"  → 1:23.45 (mm:ss format)
```

✅ Times being recorded!

---

## 👨‍👩‍👧 STEP 5: Share with Parents

### Copy this URL:
```
https://yourapp.com/competitions/[ID]/live
```

### Send to parents:
```
Share via WhatsApp/Email
They see:
- Live leaderboard (updates every 5 seconds)
- Student positions with medals
- Group colors
- Student progress (2/5 solves done)
- Group status bars
```

### Parents will see:
```
🥇 POSITION  |  NAME        |  TIME    |  PROGRESS
1️⃣  1        |  Jaden Smith |  25.34s  |  5/5 ✅
2️⃣  2        |  Nelson J.   |  26.10s  |  5/5 ✅
3️⃣  3        |  Andrew W.   |  27.50s  |  3/5 ⏳
```

✅ Parents watching live!

---

## 📋 Complete Workflow

```
1. Create Competition
   ↓
2. Add Students
   ↓
3. Create Groups (auto or manual)
   ↓
4. Click "Go Live"
   ↓
5. Enter times (2534 = 25.34s)
   ↓
6. Share URL with parents
   ↓
7. Results appear in real-time
```

---

## 🎨 How Groups Work

### Auto-Create:
```
✓ Specify # of groups (1-8)
✓ Click "Create"
✓ System assigns names: Group A, Group B, etc.
✓ System assigns colors: Red, Blue, Green, etc.
✓ System distributes students evenly
✓ Shows student count per group
```

### Manual Adjustment:
```
✓ Drag student from one group
✓ Drop on another group
✓ Student moves immediately
✓ Counts update in real-time
✓ Perfect for balanced skill grouping
```

---

## ⚡ Time Entry Speed Tips

**Coach Pro Tips:**
```
1. One coach per group (parallel time entry)
2. Use numeric entry (2534 = 25.34s)
3. Press Enter to quick-record
4. Batch similar attempts (all 3x3 attempts first)
5. Have student names/numbers ready
6. DNF checkbox for "Did Not Finish"
```

**Speed Benchmark:**
- Fast entry: 5 students × 5 attempts = 25 times in ~5 minutes
- Time per attempt: ~10-15 seconds

---

## 📱 Mobile Parent View

### Works on:
- ✅ Smartphones
- ✅ Tablets
- ✅ Computers
- ✅ Slow internet (optimized)

### Auto-refreshes:
- Every 5 seconds
- No manual refresh needed
- Shows last update time

---

## 🎯 Next Tasks

After database setup:

**Today:**
- [ ] Create test competition
- [ ] Add 8+ students
- [ ] Create 2 groups
- [ ] Test time entry
- [ ] Share parent URL

**Tomorrow:**
- [ ] Train coaches
- [ ] Run first real competition
- [ ] Gather parent feedback

---

## 🆘 Quick Troubleshooting

**Groups not showing?**
```
→ Check: Did you register students first?
→ Fix: Add students before groups
```

**Time entry not working?**
```
→ Check: Is group selected?
→ Check: Is round selected?
→ Fix: Select both before entering times
```

**Parent view blank?**
```
→ Check: Have you entered times yet?
→ Check: Is URL correct? (/competitions/[id]/live)
→ Fix: Try F5 to refresh
```

**Colors not showing?**
```
→ Check: Did SQL run successfully?
→ Fix: Re-run database-competition-groups-schema.sql
```

---

## 📖 More Help

**For detailed info, see:**
- `COMPETITION_MANAGEMENT_GUIDE.md` - Complete guide
- `LIVE_COMPETITION_IMPLEMENTATION.md` - Technical details
- Browser console (F12) for error messages

---

## ✅ Success Checklist

You're ready when:
- [ ] SQL file ran successfully
- [ ] Competition created
- [ ] 8+ students registered
- [ ] Groups created with colors
- [ ] Can enter times: "2534" → 25.34s
- [ ] Parent URL works
- [ ] Parents see live rankings

---

**That's it! You're ready to run competitions! 🎉**

Questions? Check the COMPETITION_MANAGEMENT_GUIDE.md

Happy competing! 🧊🏆
