-- Create Admin User Script
-- Run this in your Supabase SQL editor

-- First, create the auth user (replace with your desired email/password)
-- This needs to be done in Supabase Dashboard -> Authentication -> Users -> "Add user"
-- Email: admin@yourcompany.com
-- Password: your-secure-password
-- Confirm email: Yes

-- Then run this SQL to set the user as admin:
-- Replace 'admin@yourcompany.com' with your actual admin email

UPDATE users 
SET role = 'admin',
    name = 'System Administrator',
    status = 'active'
WHERE email = 'admin@yourcompany.com';

-- Alternative: If you know the user ID from Supabase Auth, use this instead:
-- UPDATE users 
-- SET role = 'admin',
--     name = 'System Administrator',
--     status = 'active'
-- WHERE id = 'your-user-id-here';

-- Verify the admin user was created:
SELECT id, email, name, role, status, created_at 
FROM users 
WHERE role = 'admin';