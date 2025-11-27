# 🎲 Cubing Hub - Competition Management System

A modern web application for managing Rubik's Cube competitions. Built with Next.js, React, TypeScript, and Supabase.

**Status**: Production-Ready | **Last Updated**: December 2024 | **Version**: 1.0.0

## ✨ Features

- **🏆 Competition Management** - Create and manage competitions with multiple events
- **📝 Student Registration** - Register students for competitions with event selection
- **⏱️ Live Time Entry** - Real-time scoring and leaderboard updates with attempt tracking
- **📊 Rankings & Statistics** - View rankings by grade, overall winners, and fastest girl cuber
- **👥 Group Management** - Organize students into groups for competition rounds
- **📈 Standings & Results** - Real-time standings and detailed competition results
- **🎯 Round Advancement** - Automatic calculation of advancing competitors based on criteria
- **📊 Real-time Leaderboards** - Live rankings with record-breaking badges during competitions

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase Account** - [Sign up free](https://supabase.com/)

### Windows Users (Easiest)

Simply double-click the scripts in File Explorer:

1. **First Time Only**: Double-click `setup.bat`
   - Installs dependencies
   - Creates configuration file
   - Builds the project

2. **Configure Supabase**: Edit `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start the Server**: Double-click `run.bat`
   - Server starts automatically
   - Open http://localhost:3000 in your browser

### Mac/Linux Users

Open Terminal in the project directory:

```bash
# First time only: Setup
chmod +x setup.sh
./setup.sh

# Configure Supabase (edit .env.local with your credentials)

# Every time: Run the app
chmod +x run.sh
./run.sh
```

### Manual Setup (All Platforms)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from template
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials

# 4. Build the project
npm run build

# 5. Start development server
npm run dev
```

## 🌐 Accessing the App

Once the dev server starts, you'll see:

```
✓ Ready in X.Xs

- Local:        http://localhost:3000
- Network:      http://[YOUR-IP]:3000
```

### Local Access
- Open **http://localhost:3000** in your browser

### Network Access (Share with Others)
- Use **http://[YOUR-IP]:3000** to access from other devices
- Your IP address is shown when the server starts
- Both devices must be on the same network

## 🗂️ Project Structure

```
cubing-hub/
├── src/
│   ├── app/                    # Next.js pages and routes
│   │   ├── dashboard/          # Admin dashboard
│   │   │   └── competitions/   # Competition management
│   │   └── login/              # Authentication
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Database client
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper functions
│   └── styles/                 # Global styles
├── database/                   # SQL migration files
├── public/                     # Static assets
├── setup.bat / setup.sh        # Setup scripts
├── run.bat / run.sh            # Run scripts
└── package.json               # Dependencies
```

## 🔧 Supabase Setup

### Getting Your Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the SQL from `database/schema.sql`
4. Run the query
5. Repeat for any other migration files in the `database/` folder

## 📱 Using the App

### Admin Dashboard
1. Navigate to `/dashboard`
2. Create a new competition
3. Add events and configure rounds
4. Register students for the competition
5. Go "Live" to start recording times

### Competition Overview
- View registered students
- See real-time rankings (by grade, overall, fastest girl cuber)
- Manage competition events

### Live Time Entry
- Record student solve times
- View live leaderboard
- Monitor round progress

## 🐛 Troubleshooting

### "Port 3000 already in use"
The app will automatically try ports 3001, 3002, etc. Check the terminal output for which port is being used.

### "Cannot find module"
Run `npm install` again to ensure all dependencies are installed.

### Database errors
Make sure:
- Supabase credentials in `.env.local` are correct
- Database migrations have been applied
- Your Supabase project is active

### Hydration mismatch warning
This is a development-only warning caused by browser extensions (usually Grammarly). It doesn't affect functionality and won't appear in production.

## 📚 Documentation

See the following files for more details:
- `GETTING_STARTED.md` - Initial setup guide
- `COMPETITION_MANAGEMENT_GUIDE.md` - Managing competitions
- `FEATURES_OVERVIEW.md` - Feature descriptions
- `DATABASE_SETUP_INSTRUCTIONS.md` - Database configuration

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Testing & Quality
npm run lint        # Run linter
npm run type-check  # Check TypeScript types
```

## 📝 Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: n8n Webhooks
N8N_WEBHOOK_URL=https://n8n.example.com/webhook
N8N_API_KEY=your-n8n-api-key
```

## 🤝 Testing Checklist

Before sharing with others, test:

- [ ] App starts without errors
- [ ] Can create a competition
- [ ] Can register students
- [ ] Can view rankings
- [ ] Can record times in live entry
- [ ] Can view real-time standings

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed documentation files
3. Check browser console for error messages (F12 or Ctrl+Shift+I)
4. Ensure Supabase credentials are correct

## 🎯 Next Steps for Testing

1. **Run the setup script** (`setup.bat` or `./setup.sh`)
2. **Configure your Supabase database** (instructions in setup)
3. **Start the app** (`run.bat` or `./run.sh`)
4. **Create a test competition** in the dashboard
5. **Register test students** with various grades
6. **Record some times** in live entry
7. **View rankings** on the competition overview page

---

## 📊 Understanding the App Flow

### User Journey - Competition Organizer

```
Dashboard Home
    ↓
Create Competition (or select existing)
    ├─→ Add Events (2x2, 3x3, Pyraminx, etc.)
    ├─→ Configure Rounds (Qualifying, Semi-Final, Final)
    └─→ Register Students (with grade/school info)
        ↓
    Enter Groups (assign students to groups for rounds)
        ↓
    Go "LIVE" to Start Competition
        ├─→ Record student solve times
        ├─→ View Real-time Leaderboards
        ├─→ Track Round Progress
        └─→ Complete Round → Calculate Advancement
        ↓
    View Final Standings & Rankings
        └─→ Export Results
```

### User Journey - Spectator/Parent

```
Public Results Page
    ├─→ View Competition List
    ├─→ Select Competition
    └─→ View Live Leaderboard & Rankings
            ├─→ Rankings by Grade
            ├─→ Overall Winners
            ├─→ Fastest Cubers
            └─→ Record-Breaking Attempts
```

### Data Flow - Live Competition Entry

```
1. Organizer selects Event → Round → Group → Student
   ↓
2. System loads student's current times from database
   ↓
3. Organizer enters solve time (in MM:SS.MS format) or marks DNF
   ↓
4. System validates input and calculates best/average
   ↓
5. Rankings are recalculated in real-time
   ↓
6. Leaderboard updates instantly for all spectators
   ↓
7. Student marked as "complete" when all attempts recorded
   ↓
8. Round completed → Advancement criteria applied
```

## 🗂️ What to Look At - File Guide for New Contributors

### Core Pages (Start Here)

**Competition Management:**
- `src/app/dashboard/competitions/page.tsx` - List all competitions (admin view)
- `src/app/dashboard/competitions/[id]/page.tsx` - Competition overview
- `src/app/dashboard/competitions/new/page.tsx` - Create new competition

**Live Competition Entry (Most Complex):**
- `src/app/dashboard/competitions/[id]/live/page.tsx` - **Main feature** - where live time entry happens
  - ~600 lines of logic for time input, ranking calculations, real-time updates
  - Look for: `updateStudentRanking()`, `submitTime()`, `completeRound()`
  - This is where the recent error logging improvements were made

**Student Registration:**
- `src/app/dashboard/competitions/[id]/register/page.tsx` - Register students for competitions
- `src/app/dashboard/students/page.tsx` - Manage all students

**Public Spectator Pages:**
- `src/app/results/[id]/page.tsx` - Public competition results view
- `src/app/competitions/[id]/live/page.tsx` - Public live leaderboard (real-time for spectators)
- `src/app/rankings/page.tsx` - Overall rankings across all competitions

### Utility Functions (Business Logic)

**Ranking Calculations:**
- `src/lib/utils/ranking.ts` - Core ranking algorithm (sorts by best, then average)
- `src/lib/utils/rankings.ts` - Statistics and ranking by grade/school

**Round Advancement:**
- `src/lib/utils/apply-advancement.ts` - Calculates who advances to next round
  - Supports: percentage-based, count-based, time cutoff, or all advance
  - Used after completing a round

**Badge System:**
- `src/lib/utils/badges.ts` - Determines record-breaking badges
  - "New Personal Best", "New School Record", "New Grade Record"

**Completion Logic:**
- `src/lib/utils/event-completion.ts` - Checks if all students have submitted times

### Database & API

**Supabase Client:**
- `src/lib/supabase/client.ts` - Browser-side database client
- `src/lib/supabase/server.ts` - Server-side database client
- `src/lib/supabase/middleware.ts` - Auth middleware for route protection

**Type Definitions:**
- `src/lib/types/database.types.ts` - Auto-generated TypeScript types from Supabase schema

### UI Components

**Core Components:**
- `src/components/ui/` - Pre-built shadcn/ui components (Button, Card, Dialog, Table, etc.)

## 🧪 Testing Checklist - Step by Step

### Phase 1: Setup & Connectivity
- [ ] Dependencies install without errors (`npm install`)
- [ ] `.env.local` is configured with valid Supabase credentials
- [ ] Database migrations are applied (`setup.sql` in Supabase)
- [ ] App starts without errors (`npm run dev`)
- [ ] No console errors when opening http://localhost:3000

### Phase 2: Dashboard Navigation
- [ ] Can access `/dashboard`
- [ ] Dashboard sidebar loads all menu items
- [ ] Can navigate between pages without errors
- [ ] Page reloads don't break navigation state

### Phase 3: Competition Creation
- [ ] Create new competition with title and date
- [ ] Add events (2x2, 3x3, Pyraminx, etc.)
- [ ] Configure rounds (Qualifying, Semi-Final, Final)
- [ ] Save competition successfully
- [ ] Competition appears in competition list

### Phase 4: Student Registration
- [ ] Import/register students with name, grade, school
- [ ] Can select which events each student participates in
- [ ] Student list displays correctly
- [ ] Can edit student info
- [ ] Student count matches what was registered

### Phase 5: Group Management
- [ ] Create groups and assign students
- [ ] Groups show correct student counts
- [ ] Can edit/reassign students between groups
- [ ] Group colors display correctly

### Phase 6: Live Time Entry (THE CRITICAL FEATURE)

**Basic Entry:**
- [ ] Go to Live page for a competition
- [ ] Select Event → Round → Group → Student
- [ ] Student's previous attempts display (if any)
- [ ] Can enter solve time in MM:SS.MS format
- [ ] DNF checkbox works
- [ ] Time is saved to database
- [ ] Current attempt counter increments

**Real-time Ranking Updates:**
- [ ] After entering a time, leaderboard updates instantly
- [ ] Best time is correctly identified
- [ ] Average (of all 5 attempts) is calculated correctly
- [ ] Students are ranked correctly (best time, then average)
- [ ] Rankings update for other users viewing live leaderboard

**Attempt Tracking:**
- [ ] Attempt counter increments correctly (1-5)
- [ ] Can't enter more than 5 attempts per round
- [ ] All previous attempts visible for the student
- [ ] DNF attempts show as "DNF" instead of time

**Record-Breaking Badges:**
- [ ] Personal best trigger "New Personal Best" badge
- [ ] School records trigger "School Record" badge (if applicable)
- [ ] Grade records trigger "Grade Record" badge (if applicable)
- [ ] Badges display in leaderboard

**Error Scenarios:**
- [ ] Invalid time format shows error message
- [ ] Zero or negative times show error
- [ ] Missing round selection prevents submission
- [ ] Duplicate entries are handled correctly
- [ ] Network errors show user-friendly message

### Phase 7: Round Completion & Advancement
- [ ] Can complete current round
- [ ] Configure advancement criteria (%, count, time, all)
- [ ] Advancement calculates correctly based on criteria
- [ ] Results show who advanced vs who is eliminated
- [ ] Can view detailed advancement report

### Phase 8: Rankings & Results
- [ ] View standings for current competition
- [ ] Standings show correct ranking order
- [ ] Grade-based rankings filter correctly
- [ ] Overall winners are ranked correctly
- [ ] Export data functionality works (if available)

### Phase 9: Public Spectator Pages
- [ ] Public results page shows competition list
- [ ] Can view live leaderboard (real-time updates)
- [ ] Live leaderboard shows accurate current standings
- [ ] Public page doesn't allow editing (read-only)
- [ ] Multiple users can view same leaderboard simultaneously

### Phase 10: Data Persistence
- [ ] Close and reopen app - live state persists (localStorage)
- [ ] Refresh page during live competition - state maintained
- [ ] Database updates persist across sessions
- [ ] No data loss on page reload

### Phase 11: Edge Cases
- [ ] Very fast times (< 5 seconds) display correctly
- [ ] Very slow times (> 5 minutes) display correctly
- [ ] Multiple DNF attempts in same round handled correctly
- [ ] Students with only DNF in a round rank appropriately
- [ ] Large number of students (100+) perform well

### Phase 12: Performance
- [ ] Live leaderboard updates within 1-2 seconds
- [ ] No lag when entering times rapidly
- [ ] Page doesn't slow down with 50+ students
- [ ] Real-time updates work for multiple concurrent users

## 🔍 Debugging Guide

### Common Issues & Solutions

**Issue: "Cannot find module" errors**
```bash
# Solution: Reinstall dependencies
npm install

# If that fails, clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue: Supabase connection errors**
- Check `.env.local` has correct credentials
- Verify Supabase project is active (not paused)
- Test credentials at: https://supabase.io/dashboard
- Check browser console for specific error message

**Issue: Times not updating in real-time**
- Check Supabase is configured for real-time (Database → Replication)
- Verify database subscription is active in code
- Check Network tab in DevTools for failed API calls
- Look for errors in browser console

**Issue: Ranking calculations wrong**
- Review logic in `src/lib/utils/ranking.ts`
- Check that times are in milliseconds (not seconds)
- Verify DNF times are handled correctly
- Test with known values and compare to manual calculation

**Issue: Page crashes after selecting options**
- Look for null pointer exceptions in console
- Verify all foreign keys exist in database
- Check that student/group/round/event IDs are valid
- Add null checks in components

### Debugging Tools

**Browser DevTools (F12 or Ctrl+Shift+I):**
- Console tab: View error messages and logs
- Network tab: See API calls to Supabase
- Application tab: View localStorage and state
- Elements tab: Inspect DOM structure

**Next.js Terminal:**
- Watch for TypeScript errors during development
- Check for hydration mismatch warnings (usually safe to ignore)
- Look for database query errors

**Supabase Dashboard:**
- View logs at: Logs → Functions & Realtime
- Check database schema matches code expectations
- Verify row-level security (RLS) policies allow operations
- Monitor database usage and quotas

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 19 with Next.js 15 (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React hooks + localStorage
- **Real-time**: Supabase Realtime subscriptions
- **Icons**: Lucide React

### Key Patterns

**Real-time Data Flow:**
```
User Action → Supabase Update → Broadcast to Subscribers → UI Update
```

**Ranking Calculation:**
```
New Time Entered → Calculate Best (min) → Calculate Average →
Re-rank All Students → Update Leaderboard → Update Badges
```

**Component Structure:**
- Pages handle data loading and routing
- Utilize Supabase client for queries
- Pass data and callbacks to child components
- Components use React hooks for local state
- Tailwind + shadcn/ui for consistent styling

## 🤝 Contributing Guidelines

### Before Starting

1. **Read CLAUDE.md** - Project-specific instructions
2. **Review recent commits** - Understand current work
3. **Check git branches** - Ask which branch to work on
4. **Set up local development** - Run setup script

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make focused changes** - One feature per PR
3. **Test thoroughly** - Use the testing checklist above
4. **Check console for errors** - Fix warnings and errors
5. **Type-check code** - Run `npm run type-check`

### Submitting Work

1. **Write clear commit messages**
   ```
   feat: Add feature description
   fix: Fix description
   improve: Improvement description
   ```

2. **Test one more time** before pushing
3. **Create pull request** with description
4. **Link to any related issues**
5. **Wait for review** before merging

### Code Style

- Use TypeScript for type safety
- Follow component naming conventions (PascalCase)
- Use meaningful variable names
- Add comments for complex logic
- Format with Prettier (auto on save if configured)

## 📈 Performance Optimization Tips

1. **Lazy load heavy components** - Use React.lazy()
2. **Memoize expensive functions** - useMemo/useCallback
3. **Optimize database queries** - Use select() to get only needed fields
4. **Batch realtime updates** - Debounce rapid changes
5. **Monitor bundle size** - Check what's being included

## 🚀 Deployment

The app is production-ready and can be deployed to:
- Vercel (recommended - same company as Next.js)
- Any Node.js hosting (Heroku, Railway, etc.)
- Docker containers

Key before deploying:
1. Build locally: `npm run build`
2. Set environment variables on hosting platform
3. Run database migrations
4. Test critical flows one more time
5. Set up monitoring/error tracking

## 📞 Getting Help

### Check These First
1. Run `npm install` - Missing dependencies?
2. Check `.env.local` - All credentials correct?
3. Check browser console (F12) - Error message?
4. Search in `src/` files - How is this feature done elsewhere?

### If Still Stuck
1. Check git log for recent changes
2. Look at TypeScript types - What does code expect?
3. Review database schema - Does it match expectations?
4. Test in isolation - Create small test file
5. Ask project owner or lead developer

---

**Happy cubing! 🎲**
