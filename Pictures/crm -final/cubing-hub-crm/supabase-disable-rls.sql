-- Quick fix: Disable RLS for development
-- Run this in your Supabase SQL Editor to fix permission errors

-- Disable Row Level Security on all tables
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales_opportunities DISABLE ROW LEVEL SECURITY;

-- Verify tables exist and are accessible
SELECT 'schools' as table_name, count(*) as row_count FROM schools
UNION ALL
SELECT 'students', count(*) FROM students
UNION ALL  
SELECT 'payments', count(*) FROM payments
UNION ALL
SELECT 'reminders', count(*) FROM reminders
UNION ALL
SELECT 'inventory_items', count(*) FROM inventory_items
UNION ALL
SELECT 'sales_opportunities', count(*) FROM sales_opportunities;