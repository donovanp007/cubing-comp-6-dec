# Cubing Hub Database Setup Instructions

Follow these steps to complete your Supabase setup for the Cubing Hub app.

---

## Step 1: Create Database Tables and Seed Data

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **brkaumrhvozwsftvruiu**
3. Click on **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `database/schema.sql`
6. Click **Run** (or press Ctrl+Enter)

This will create:
- All database tables
- Indexes for performance
- Event types (3x3, 2x2, 4x4, Pyraminx, etc.)
- Badge definitions

**Result**: You should see "SUCCESS" message and no errors.

---

## Step 2: Enable Row Level Security (RLS)

RLS policies allow the app to read and write data. Run these SQL commands one by one:

### 2.1 Enable RLS on all tables

```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streaks ENABLE ROW LEVEL SECURITY;
```

### 2.2 Create permissive RLS policies for public access

```sql
-- Students: Public read, anyone can insert/update their own
CREATE POLICY "Students are publicly readable" ON students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON students FOR DELETE USING (true);

-- Competitions: Public read/write
CREATE POLICY "Competitions are publicly readable" ON competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can create competitions" ON competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update competitions" ON competitions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete competitions" ON competitions FOR DELETE USING (true);

-- Competition Events: Public read/write
CREATE POLICY "Competition events are publicly readable" ON competition_events FOR SELECT USING (true);
CREATE POLICY "Anyone can create competition events" ON competition_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update competition events" ON competition_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete competition events" ON competition_events FOR DELETE USING (true);

-- Registrations: Public read/write
CREATE POLICY "Registrations are publicly readable" ON registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can register students" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update registrations" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete registrations" ON registrations FOR DELETE USING (true);

-- Rounds: Public read/write
CREATE POLICY "Rounds are publicly readable" ON rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can create rounds" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rounds" ON rounds FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rounds" ON rounds FOR DELETE USING (true);

-- Results: Public read/write
CREATE POLICY "Results are publicly readable" ON results FOR SELECT USING (true);
CREATE POLICY "Anyone can record results" ON results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update results" ON results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete results" ON results FOR DELETE USING (true);

-- Final Scores: Public read/write
CREATE POLICY "Final scores are publicly readable" ON final_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can create final scores" ON final_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update final scores" ON final_scores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete final scores" ON final_scores FOR DELETE USING (true);

-- Personal Bests: Public read/write
CREATE POLICY "Personal bests are publicly readable" ON personal_bests FOR SELECT USING (true);
CREATE POLICY "Anyone can create personal bests" ON personal_bests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update personal bests" ON personal_bests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete personal bests" ON personal_bests FOR DELETE USING (true);

-- Event Types: Public read only
CREATE POLICY "Event types are publicly readable" ON event_types FOR SELECT USING (true);

-- Weekly Competitions: Public read/write
CREATE POLICY "Weekly competitions are publicly readable" ON weekly_competitions FOR SELECT USING (true);
CREATE POLICY "Anyone can create weekly competitions" ON weekly_competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly competitions" ON weekly_competitions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weekly competitions" ON weekly_competitions FOR DELETE USING (true);

-- Weekly Results: Public read/write
CREATE POLICY "Weekly results are publicly readable" ON weekly_results FOR SELECT USING (true);
CREATE POLICY "Anyone can create weekly results" ON weekly_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update weekly results" ON weekly_results FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete weekly results" ON weekly_results FOR DELETE USING (true);

-- Badges: Public read only
CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);

-- Student Achievements: Public read/write
CREATE POLICY "Student achievements are publicly readable" ON student_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can create achievements" ON student_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update achievements" ON student_achievements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete achievements" ON student_achievements FOR DELETE USING (true);

-- Student Streaks: Public read/write
CREATE POLICY "Student streaks are publicly readable" ON student_streaks FOR SELECT USING (true);
CREATE POLICY "Anyone can create streaks" ON student_streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update streaks" ON student_streaks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete streaks" ON student_streaks FOR DELETE USING (true);
```

---

## Step 3: Verify Setup

After running the RLS policies, verify everything is working:

1. Go to **Authentication > Policies** in Supabase dashboard
2. You should see policies for all tables
3. The app should now allow:
   - Creating competitions ✅
   - Adding students ✅
   - Registering students for competitions ✅

---

## Step 4: Test the App

1. The app is running on `http://localhost:3001`
2. You should now be able to:
   - Access the dashboard without login
   - Create a competition
   - Add students
   - Register students for competitions

---

## Notes

- **No authentication required**: We removed the login requirement, so anyone can access the dashboard
- **Public read/write**: All tables are set to public read/write for testing
- **For production**: You'll want to implement proper authentication and row-level security policies

---

## Troubleshooting

### If you get "relation does not exist" error:
- Make sure you ran the schema.sql file completely
- Check for any SQL syntax errors in the output

### If the app still won't let you create competitions:
- Refresh the browser (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify RLS policies were created successfully

### If you see "Permission denied" errors:
- Make sure you ran all the RLS policy creation statements
- Verify the policies are enabled in Supabase dashboard
