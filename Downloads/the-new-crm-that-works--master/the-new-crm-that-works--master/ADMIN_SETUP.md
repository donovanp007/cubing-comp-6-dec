# Admin User Setup Guide

When your app loads for the first time, you'll need to create an admin user. Here are three ways to do it:

## Option 1: Using the Setup Page (Recommended) ✨

1. Navigate to `/setup` in your browser (e.g., `http://localhost:3000/setup`)
2. Fill in the admin user details:
   - Full Name (defaults to "System Administrator")
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
3. Click "Create Admin User"
4. You'll be redirected to the sign-in page

## Option 2: Manual Database Setup

1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add user" and create a new user with:
   - Email: your admin email
   - Password: your secure password
   - Confirm email: Yes
3. Run the SQL script in `create-admin-user.sql` in your Supabase SQL editor
4. Update the email in the script to match the user you created

## Option 3: Programmatic Setup

Use the utility function in `/src/utils/createAdminUser.ts`:

```typescript
import { setupInitialAdmin } from '@/utils/createAdminUser'

// Call this function once to create an admin
await setupInitialAdmin()
```

## Admin Permissions

Admin users have access to:
- ✅ View all data
- ✅ Manage users
- ✅ View financials
- ✅ Manage projects & tasks
- ✅ View analytics & CEO dashboard
- ✅ Manage schools & students
- ✅ Manage settings
- ✅ Export data
- ✅ Manage inventory

## Next Steps

After creating an admin user:

1. Sign in at `/auth/signin` with your admin credentials
2. Go to the Team page (`/team`) to create additional users
3. Assign appropriate roles (admin, ceo, manager, team_member)
4. Configure your system settings

## Troubleshooting

- **Setup page shows "Admin already exists"**: An admin user is already created, go to sign in
- **Email already in use**: Try a different email or check if the user already exists
- **Password too weak**: Use at least 8 characters with a mix of letters, numbers, and symbols
- **Database errors**: Check your Supabase configuration and make sure all migrations have been run

## Security Notes

- 🔐 Use a strong password for admin accounts
- 🔐 Consider enabling 2FA in Supabase for admin users
- 🔐 Regularly review user permissions and remove inactive accounts
- 🔐 The setup page should only be accessible during initial setup