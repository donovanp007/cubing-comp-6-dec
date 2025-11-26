# Complete Competition Management System Guide

**Version**: 2.0 - Live Competition Features
**Date**: November 24, 2025
**Status**: Ready for Database Setup

---

## 🎯 Overview

Your competition management system now supports:
- ✅ Multi-event competitions (3x3, 2x2, Pyraminx, etc.)
- ✅ Multi-round structures per event
- ✅ Student grouping (automatic + manual)
- ✅ Live time entry for coaches
- ✅ Real-time parent views
- ✅ Position-based advancement rules
- ✅ WCA-style competition format

---

## 🏗️ New Architecture

### New Database Tables

**1. `competition_groups`**
- Stores group definitions per competition
- Includes color coding for visual identification
- Fields: `id`, `competition_id`, `group_name`, `color_hex`, `color_name`, `sort_order`

**2. `group_assignments`**
- Links students to groups
- Tracks which student belongs to which group
- Fields: `id`, `competition_id`, `student_id`, `group_id`, `assigned_at`

**3. `competition_live_state`**
- Tracks current state during live event
- Stores active event, round, group, and student
- Enables real-time competition flow

**4. `group_colors` (Reference Table)**
- Predefined palette: Red, Orange, Yellow, Green, Blue, Purple, Pink, Cyan
- Used for automatic group color assignment

### Updated Tables

**`results` table additions:**
- `solve_started_at` - When student started attempt
- `solve_completed_at` - When student finished attempt
- `judge_notes` - Judge observations

---

## 🎬 New Pages & Features

### 1. Competition Overview
**Page**: `/dashboard/competitions/[id]`

**What's New:**
- Navigation tabs to access Groups, Live Entry, and Results
- Shows competition status, date, location, events, participants
- Quick student registration
- Event status indicators
- Participant table with registration details

**Tabs Available:**
- Overview (current page)
- Groups (manage student grouping)
- Live Entry (coach interface for entering times)

---

### 2. Student Grouping Page
**Page**: `/dashboard/competitions/[id]/groups`

**Features:**

#### Automatic Grouping
```
Steps:
1. Specify number of groups (1-8)
2. Click "Create Groups"
3. System:
   - Creates groups with auto-assigned colors
   - Names them: Group A, Group B, Group C...
   - Distributes students evenly across groups
```

#### Manual Assignment
```
Steps:
1. Drag students between group cards
2. Drop to assign to new group
3. Click remove (X) to unassign
4. Color coding shows group visually
5. Student count updates in real-time
```

#### Visual Design
- Each group has a distinct color bar (top of card)
- Group name and student count visible
- Students listed with grade information
- Unassigned students section at bottom

---

### 3. Live Time Entry Page
**Page**: `/dashboard/competitions/[id]/live`

**Features:**

#### Controls
```
- Event selector (dropdown)
- Round selector (dropdown)
- Group selector (color-coded)
- Live/Stopped status indicator
```

#### Time Entry Interface
```
Quick numeric entry:
- Type "2534" = 25.34 seconds
- Type "1234" = 12.34 seconds
- Shows time preview below input
- Press Enter to record

Attempt tracking:
- Display: 1/5, 2/5, 3/5, 4/5, 5/5
- Auto-increments after each entry
- Resets after all 5 attempts

DNF Option:
- Checkbox for "Did Not Finish"
- Marks attempt as DNF
- Still counts as attempt
```

#### Student Queue
- Shows all students in selected group
- Quick selection for which student's time being entered
- Visual feedback of current competitor

#### Data Storage
- Each attempt saved immediately to database
- Links to: round_id, student_id, attempt_number
- Stores time in milliseconds
- Records coach who entered time
- Timestamp of entry

---

### 4. Public Live Parent View
**Page**: `/competitions/[id]/live`

**Features:**

#### Live Rankings
```
Shows:
- Position with medals (🥇🥈🥉)
- Group assignment (color-coded badge)
- Student name and grade
- Best time (fastest single attempt)
- Average time (middle 3 of 5)
- Progress (3/5 solves complete)

Auto-refreshes: Every 5 seconds
```

#### Group Status Dashboard
```
For each group:
- Group color indicator
- Group name
- Progress bar: X/Y students completed
- Completion percentage

Helps parents see:
- Which group is currently competing
- How many students finished
- Which group is next
```

#### Header Information
```
- Competition name
- Live/Offline status badge
- Competition location
- Last update timestamp
- Auto-refresh indicator
```

---

## 📊 Complete Competition Flow

### Step-by-Step Workflow

```
PHASE 1: SETUP
└─ Dashboard → Competitions → New Competition
   ├─ Enter: Name, Description, Location, Date/Time
   ├─ Select: Events (3x3, 2x2, Pyraminx, etc.)
   ├─ Set: Max participants, Visibility
   └─ Auto-creates: Round 1 for each event

PHASE 2: REGISTRATION
└─ Competition Detail → Participants
   ├─ Quick-add students via dropdown
   ├─ Shows: Registered count, status
   ├─ Can: Register before competition starts
   └─ Stores: Registration date, status

PHASE 3: GROUPING
└─ Competition Detail → Groups Tab
   ├─ Auto-create: Specify # groups → click Create
   │   └─ System distributes students evenly
   ├─ Manual override: Drag-drop students
   ├─ Color-coded: Visual group identification
   └─ Result: Students assigned to groups

PHASE 4: LIVE EVENT (COACH)
└─ Competition Detail → Live Entry Tab
   ├─ Select: Event, Round, Group
   ├─ Start: Click "Go Live"
   ├─ Enter: Times using quick numeric (2534 = 25.34s)
   ├─ Track: Auto-increment attempts (1/5 → 5/5)
   ├─ Save: Each attempt stored immediately
   └─ Manage: Go through all students

PHASE 5: LIVE EVENT (PARENTS)
└─ Public URL: /competitions/[id]/live
   ├─ View: Live rankings updating every 5 seconds
   ├─ See: Group colors and assignments
   ├─ Track: Progress (3/5 solves complete)
   ├─ Follow: Group status dashboard
   └─ Share: URL with parents/spectators

PHASE 6: ADVANCEMENT (Future)
└─ Configure: Round advancement rules
   ├─ Position-based: Top 50%, Top 25%, Top 8, etc.
   ├─ Auto-calculate: Who advances to next round
   └─ Update: Competition event status
```

---

## ⚙️ Time Entry Details

### Quick Numeric Entry System

**How It Works:**

```javascript
Input Examples:
"5"       → 5.0 seconds   → 5000ms
"234"     → 23.4 seconds  → 23400ms
"2534"    → 25.34 seconds → 25340ms
"1234"    → 12.34 seconds → 12340ms

The system:
1. Parses input as string
2. Removes all non-digits
3. Converts to integer
4. Applies scale factor:
   - < 100 → multiply by 10
   - < 10000 → multiply by 10
   - else → already milliseconds
5. Displays as formatted time
```

**Coach Tips:**
- Just type numbers, no decimals needed
- Fast for rapid-fire time entry
- Preview shows before recording
- Press Enter to quickly advance
- Easy for high-volume competition

---

## 🎨 Color System

### Group Colors (Automatic Assignment)

```
Palette (8 colors):
1. Red      (#EF4444)
2. Orange   (#F97316)
3. Yellow   (#EAB308)
4. Green    (#22C55E)
5. Blue     (#3B82F6)
6. Purple   (#A855F7)
7. Pink     (#EC4899)
8. Cyan     (#06B6D4)

Assignment:
- Groups 1-8: Color 1-8
- Groups 9+: Cycle back to color 1

Visual Use:
- Group cards: Top border in group color
- Badges: Background with transparency
- Live view: Color-coded participant badges
- Group status: Color dot indicator
```

---

## 📱 Responsive Design

All pages work on:
- **Mobile** (320px+): Stacked layout, single column
- **Tablet** (768px+): 2-3 column layouts
- **Desktop** (1024px+): Full multi-column layouts

### Mobile Optimizations:
- Dropdown controls for selection
- Touch-friendly buttons
- Auto-scrolling tables
- Simplified status indicators

---

## 🔄 Real-Time Updates

### Parent Live View Auto-Refresh
```
Every 5 seconds:
1. Fetch latest final_scores
2. Calculate best/average times
3. Get group assignments
4. Update rankings
5. Refresh group status bars
6. Show last update time
```

### Data Freshness
- Coach enters time → Saved immediately
- Parents see within 5 seconds
- No polling delays
- Smooth experience

---

## 📊 Data Structure Reference

### Competition Flow
```
Competition
├─ competition_events (multiple)
│  ├─ event_types (3x3, 2x2, etc.)
│  └─ rounds (Round 1, 2, 3...)
│     ├─ results (individual attempts)
│     │  └─ time_milliseconds
│     └─ final_scores (calculated)
│        ├─ best_time_milliseconds
│        └─ average_time_milliseconds
│
├─ registrations (students competing)
│
├─ competition_groups (grouping system)
│  └─ group_assignments (student → group)
│
└─ competition_live_state (current state)
   └─ current_event_id
   └─ current_round_id
   └─ current_group_id
   └─ current_student_id
```

---

## 🔐 Security & Access

### Who Can Access?

**Coaches** (Dashboard):
- `/dashboard/competitions` - Full management
- `/dashboard/competitions/[id]` - Overview & registration
- `/dashboard/competitions/[id]/groups` - Grouping management
- `/dashboard/competitions/[id]/live` - Time entry

**Parents** (Public):
- `/competitions/[id]/live` - Live results view (read-only)
- Auto-refresh every 5 seconds
- No ability to modify

**Students** (Future):
- View own results
- Track personal bests
- See badges earned

---

## ✅ Implementation Checklist

Before going live, ensure:

### Database Setup
- [ ] Run `database/competition-groups-schema.sql` in Supabase
- [ ] Verify all 4 new tables created
- [ ] Verify views created
- [ ] Verify RLS policies enabled

### Testing - Grouping
- [ ] Create test competition
- [ ] Register 10+ students
- [ ] Test auto-grouping (create 3 groups)
- [ ] Test manual drag-drop reassignment
- [ ] Verify colors display correctly
- [ ] Check unassigned section

### Testing - Time Entry
- [ ] Test numeric entry: "2534" → 25.34s
- [ ] Test Enter key to auto-advance
- [ ] Test DNF checkbox
- [ ] Verify 5 attempts per student
- [ ] Check data saved to database

### Testing - Parent View
- [ ] Access `/competitions/[id]/live`
- [ ] Verify auto-refresh works
- [ ] Check group status bars
- [ ] Confirm medals (🥇🥈🥉) display
- [ ] Test on mobile device

### Testing - Navigation
- [ ] Overview tab links correctly
- [ ] Groups tab opens grouping page
- [ ] Live Entry tab opens time entry
- [ ] Back buttons work
- [ ] Responsive on mobile

---

## 🐛 Troubleshooting

### Issue: Groups not appearing
**Solution:**
- Verify students are registered first
- Check that competition_groups table created
- Run: `SELECT * FROM competition_groups WHERE competition_id = '[comp_id]'`

### Issue: Time entry not saving
**Solution:**
- Verify round_id is selected
- Check that student is registered
- Look for console errors
- Check Supabase > SQL Editor > Logs

### Issue: Parent view not auto-refreshing
**Solution:**
- Check browser console for errors
- Verify final_scores table has data
- Try manual refresh (F5)
- Check internet connection

### Issue: Colors not showing
**Solution:**
- Verify color_hex field has valid hex code
- Check CSS class names match
- Clear browser cache (Ctrl+Shift+Delete)

---

## 🚀 Performance Tips

1. **For Large Groups (50+ students):**
   - Create 8 groups for better distribution
   - Use auto-grouping for speed

2. **For Time Entry:**
   - One coach per group for efficiency
   - Use numeric entry for speed
   - Batch similar attempts together

3. **For Parent View:**
   - Share unique URL (bookmark it)
   - Works great on 3-4 devices simultaneously
   - Mobile-friendly for parent phones

---

## 📖 Database Migration

### To Apply Updates:

1. **Copy SQL file:**
   - Open: `database/competition-groups-schema.sql`

2. **Run in Supabase:**
   - Go to: Supabase Dashboard → SQL Editor
   - Click: "New Query"
   - Paste: Entire SQL file content
   - Click: "Run"

3. **Verify:**
   - Check: Tables Editor → See new tables
   - Confirm: 4 new tables + views created

---

## 🎓 Training Guide

### For Coaches:
1. Read: "Competition Flow" section above
2. Practice: Creating test competition
3. Try: Auto-grouping with 3 groups
4. Test: Time entry with mock times
5. Share: Live parent view URL

### For Parents:
1. Share: `/competitions/[id]/live` URL
2. Explain: Auto-refresh every 5 seconds
3. Point out: Color groups, progress bars
4. Show: Their child's position and times

---

## 🔮 Future Enhancements

Planned additions:
- Round advancement automation
- Cutoff time-based rules
- Multiple judges per round
- Video streaming integration
- Award ceremony generator
- PDF competition results report
- Qualification rounds system

---

## 📞 Support

**Having issues?**

1. Check this guide's "Troubleshooting" section
2. Verify database setup (all 4 SQL files run)
3. Check browser console for errors
4. Review "Data Structure Reference" for schema

**Questions about:**
- WCA format? See "Time Entry Details"
- Colors? See "Color System"
- Navigation? See "Complete Competition Flow"

---

**Last Updated**: November 24, 2025
**Next Version**: 2.1 (Round advancement automation)

Your competition management system is now ready for live events! 🎉
