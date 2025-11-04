-- Setup Donovan as Admin User
-- Run this in your Supabase SQL editor after creating the auth user

-- Method 1: If you already created the user in Supabase Auth, just update the role
UPDATE users 
SET role = 'admin',
    name = 'Donovan Phillips',
    status = 'active'
WHERE email = 'donovan@thecubinghub.com';

-- Method 2: If the user doesn't exist in users table yet, insert them
-- (This assumes you already created the auth user in Supabase Dashboard)
INSERT INTO users (id, email, name, role, status, created_at)
SELECT 
    au.id,
    'donovan@thecubinghub.com',
    'Donovan Phillips',
    'admin',
    'active',
    NOW()
FROM auth.users au 
WHERE au.email = 'donovan@thecubinghub.com'
AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = 'donovan@thecubinghub.com'
);

-- Verify the admin user was created/updated
SELECT id, email, name, role, status, created_at 
FROM users 
WHERE email = 'donovan@thecubinghub.com';