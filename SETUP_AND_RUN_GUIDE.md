# Complete Setup & Run Guide - Gamified School League System

This guide shows you **exactly** how to run the app and which SQL to execute.

---

## Part 1: Prerequisites (Check You Have These)

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Supabase Account** (already configured in `.env.local`)
- **Browser** (Chrome, Firefox, Safari, Edge)

### Verify Installation
```bash
node --version    # Should show v18+
npm --version     # Should show 9+
```

---

## Part 2: Run the Application

### Step 1: Install Dependencies

Navigate to your project directory and run:

```bash
npm install
```

This installs all required packages (React, Next.js, Tailwind CSS, Supabase, etc.)

**Expected output**: Shows "added XXX packages" with no errors.

### Step 2: Start the Development Server

```bash
npm run dev
```

**Expected output**:
```
> next dev

▲ Next.js 15.1.6
- Local:        http://localhost:3000
- Environments: .env.local
```

The app is now running on `http://localhost:3000`

### Step 3: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

You should see the **Cubing Hub Dashboard** home page.

---

## Part 3: Database Setup - SQL Migrations

The database is already configured in your `.env.local` file with Supabase credentials. Now you need to run SQL migrations to set up the league system tables.

### How to Run SQL

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Log in with your account
3. Click your project: **brkaumrhvozwsftvruiu**
4. Click **SQL Editor** (left sidebar)
5. Click **New Query**
6. Copy and paste the SQL from each file below (in order)
7. Click **Run** or press `Ctrl+Enter`
8. You should see **"SUCCESS"** message

⚠️ **IMPORTANT**: Run these in order! Each one depends on the previous.

---

## Part 4: SQL Migrations to Run (IN ORDER)

### 🎯 Step 1: Core Tables (Already Exist)

These are already in your database:
- `students` table
- `competitions` table
- `rounds` table
- `results` table
- `final_scores` table
- `event_types` table
- `badges` table

**Action**: You don't need to run anything for these. They already exist.

---

### 🔧 Step 2: Add School Information Table

**File**: `database/schools-schema.sql`

This creates the `schools` table to organize students by school.

Copy and paste this SQL:

```sql
-- Schools Table: Stores school information
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT,
  color_hex TEXT DEFAULT '#3b82f6',
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schools are publicly readable" ON schools FOR SELECT USING (true);
CREATE POLICY "Anyone can manage schools" ON schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update schools" ON schools FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete schools" ON schools FOR DELETE USING (true);
```

**Expected**: No errors. Table created.

---

### 🔧 Step 3: Add School Foreign Key to Students

**File**: `database/migration-add-school-fk.sql`

This links students to their schools.

Copy and paste this SQL:

```sql
-- Add school_id column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
```

**Expected**: No errors. Column added to students.

---

### 🔧 Step 4: Create Tier Thresholds Table

**File**: `database/tier-thresholds-schema.sql`

This stores the configurable tier boundaries (S/A/B/C/D) for each event type.

Copy and paste this SQL:

```sql
-- Tier Thresholds: Configurable time boundaries per event
CREATE TABLE IF NOT EXISTS tier_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D')),
  min_time_ms INT NOT NULL DEFAULT 0,
  max_time_ms INT NOT NULL DEFAULT 999999,
  base_points INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_type_id, tier)
);

-- Enable RLS
ALTER TABLE tier_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tiers are publicly readable" ON tier_thresholds FOR SELECT USING (true);
CREATE POLICY "Anyone can create tiers" ON tier_thresholds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tiers" ON tier_thresholds FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tiers" ON tier_thresholds FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tier_thresholds_event ON tier_thresholds(event_type_id);
```

**Expected**: No errors. Table created.

---

### 🔧 Step 5: Create Grade Multipliers Table

**File**: `database/grade-multipliers-schema.sql`

This stores the grade-based point multipliers (Grade 5 = 2.0x, Grade 12 = 1.0x).

Copy and paste this SQL:

```sql
-- Grade Multipliers: Inverse scale to balance different grades
CREATE TABLE IF NOT EXISTS grade_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL UNIQUE CHECK (grade BETWEEN 5 AND 12),
  multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE grade_multipliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grade multipliers are publicly readable" ON grade_multipliers FOR SELECT USING (true);
CREATE POLICY "Anyone can manage multipliers" ON grade_multipliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update multipliers" ON grade_multipliers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete multipliers" ON grade_multipliers FOR DELETE USING (true);
```

**Expected**: No errors. Table created.

---

### 🔧 Step 6: Create Point Transactions Table

**File**: `database/point-transactions-schema.sql`

This is an immutable audit trail of all point calculations.

Copy and paste this SQL:

```sql
-- Point Transactions: Immutable audit trail of all points
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  point_type TEXT NOT NULL CHECK (
    point_type IN ('best_time', 'average_time', 'pb_bonus', 'clutch_bonus', 'streak_bonus', 'school_momentum_bonus')
  ),
  base_points DECIMAL(10, 2) NOT NULL DEFAULT 0,
  grade_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  final_points DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  -- Prevent duplicates
  UNIQUE(student_id, round_id, point_type)
);

-- Enable RLS
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Point transactions are publicly readable" ON point_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can record points" ON point_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update points" ON point_transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete points" ON point_transactions FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_point_trans_student ON point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_point_trans_school ON point_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_point_trans_competition ON point_transactions(competition_id);
CREATE INDEX IF NOT EXISTS idx_point_trans_round ON point_transactions(round_id);
```

**Expected**: No errors. Table created.

---

### 🔧 Step 7: Create School Standings Table

**File**: `database/school-standings-schema.sql`

This pre-computes school rankings and totals for fast leaderboard display.

Copy and paste this SQL:

```sql
-- School Standings: Pre-computed rankings and totals
CREATE TABLE IF NOT EXISTS school_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  total_points DECIMAL(12, 2) NOT NULL DEFAULT 0,
  best_time_points DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_time_points DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bonus_points DECIMAL(12, 2) NOT NULL DEFAULT 0,
  avg_points_per_student DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_students_participated INT NOT NULL DEFAULT 0,
  overall_rank INT,
  division_rank INT,
  division TEXT CHECK (division IN ('A', 'B', 'C')),
  personal_bests INT DEFAULT 0,
  dnf_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(competition_id, school_id)
);

-- Enable RLS
ALTER TABLE school_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School standings are publicly readable" ON school_standings FOR SELECT USING (true);
CREATE POLICY "Anyone can record standings" ON school_standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update standings" ON school_standings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete standings" ON school_standings FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_standings_competition ON school_standings(competition_id);
CREATE INDEX IF NOT EXISTS idx_standings_school ON school_standings(school_id);
CREATE INDEX IF NOT EXISTS idx_standings_rank ON school_standings(overall_rank);
```

**Expected**: No errors. Table created.

---

### 🔧 Step 8: Enhance Badges Table

**File**: `database/badges-schema-enhanced.sql`

This creates badge definitions for achievements.

Copy and paste this SQL:

```sql
-- Badges Table Enhancement: Support for achievement system
-- (If the badges table doesn't exist, create it)

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('individual', 'school')),
  criteria_json JSONB,
  icon_emoji TEXT DEFAULT '🏆',
  color_code TEXT DEFAULT '#fbbf24',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Badge Awards: Track which students/schools earned which badges
CREATE TABLE IF NOT EXISTS badge_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT now(),
  -- Prevent duplicate awards
  UNIQUE(badge_id, student_id, competition_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);
CREATE POLICY "Badge awards are publicly readable" ON badge_awards FOR SELECT USING (true);
CREATE POLICY "Anyone can award badges" ON badge_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update badge awards" ON badge_awards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete badge awards" ON badge_awards FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_badge_awards_student ON badge_awards(student_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_school ON badge_awards(school_id);
CREATE INDEX IF NOT EXISTS idx_badge_awards_competition ON badge_awards(competition_id);
```

**Expected**: No errors. Tables created/updated.

---

## Part 5: Seed Data - Default Values

Now populate the system with default configuration data.

### 🌱 Step 1: Seed Tier Thresholds

**File**: `database/seed-tier-thresholds.sql`

This sets up default tier boundaries for 3x3 Cube and 2x2 events.

Copy and paste this SQL from `database/seed-tier-thresholds.sql`

**What it does**:
- Sets S tier: < 20 seconds (10 points)
- Sets A tier: 20-45 seconds (5 points)
- Sets B tier: 45-60 seconds (2 points)
- Sets C tier: 60-120 seconds (1 point)
- Sets D tier: > 120 seconds (0 points)

For both 3x3 Cube and 2x2 Cube events.

---

### 🌱 Step 2: Seed Grade Multipliers

**File**: `database/seed-grade-multipliers.sql`

This sets up default grade multipliers (Grade 5 = 2.0x to Grade 12 = 1.0x).

Copy and paste this SQL from `database/seed-grade-multipliers.sql`

**What it does**:
```
Grade 5:  2.0x (2x points)
Grade 6:  1.85x
Grade 7:  1.70x
Grade 8:  1.55x
Grade 9:  1.40x
Grade 10: 1.25x
Grade 11: 1.10x
Grade 12: 1.0x (baseline)
```

---

### 🌱 Step 3: Seed Badges

**File**: `database/seed-badges.sql`

This creates 12 achievement badges (6 individual + 6 school).

Copy and paste this SQL from `database/seed-badges.sql`

**Individual Badges**:
- 🏃 Speed Demon (fastest times)
- 📊 Consistency King (most consistent solver)
- 🎯 PB Breaker (beat personal record)
- 🔥 Clutch Performer (PB in finals)
- ⚡ Streak Master (3+ consecutive improvements)
- 🎓 First Timer (first competition)

**School Badges**:
- 🏆 Full Force (all students participated)
- 🟢 Zero DNF (no did-not-finishes)
- 📈 Growth Warriors (best improvement)
- 🥇 Podium Sweep (all top 3)
- 👑 Champion School (highest points)
- ⭐ Rising Stars (new school doing well)

---

## Part 6: Verify Everything Works

### ✅ Check 1: Confirm Tables Exist

In Supabase SQL Editor, run this query:

```sql
-- Check all league system tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'schools',
  'tier_thresholds',
  'grade_multipliers',
  'point_transactions',
  'school_standings',
  'badges',
  'badge_awards'
)
ORDER BY table_name;
```

**Expected result**: 7 rows showing all the tables we created.

---

### ✅ Check 2: Confirm Seed Data Loaded

In Supabase SQL Editor, run these queries:

```sql
-- Check tier thresholds
SELECT COUNT(*) as tier_count FROM tier_thresholds;
-- Expected: Should show ~35 (5 tiers × 7 events)

-- Check grade multipliers
SELECT COUNT(*) as grade_count FROM grade_multipliers;
-- Expected: Should show 8 (grades 5-12)

-- Check badges
SELECT COUNT(*) as badge_count FROM badges;
-- Expected: Should show 12 (6 individual + 6 school)
```

---

### ✅ Check 3: Test the App

1. Make sure the app is still running: `npm run dev`
2. Go to `http://localhost:3000`
3. Click **Dashboard** in the navigation
4. You should see all the new pages:
   - ✅ `/dashboard/admin/tier-thresholds` (admin page to configure tiers)
   - ✅ `/dashboard/admin/grade-multipliers` (admin page to adjust multipliers)
   - ✅ `/dashboard/admin/badges` (admin page to manage badges)
   - ✅ `/dashboard/schools` (view all schools)
   - ✅ `/dashboard/students` (view all students)

---

## Part 7: First-Time Testing (Manual Testing Scenario)

Now test the entire system end-to-end:

### Test 1: Create a School

1. Go to your admin panel
2. Create a school (e.g., "Lincoln High School")
3. Note the school ID

### Test 2: Create Students in School

1. Go to Students page
2. Add 3-5 students to your school
3. Set different grades (7, 8, 9, 10)

### Test 3: Create a Competition

1. Go to Competitions
2. Create a new competition (e.g., "Regionals 2024")
3. Add 3x3 Cube event
4. Create Qualification and Finals rounds

### Test 4: Complete a Round

1. Go to Live Competition Entry
2. Select Qualification round
3. For each student, enter 5 solve times
4. Click "Complete Round & Calculate Points"
5. Watch the system calculate...

### Test 5: View Results

1. Go to School Standings - see your school ranked
2. Go to Student Profile - see points earned
3. Go to Projector Display - see leaderboard

---

## Common Issues & Fixes

### Problem: "Table does not exist" error

**Fix**: You missed running one of the schema SQL files. Go back to Part 4 and check all 8 steps were completed.

---

### Problem: App won't load at `http://localhost:3000`

**Fix**:
1. Check if npm is running: `npm run dev`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+Shift+R)
4. Check for errors in terminal

---

### Problem: "Permission denied" when trying to save data

**Fix**: Re-run all the RLS policy SQL from Part 4. Make sure each table has policies created.

---

### Problem: "Supabase connection error"

**Fix**: Check your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://brkaumrhvozwsftvruiu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Summary: You're Done! 🎉

**You have successfully**:
✅ Set up the database with 7 new tables
✅ Configured tier thresholds for fair competition
✅ Set up grade multipliers for balanced points
✅ Created badge definitions for achievements
✅ Started the development server
✅ Verified everything works

**Next Steps**:
1. Run manual testing from `WHAT_IS_LEFT.md` (1-2 hours)
2. Write unit tests (Task 25: 2-3 hours)
3. Write integration tests (Task 26: 3-4 hours)
4. Deploy to production!

---

## Need Help?

Refer to these documents:
- **How to use**: `USER_GUIDE_AND_FLOW.md`
- **System architecture**: `SYSTEM_ARCHITECTURE.md`
- **Admin operations**: `LEAGUE_SYSTEM_GUIDE.md`
- **Remaining tasks**: `WHAT_IS_LEFT.md`

---

*Last Updated: November 2024*
*Gamified School League System - Setup Complete*
