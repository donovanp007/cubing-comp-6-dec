-- Fix RLS Policies for Anonymous Access
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all operations on schools" ON schools;
DROP POLICY IF EXISTS "Allow all operations on students" ON students;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on reminders" ON reminders;
DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow all operations on sales_opportunities" ON sales_opportunities;

-- Create new policies that allow anonymous access
-- Note: This is for development/demo purposes. In production, you'd want proper authentication.

-- Schools table policies
CREATE POLICY "Allow anonymous read on schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on schools" ON schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on schools" ON schools FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on schools" ON schools FOR DELETE USING (true);

-- Students table policies
CREATE POLICY "Allow anonymous read on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on students" ON students FOR DELETE USING (true);

-- Payments table policies
CREATE POLICY "Allow anonymous read on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on payments" ON payments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on payments" ON payments FOR DELETE USING (true);

-- Reminders table policies
CREATE POLICY "Allow anonymous read on reminders" ON reminders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on reminders" ON reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on reminders" ON reminders FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on reminders" ON reminders FOR DELETE USING (true);

-- Inventory items table policies
CREATE POLICY "Allow anonymous read on inventory_items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on inventory_items" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on inventory_items" ON inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on inventory_items" ON inventory_items FOR DELETE USING (true);

-- Sales opportunities table policies
CREATE POLICY "Allow anonymous read on sales_opportunities" ON sales_opportunities FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on sales_opportunities" ON sales_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on sales_opportunities" ON sales_opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on sales_opportunities" ON sales_opportunities FOR DELETE USING (true);

-- Alternative: Disable RLS entirely (less secure but simpler for development)
-- Uncomment these lines if you want to disable RLS completely:
-- ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales_opportunities DISABLE ROW LEVEL SECURITY;