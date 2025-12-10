# Cubing Hub - Getting Started Guide

Your app is now running at **http://localhost:3001** with authentication removed!

## What's Done ✅

1. **Removed Dashboard Login Requirement** - The dashboard no longer requires authentication
2. **Fixed Middleware** - Updated to allow public access
3. **App is Running** - Development server is active on port 3001

---

## What Needs to Be Done Next ⚙️

To unlock all features (create competitions, add students, register for events), you need to set up your Supabase database.

### Step 1: Run Database Schema (2 minutes)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to your project **brkaumrhvozwsftvruiu**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. **Copy the entire contents** of: `database/schema.sql`
6. **Paste** into the SQL editor
7. Click **Run** (Ctrl+Enter)
8. You should see ✅ **SUCCESS** with no errors

This creates:
- All 14 database tables
- Indexes for performance
- 8 event types (3x3, 2x2, 4x4, Pyraminx, etc.)
- Badge definitions

---

### Step 2: Configure Row Level Security (RLS) - (2 minutes)

Now enable permissions so the app can read/write data:

1. In the same **SQL Editor**, click **New Query**
2. **Copy the entire contents** of: `database/rls-policies.sql`
3. **Paste** into the SQL editor
4. Click **Run** (Ctrl+Enter)
5. You should see ✅ **SUCCESS** with no errors

This creates policies allowing public read/write access for testing.

---

## Expected Behavior After Setup

Once you complete the 2 steps above, refresh your browser and test:

### ✅ Create a Competition
1. Go to **http://localhost:3001/dashboard/competitions**
2. Click **Create Competition**
3. Fill in: name, location, date, time
4. Check event types (3x3, 2x2, etc.)
5. Click **Create**
6. You should see the competition in the list

### ✅ Add Students
1. Go to **http://localhost:3001/dashboard/students**
2. Click **Add Student**
3. Enter: first name, last name, email, grade, class, school
4. Click **Save**
5. Student appears in the list

### ✅ Register Students for Competitions
1. Go to **http://localhost:3001/dashboard/competitions**
2. Click on a competition
3. Select a student from the dropdown
4. Click **Add Student to Competition**
5. Student now appears in the competition registration list

---

## File Locations

```
Your Project Root/
├── database/
│   ├── schema.sql                 ← Run this first
│   ├── rls-policies.sql           ← Run this second
│   └── SETUP_INSTRUCTIONS.md      ← Detailed instructions
├── GETTING_STARTED.md             ← This file
├── .env.local                     ← Supabase credentials (✅ already added)
└── src/
    └── lib/supabase/
        └── middleware.ts          ← Auth removed (✅ already done)
```

---

## How the App is Structured

```
Dashboard Features:
├── Competitions
│   ├── View all competitions
│   ├── Create new competition
│   ├── View competition details
│   └── Register students
├── Students
│   ├── View all students
│   ├── Add new student
│   ├── Bulk import CSV
│   └── View student details
├── Weekly Competitions
│   ├── Manage weekly events
│   └── Track results
├── Rankings
│   └── View leaderboards
├── Reports
│   └── Analytics & statistics
└── Settings
    └── Configure preferences
```

---

## Troubleshooting

### Problem: "Can't create competitions" or "Permission denied"
**Solution**:
- Make sure you ran both `schema.sql` AND `rls-policies.sql`
- Refresh your browser (Ctrl+Shift+R)
- Check the browser console (F12) for error messages

### Problem: "Event types not showing in competition form"
**Solution**:
- Event types are seeded in schema.sql
- Make sure the schema.sql ran completely without errors
- Refresh the page

### Problem: "Can't add students"
**Solution**:
- Make sure the `students` table exists (from schema.sql)
- Make sure the RLS policies were created
- Try refreshing the page

### Problem: "Supabase connection error"
**Solution**:
- Check .env.local file has correct credentials
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Restart the development server (Ctrl+C, then `npm run dev`)

---

## Quick Reference Commands

```bash
# Start the development server (if not already running)
npm run dev

# Build for production
npm build

# Run production build
npm start

# Check for code issues
npm run lint
```

---

## What's Next

After you get the core features working:

1. **Add Proper Authentication** - Create coach login system
2. **Fine-tune Permissions** - Lock down RLS policies per user
3. **Add More Features** - Competition results, rankings, badges
4. **Deploy to Production** - Use Vercel or your hosting platform

---

## Need Help?

- Check the **SETUP_INSTRUCTIONS.md** for detailed step-by-step guide
- Look at **database/rls-policies.sql** for all security policies
- Review **database/schema.sql** for database structure

The app should be fully functional once you run those 2 SQL scripts! 🎉
