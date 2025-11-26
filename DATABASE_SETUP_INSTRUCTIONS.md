# Database Setup Instructions

**Status**: Ready to execute
**Time Required**: 5-10 minutes
**Difficulty**: Very Easy

---

## ✅ Pre-Check

Before starting, verify you have:
- [ ] Supabase account and project created
- [ ] Environment variables set (.env.local with Supabase keys)
- [ ] App running on localhost:3001
- [ ] Access to Supabase SQL Editor

---

## 🚀 Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com and log in
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

---

## 🔧 Step 2: Run First SQL File

### File: `database/schema.sql`

1. Open this file in your code editor
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** button
5. Wait for success message (should see ✓ Success)

**What this does:**
- Creates core tables: students, competitions, rounds, results, badges
- Sets up relationships between tables
- Creates indexes for performance

---

## 🔧 Step 3: Run Second SQL File

### File: `database/termly-leagues-schema.sql`

1. Open this file in your code editor
2. Copy all the SQL code
3. In Supabase, click **New Query** again
4. Paste the SQL code
5. Click **Run** button
6. Wait for success message

**What this does:**
- Creates termly league tables
- Adds test data: 4 students (Jaden, Nelson, Andrew, Zi)
- Sets up league structure

---

## 🔧 Step 4: Run Third SQL File

### File: `database/rls-policies.sql`

1. Open this file in your code editor
2. Copy all the SQL code
3. In Supabase, click **New Query** again
4. Paste the SQL code
5. Click **Run** button
6. Wait for success message

**What this does:**
- Enables Row Level Security (RLS)
- Sets up public read/write policies for testing
- Allows app to read/write data

---

## ✅ Step 5: Verify Setup

### Check in Supabase:

1. Click **Table Editor** in left sidebar
2. You should see these tables:
   - `students` ✓
   - `competitions` ✓
   - `competition_events` ✓
   - `rounds` ✓
   - `results` ✓
   - `badges` ✓
   - `student_achievements` ✓
   - `personal_bests` ✓
   - `student_streaks` ✓
   - `termly_leagues` ✓
   - `league_standings` ✓
   - `league_points_history` ✓
   - `weekly_competitions` ✓
   - `weekly_results` ✓

3. Check `students` table has 4 rows:
   - Jaden Smith
   - Nelson Johnson
   - Andrew Williams
   - Zi Chen

### Check in App:

1. Go to http://localhost:3001
2. Click **Dashboard**
3. Click **Students**
4. You should see the 4 test students
5. Click on a student
6. You should see:
   - Student profile info
   - "View Achievements" button
   - "View Statistics" button

---

## 🎯 Test the Features

### Test 1: View Achievements
1. Dashboard → Students
2. Click **Jaden Smith**
3. Click **View Achievements**
4. You should see achievement showcase page

### Test 2: View Statistics
1. Dashboard → Students
2. Click **Jaden Smith**
3. Click **View Statistics**
4. You should see statistics dashboard

### Test 3: Public Competitions
1. Go to home page
2. Click **Competitions**
3. You should see competitions list

### Test 4: Termly Leagues
1. Dashboard → Termly Leagues
2. You should see weekly competitions

---

## ❌ Troubleshooting

### Error: "Unable to connect to database"
- Check that environment variables in `.env.local` are correct
- Verify Supabase project is active
- Try refreshing the app

### Error: "Table does not exist"
- Make sure you ran all 3 SQL files
- Check that there were no error messages during SQL execution
- Try running the SQL files again

### Error: "Permission denied"
- Make sure RLS policies were set up (Step 4)
- Check that `rls-policies.sql` ran without errors

### Students not showing in dropdown
- Verify `termly-leagues-schema.sql` ran successfully
- Check that `students` table has 4 rows
- Try refreshing the page

### No achievements showing
- This is normal! You need to create competitions and record results
- See NEXT_STEPS.md for how to add sample competition results

---

## ✅ Success Checklist

After setup, you should have:
- [ ] All 3 SQL files ran successfully
- [ ] All 14 tables created in Supabase
- [ ] 4 test students visible in app
- [ ] "View Achievements" button visible on student profile
- [ ] "View Statistics" button visible on student profile
- [ ] Achievements page loads without errors
- [ ] Statistics page loads without errors
- [ ] Termly Leagues page accessible

---

## 📝 What's Next?

Once database is set up:

1. **Test the UI**:
   - Navigate through student profiles
   - Check achievement showcase
   - Review statistics dashboard

2. **Create Sample Data** (Optional):
   - Create a test competition
   - Add sample results
   - Watch badges get awarded automatically

3. **Review Documentation**:
   - Read PRIDE_WORTHY_PROFILES.md
   - Read COMPETITION_STRUCTURE.md
   - Review NEXT_STEPS.md

---

## 💡 Pro Tips

- **Save SQL Files**: Keep the 3 SQL files in case you need to reset database
- **Test Thoroughly**: Check all pages work before adding real data
- **Back Up Data**: Use Supabase backups before major changes
- **Monitor Logs**: Check browser console for any errors

---

## ⏱️ Expected Timeline

- SQL execution: 30-60 seconds
- Database verification: 1 minute
- Feature testing: 2-3 minutes
- **Total time: 5-10 minutes**

---

## 🎯 You're Ready!

Everything is prepared. Now it's just a matter of running these 3 SQL files and you'll have a complete pride-worthy student profile system!

**Questions?** Check the documentation files:
- QUICK_REFERENCE.md
- PRIDE_WORTHY_PROFILES.md
- COMPETITION_STRUCTURE.md

Good luck! 🚀
