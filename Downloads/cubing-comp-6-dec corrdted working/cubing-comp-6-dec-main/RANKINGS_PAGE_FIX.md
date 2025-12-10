# Rankings Page Fix & Add Christian Jantjies' Time

## Problem
The public rankings page (`/rankings`) shows no data, even though competitions have been completed with results.

## Root Cause
The `student_competition_history` table exists but lacks Row Level Security (RLS) policies, preventing the public API from reading the data.

## Solution

### Part 1: Fix Rankings Page (Enable RLS Access)

The fix has been created in: `/database/FIX_RANKINGS_RLS.sql`

**To apply this fix:**

1. Open Supabase Dashboard (https://app.supabase.com)
2. Go to your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `/database/FIX_RANKINGS_RLS.sql`
6. Paste into the SQL editor
7. Click **Run** button (top right)

The script will:
- Enable RLS on `student_competition_history` table
- Add public read/write policies
- Add RLS policies to `competition_records` and `achievement_log` tables
- Allow the rankings page to access the data

**After running:**
- Refresh the `/rankings` page in your browser
- You should now see all student rankings appear
- The page auto-updates every 2 seconds

---

### Part 2: Add Christian Jantjies' 2x2x2 Final Time (11.23 seconds)

**Option A: Using the Live Entry UI (Recommended)**

1. Go to your competition dashboard
2. Find the 2x2x2 competition
3. Click **Live Entry** or **Live Results**
4. Select:
   - **Event**: 2x2x2 (Pocket Cube)
   - **Round**: Final
   - **Group**: All Students (or the correct group)
   - **Student**: Christian Jantjies
5. Click on **Attempt 5**
6. Enter the time: `1123` (this is 11.23 seconds in centiseconds format)
7. Press **Enter** or click **Submit**
8. The system will:
   - Record the time (11230 milliseconds)
   - Calculate his average
   - Update the rankings automatically
   - Update `student_competition_history` via trigger

**Option B: Using Database Script**

The template script has been created: `/database/ADD_CHRISTIAN_JANTJIES_2x2_TIME.sql`

**Steps:**

1. First, find the correct IDs by running these queries in Supabase SQL Editor:

   ```sql
   -- Find Christian Jantjies' ID
   SELECT id, first_name, last_name FROM students
   WHERE first_name = 'Christian' AND last_name = 'Jantjies';
   ```

2. Copy the resulting ID (e.g., `abc-123-def`)

3. Find the 2x2x2 event ID:
   ```sql
   SELECT id, name, display_name FROM event_types WHERE name = '2x2x2';
   ```

4. Find the competition with 2x2x2 and get the final round:
   ```sql
   SELECT DISTINCT c.id, c.name, c.competition_date
   FROM competitions c
   JOIN competition_events ce ON c.id = ce.competition_id
   JOIN event_types et ON ce.event_type_id = et.id
   WHERE et.name = '2x2x2'
   ORDER BY c.competition_date DESC
   LIMIT 1;
   ```

5. Find the final round ID:
   ```sql
   SELECT r.id, r.round_number, r.round_name
   FROM rounds r
   JOIN competition_events ce ON r.competition_event_id = ce.id
   JOIN event_types et ON ce.event_type_id = et.id
   WHERE et.name = '2x2x2'
   ORDER BY r.round_number DESC
   LIMIT 1;
   ```

6. Copy the template from `/database/ADD_CHRISTIAN_JANTJIES_2x2_TIME.sql` and replace:
   - `{{ ROUND_ID }}` with the round ID from step 5
   - `{{ STUDENT_ID }}` with Christian's ID from step 2

7. Run the modified SQL

---

## Data Flow Explanation

When a time is recorded for a competition:

```
1. Time entered in Live Entry UI
   ↓
2. INSERT into results table (attempt_number, time_milliseconds, is_dnf)
   ↓
3. Calculate final_scores (best_single, average_time_milliseconds)
   ↓
4. INSERT/UPDATE final_scores
   ↓
5. TRIGGER fires: sync_competition_history()
   ↓
6. INSERT/UPDATE student_competition_history
   ↓
7. Rankings page queries student_competition_history
   ↓
8. Results appear on /rankings page
```

**The key link:** `final_scores` → [trigger] → `student_competition_history` → `/rankings` page

---

## Verification Checklist

After applying the fixes:

- [ ] Run `FIX_RANKINGS_RLS.sql` in Supabase
- [ ] Visit `/rankings` page - you should see student names and times
- [ ] Add Christian Jantjies' time using either method
- [ ] Refresh `/rankings` - Christian's entry should update
- [ ] Check his times show correctly (11.23 seconds for attempt 5)

---

## Testing the Rankings Page

Once the RLS fix is applied:

```bash
# Visit the public rankings page
http://localhost:3000/rankings

# Or if running on a server
https://yourdomain.com/rankings
```

Expected to see:
- List of all students who competed
- Their best single times across all events
- Their best averages across all events
- Filterable by grade, school, or event type
- Real-time updates (refreshes every 2 seconds)

---

## If It Still Doesn't Work

1. **Verify RLS policies were applied:**
   ```sql
   -- In Supabase, run:
   SELECT schemaname, tablename
   FROM pg_tables WHERE tablename = 'student_competition_history';

   -- Check for active policies:
   SELECT * FROM pg_policies WHERE tablename = 'student_competition_history';
   ```

2. **Verify data exists in the table:**
   ```sql
   -- Check if any competition history records exist
   SELECT COUNT(*) as record_count FROM student_competition_history;

   -- If 0 records, no competition final_scores have been recorded yet
   -- Complete a competition's round to populate this table
   ```

3. **Check trigger is working:**
   ```sql
   -- Verify trigger exists
   SELECT trigger_name FROM information_schema.triggers
   WHERE trigger_name = 'trigger_sync_competition_history';
   ```

4. **Check browser console for errors:**
   - Open DevTools (F12 in Chrome)
   - Check Console tab for any fetch errors
   - Check Network tab to see what `/rankings` API is returning

---

## Files Modified/Created

- ✅ `/database/FIX_RANKINGS_RLS.sql` - Fixes RLS policies
- ✅ `/database/ADD_CHRISTIAN_JANTJIES_2x2_TIME.sql` - Template for adding time
- ℹ️ This file: `RANKINGS_PAGE_FIX.md` - Documentation

---

## Next Steps

1. Apply the RLS fix SQL
2. Test the rankings page
3. Add Christian's time using the UI
4. Verify his data appears on rankings page

For questions or issues, check the browser console and Supabase logs for detailed error messages.
