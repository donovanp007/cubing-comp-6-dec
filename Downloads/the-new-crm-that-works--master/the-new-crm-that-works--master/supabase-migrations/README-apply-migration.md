Migration application instructions — Add students.status column
=============================================================

Follow these step-by-step instructions to apply the migration I created (supabase-migrations/001-add-students-status-column.sql) in your Supabase project.

1) Open Supabase SQL editor
- Go to your Supabase project dashboard (the project matching NEXT_PUBLIC_SUPABASE_URL from your .env.local).
- In the left sidebar click "SQL" → "New Query".

2) Copy & paste the migration SQL
- Open the file `supabase-migrations/001-add-students-status-column.sql` in your repo and copy its entire contents.
- Paste it into the SQL editor query window.

Here is the SQL to paste (same as the file):

-- Migration: Add "status" column to students table (if missing)
-- Run this in your Supabase SQL editor (or via psql) against the target database.

-- 1) Add the column with the same type, default and constraint used in local schema
ALTER TABLE IF EXISTS public.students
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  CHECK (status IN ('active', 'in_progress', 'completed', 'concern', 'inactive'));

-- 2) Backfill existing rows that may have NULL status (set to 'active' or another appropriate value)
UPDATE public.students
SET status = COALESCE(status, 'active');

-- 3) (Optional) Verify the column exists and constraints are applied
-- This query will show the column definition from information_schema
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'status';

-- 4) (Optional) Run a quick check for rows with unexpected values
SELECT DISTINCT status FROM public.students LIMIT 100;

3) Run the query
- Click "RUN" (or "RUN" button in the editor).
- Confirm there are no errors. If the editor reports an error, copy the error text and paste it here so I can help.

4) Verify success
- In the same SQL editor run the verification queries (you can run them separately):

a) Confirm the column exists:
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'status';

Expected: a row showing column_name=status and column_default including 'active'.

b) Check distinct status values:
SELECT DISTINCT status FROM public.students LIMIT 100;

Expected: you should see 'active' (and any other expected values). If you see NULL or unexpected values, let me know.

5) Restart your app to refresh schema cache
- Stop your Next.js dev server (Ctrl+C in the terminal running npm run dev).
- Start it again (npm run dev).
- If using refreshable serverless deployments (Vercel, Netlify, Supabase Edge Functions), redeploy those as needed.

6) Test creating a student
- Use the UI action that previously failed (QuickAddStudentModal or the same flow).
- Confirm the "Could not find the 'status' column..." error no longer appears.

7) Troubleshooting (if you still see the schema cache error)
- Verify you ran the migration against the correct Supabase project. Compare the DB URL in Supabase and the NEXT_PUBLIC_SUPABASE_URL in your .env.local.
- Clear Next.js build cache: delete the `.next` directory, then run npm run dev again.
- If the Supabase client still complains, try restarting the IDE/terminal and re-running the app so the client re-fetches schema metadata.
- If you have server-side functions or deployed serverless functions, redeploy them so they pick up the new schema.
- If the migration failed with an error about constraints or existing data, copy the error text here and I will help craft a safe migration.

8) Optional: run migration via CLI
- If you prefer the CLI and have supabase CLI set up:
  supabase db query "ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','in_progress','completed','concern','inactive')); UPDATE public.students SET status = COALESCE(status, 'active');"

- Or using psql with the connection string from Supabase Settings → Database → Connection string:
  psql "<your-connection-string>" -c "ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','in_progress','completed','concern','inactive')); UPDATE public.students SET status = COALESCE(status, 'active');"

If you run into any errors while executing the migration or verification queries, paste the exact error output here and I’ll help you resolve them.

Task progress:
- [x] Analyze error and identify relevant file
- [x] Inspect createStudent implementation
- [x] Check database schema and TypeScript types
- [x] Create SQL migration to add status column
- [ ] Run migration in Supabase SQL editor (user action)
- [ ] Verify migration and test creating a student
