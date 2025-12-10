# Quick Reference - Cubing Hub Features

## 🎯 App URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Homepage** | http://localhost:3001 | Landing page, Coach Dashboard button |
| **Coach Dashboard** | http://localhost:3001/dashboard | Main control center |
| **Competitions** | http://localhost:3001/dashboard/competitions | Manage big events |
| **Termly Leagues** | http://localhost:3001/dashboard/weekly | Weekly competitions & league tracking |
| **Students** | http://localhost:3001/dashboard/students | Add/manage students |
| **Rankings** | http://localhost:3001/dashboard/rankings | (Not yet implemented) |
| **Public Comps** | http://localhost:3001/competitions | Parents view upcoming events |
| **Live Results** | http://localhost:3001/results | 🔴 PARENTS USE THIS - Auto-refreshing leaderboard |
| **Rankings Page** | http://localhost:3001/rankings | Public standings (not implemented) |

---

## 👥 Test Data (Pre-loaded)

### Students
```
✅ Jaden Smith - Grade 5, Class 5A - Email: jaden.smith@school.com
✅ Nelson Johnson - Grade 6, Class 6B - Email: nelson.johnson@school.com
✅ Andrew Williams - Grade 5, Class 5B - Email: andrew.williams@school.com
✅ Zi Chen - Grade 6, Class 6A - Email: zi.chen@school.com
```

### Event Types (Pre-seeded)
```
✅ 3x3x3 (Rubik's Cube)
✅ 2x2x2 (Pocket Cube)
✅ 4x4x4 (Revenge)
✅ 5x5x5 (Professor's Cube)
✅ Pyraminx
✅ Megaminx
✅ Skewb
✅ Square-1
```

### Sample League
```
League Name: "Term 1 2025 League - 3x3x3"
Event: 3x3x3
Period: Jan 27 - Mar 21, 2025 (8 weeks)
Status: Active
Scoring: Position-based (1st=10pts, 2nd=8pts, etc.)
```

---

## 🎮 How to Test Termly Leagues

### Step 1: Create a Competition
```
1. Dashboard → Competitions → New Competition
2. Name: "Week 1 Challenge - 3x3x3"
3. Location: "Online"
4. Date: Today
5. Select Event: 3x3x3 ✓
6. Max Participants: 20
7. Click Create ✓
```

### Step 2: Register Students
```
1. Click on your new competition
2. Scroll down to "Add Student to Competition"
3. Select: Jaden Smith
4. Click "Add Student" ✓
5. Repeat for Nelson, Andrew, Zi
```

### Step 3: Record Times
```
1. Dashboard → Termly Leagues
2. Click "Week 1 Challenge"
3. Click "Record Solves"
4. For each student:
   - Select student
   - Enter 5 solve times (in seconds)
   - Mark DNF if needed
   - Click Save
```

### Step 4: View Live Results (Parent View)
```
1. Go to: http://localhost:3001/results
2. Click on "Week 1 Challenge - 3x3x3"
3. See leaderboard with current rankings
4. Toggle "Live" to auto-refresh every 10 seconds
5. Share this URL with parents! 🎉
```

---

## 📊 What Each Page Does

### Dashboard (`/dashboard`)
- **What**: Control center for coaches
- **Can Do**: See quick stats, navigate to features
- **Data Shown**: Quick overview

### Competitions (`/dashboard/competitions`)
- **What**: Manage big official events
- **Can Do**: Create, view, manage registrations
- **Data Shown**: Upcoming & past competitions
- **Note**: Click entire card to open details

### Termly Leagues (`/dashboard/weekly`)
- **What**: Manage weekly challenges within a term
- **Can Do**: Track cumulative points across weeks
- **Data Shown**: Active leagues, completed leagues
- **Statistics**: Participants, total competitions

### Students (`/dashboard/students`)
- **What**: Manage student database
- **Can Do**: Add, edit, import CSV
- **Data Shown**: All students with grades, classes
- **Features**: Bulk import, search, sort

### Live Results (`/results`)
- **What**: PUBLIC page for parents to watch live
- **Can Do**: View real-time leaderboards
- **Data Shown**: Current rankings, times, PBs
- **Auto-Refresh**: 10 seconds when Live mode on
- **Share**: Safe for public viewing

### Public Competitions (`/competitions`)
- **What**: What parents see when they visit site
- **Can Do**: See upcoming events to register for
- **Data Shown**: Real competitions from database
- **Link**: Navigate to Live Results

---

## 🔑 Key Concepts

### Big Competitions
- Official events (e.g., School Championship)
- Can have multiple events (3x3, 2x2, Pyraminx)
- Have detailed rounds and registration

### Termly Leagues
- **New Feature!** 🎉
- Weekly challenges across an entire term
- Same 20 kids compete each week
- Points accumulate for league standings
- Results in cumulative term winner

### League Standings
- Shows total points for each student
- Updates after each week
- Shows position changes
- Tracks best/worst weeks
- Counts PBs earned

### Weekly Results
- 5 solves per student per week
- Auto-calculates best time & average
- Can mark DNF (Did Not Finish)
- Awards points based on position
- Feeds into league standings

---

## ⚙️ Database Tables (After Setup)

### Core Tables (Already Exist)
```
students          - Student profiles
event_types       - Cube types (3x3, 2x2, etc.)
competitions      - Big official events
registrations     - Student registration for competitions
weekly_competitions - Weekly challenge entries
weekly_results    - 5 solves per student per week
```

### NEW Termly League Tables
```
termly_leagues       - League containers (Term 1 League, etc.)
league_standings     - Cumulative points & rankings
league_points_history - Week-by-week points tracking
```

---

## 🎯 Points System

```
Competition Placement → Points Awarded

1st Place → 10 points
2nd Place → 8 points
3rd Place → 6 points
4th Place → 4 points
5th+ Place → 2 points
DNF → 0 points

Example Week 1:
├─ Zi: 1st place = 10 points
├─ Jaden: 2nd place = 8 points
├─ Nelson: 3rd place = 6 points
└─ Andrew: 4th place = 4 points

After Week 2:
├─ Nelson: 1st place = +10 (total: 16)
├─ Jaden: 2nd place = +8 (total: 16)
├─ Zi: 3rd place = +6 (total: 16)
└─ Andrew: 4th place = +4 (total: 8)

LEAGUE STANDING: Tie between Jaden & Nelson for 1st!
```

---

## 🚀 Features Available Now

### ✅ Implemented
- Create competitions
- Add students
- Register students for events
- Record solve times (5 solves)
- View live leaderboards
- Auto-refresh results (10 sec)
- Podium display (1st, 2nd, 3rd)
- Class/team rankings
- Public competition viewing
- Public live results
- **NEW: Termly league structure**
- **NEW: League standings tables**
- **NEW: Cumulative point tracking**

### ⏳ Coming Soon
- Auto-calculate league points
- League standings display UI
- League management interface
- Student improvement graphs
- Badges & achievements
- Mobile app

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't create competition | Run database setup SQL |
| Can't add students | Students table might not exist - run SQL |
| Dashboard shows blank | Refresh page (Ctrl+Shift+R) |
| Live results not updating | Toggle "Live" mode off/on |
| Can't see test students | Might not be in the database yet |
| RLS errors | Run `database/rls-policies.sql` |

---

## 📱 Mobile/Parent Access

### Share These URLs with Parents

**Live Results**: `http://localhost:3001/results`
- Auto-refreshing leaderboard
- No login needed
- Shows live competition

**Public Competitions**: `http://localhost:3001/competitions`
- See upcoming events
- Register for competitions
- View past results

---

## 🎮 Games/Challenges Ideas

### Using Termly Leagues

1. **Mystery Week** - Don't reveal standings until end of week
2. **Relay** - Points based on improvement from previous week
3. **Themed Weeks** - Blindfolded, one-handed, etc.
4. **Points Multiplier** - Certain days worth 2x points
5. **Streak Bonus** - Extra points for consistent participation
6. **PB Bonus** - 5 bonus points for personal best

---

## 📞 Support Docs

| Document | Purpose |
|----------|---------|
| `GETTING_STARTED.md` | Initial setup (database SQL) |
| `ENHANCEMENTS_COMPLETED.md` | What was fixed & added |
| `NEXT_STEPS.md` | Road map for future features |
| `QUICK_REFERENCE.md` | This file! |
| `database/SETUP_INSTRUCTIONS.md` | Detailed SQL guide |

---

## ⏱️ Typical Week Flow

```
MONDAY (Coach)
├─ Create "Week X" competition entry
├─ Register 20 students
└─ Set times open from 3-5pm

MONDAY-FRIDAY (Students)
├─ Do their 5 solves
├─ Times uploaded to app
└─ Leaderboard updates

FRIDAY AFTERNOON (Coach)
├─ Finalize week (mark as completed)
├─ Auto-calculate points
├─ Update league standings
├─ Announce league positions
└─ Award bonuses if applicable

PARENTS (Anytime)
├─ Check /results for live leaderboard
├─ See student's progress
├─ Check /competitions for upcoming
└─ Share pride on social! 📸
```

---

**Last Updated**: November 24, 2025
**App Status**: Ready for Testing ✅
**Database Setup**: Required (User Action)
