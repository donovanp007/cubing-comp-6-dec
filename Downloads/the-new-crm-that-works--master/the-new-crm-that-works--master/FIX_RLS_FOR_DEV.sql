-- ============================================================================
-- FIX RLS POLICIES FOR DEVELOPMENT MODE
-- ============================================================================
-- Run this in your Supabase SQL Editor to allow anon users (dev mode) to access data

-- ============================================================================
-- SCHOOLS TABLE - Add anon read policy
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view schools" ON public.schools;
DROP POLICY IF EXISTS "Admins and managers can insert schools" ON public.schools;
DROP POLICY IF EXISTS "Admins and managers can update schools" ON public.schools;

CREATE POLICY "Anyone can view schools"
  ON public.schools FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can insert schools"
  ON public.schools FOR INSERT
  TO public
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update schools"
  ON public.schools FOR UPDATE
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can delete schools"
  ON public.schools FOR DELETE
  TO public
  USING (TRUE);

-- ============================================================================
-- STUDENTS TABLE - Add anon read/write policies
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can create students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON public.students;

CREATE POLICY "Anyone can view students"
  ON public.students FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can create students"
  ON public.students FOR INSERT
  TO public
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update students"
  ON public.students FOR UPDATE
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can delete students"
  ON public.students FOR DELETE
  TO public
  USING (TRUE);

-- ============================================================================
-- PAYMENTS TABLE - Add anon read/write policies (if needed)
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can update payments" ON public.payments;

CREATE POLICY "Anyone can view payments"
  ON public.payments FOR SELECT
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can create payments"
  ON public.payments FOR INSERT
  TO public
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can update payments"
  ON public.payments FOR UPDATE
  TO public
  USING (TRUE);

CREATE POLICY "Anyone can delete payments"
  ON public.payments FOR DELETE
  TO public
  USING (TRUE);

-- ============================================================================
-- PROFILES TABLE - Keep auth-only for security
-- ============================================================================
-- Leave profiles table as is - only authenticated users should access

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
