-- Step 1: Check if tables exist
SELECT 'Tables that exist:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('schools', 'students', 'payments', 'reminders', 'inventory_items', 'sales_opportunities');

-- Step 2: Check RLS status
SELECT 'RLS Status:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('schools', 'students', 'payments', 'reminders', 'inventory_items', 'sales_opportunities');

-- Step 3: If tables don't exist, create them with the safe schema
-- (Only uncomment and run this if the above shows missing tables)
-- \i supabase-schema-safe.sql