# Database Setup Instructions

## Quick Setup

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Navigate to your project: `gdiilyynpyscctdozlit.supabase.co`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Complete Database Setup**
   - Copy and paste the entire contents of `complete_database_setup.sql`
   - Click "Run" to execute the script

4. **Verify the Setup**
   - The script will show a count of records in each table at the end
   - You should see:
     - Schools: 1
     - Coaches: 1  
     - Classes: 1
     - Students: 5
     - Attendance: 5
     - Cube Progress: 5
     - Merit Points: 5
     - Solve Times: 5

## What This Script Does

✅ **Creates all necessary tables** in the correct order
✅ **Adds cube progress tracking** with full history
✅ **Sets up proper relationships** between tables
✅ **Includes sample data** for immediate testing
✅ **Configures security policies** for access control
✅ **Creates database indexes** for performance

## Sample Data Included

- **1 School**: Rubiks Academy
- **1 Coach**: Coach Smith
- **1 Class**: Beginners Cubing (Grade 5)
- **5 Students**: Alice, Bob, Charlie, Diana, Ethan
- **Cube Progress**: Students at different 3x3 levels
- **Sample Attendance**: Recent attendance records
- **Sample Merit Points**: Various achievement records
- **Sample Solve Times**: Timing records for students

## After Setup

Once you run the script successfully:

1. **Refresh your app** at http://localhost:3000
2. **Navigate to the class** "Beginners Cubing"
3. **Test the cube progress features**:
   - Expand cube progress sections for students
   - Try updating cube levels
   - Use the bulk cube progress feature
   - Submit attendance with cube progress updates

## Troubleshooting

If you get any errors:
- Make sure you're running the script in your Supabase SQL Editor
- Check that your database URL and key are correct in your .env file
- Verify the script ran completely without errors

## Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=https://gdiilyynpyscctdozlit.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaWlseXlucHlzY2N0ZG96bGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTkwMTYsImV4cCI6MjA2ODIzNTAxNn0.yoXR6zGoQ8f53u0qxZ73ld6T-5z_u-NhrKxDXKySt9c
```

## Next Steps

After successful setup, you can:
- Test the cube progress tracking features
- Add more students and classes
- Customize cube levels if needed
- Set up proper user authentication
- Configure more restrictive database policies