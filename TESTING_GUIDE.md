# 🧪 Testing Guide - Cubing Hub

This guide walks you through testing all features of the Cubing Hub application.

## 📋 Pre-Testing Checklist

Before you start testing:

- [ ] App is running (`run.bat` or `./run.sh`)
- [ ] Supabase credentials are configured in `.env.local`
- [ ] You can access http://localhost:3000
- [ ] No console errors (press F12 to check)

---

## 🎯 Test Scenarios

### Test 1: Create a Competition ✅

1. Navigate to **Dashboard** → **Competitions**
2. Click **"Create New Competition"** button
3. Fill in the form:
   - **Name**: "Test Competition"
   - **Location**: "Test School"
   - **Date**: Today's date
   - **Description**: "Testing the app"
4. Click **Create**
5. **Expected**: Competition appears in the list
6. **Status**: Should be "Upcoming"

### Test 2: Add Events to Competition ✅

1. Click on the competition you just created
2. Go to **Rounds** tab
3. Click **"Add Event"**
4. Select an event type (e.g., "2x2", "3x3")
5. Configure rounds:
   - Round 1: 5 solves
   - Click **Add Round**
6. Click **Save**
7. **Expected**: Event appears on competition overview with round information

### Test 3: Register Students ✅

1. On competition overview, click **"Batch Register"** button
2. This opens the new registration form
3. **Add a student**:
   - Select a student from dropdown (or create test data first)
   - Check the events they should participate in
   - Click **"Register [StudentName]"**
4. **Repeat** for at least 3-5 students with different grades
5. **Expected**:
   - Student appears in the sidebar "Registered Students"
   - Student count updates in the info card

### Test 4: View Rankings by Grade ✅

1. On competition overview, look for the **Rankings/Stats section**
2. You should see 6 cards:
   - Fastest - Grade 1
   - Fastest - Grade 2
   - Fastest - Grade 3
   - Fastest - Grade 4
   - Overall Winner
   - Fastest Girl Cuber
3. **Expected**: Cards show "No scores yet" (until times are recorded)

### Test 5: Go Live and Record Times ✅

1. On competition overview, click **"Go Live"** button
2. You'll be taken to the **Live Entry** page
3. Click **"Start Round"** for the first event
4. **Record times**:
   - Select a student from dropdown
   - Enter a solve time (e.g., 15.23 seconds)
   - Click **Record Time** or **DNF** if they didn't finish
5. **Repeat** for multiple students in the same round
6. **Expected**: Times appear in the table below

### Test 6: Complete Event and View Scores ✅

1. On the Live Entry page, click **"Complete Event"** button
2. You'll see a "Final Scores" modal
3. Click **"Confirm and Continue"**
4. **Expected**:
   - You're taken to the next event (if available)
   - Final scores are saved to the database

### Test 7: View Updated Rankings ✅

1. Go back to the competition overview
2. Look at the **Rankings/Stats section** again
3. **Expected**: The cards should now show:
   - Fastest student in each grade (if they have scores)
   - Overall winner (fastest across all grades)
   - Fastest girl cuber (if female students have scores)
4. Times should be formatted as seconds (e.g., "12.45s")

### Test 8: View Competition Standings ✅

1. On competition overview, click **"Standings"** tab
2. **Expected**: Shows a table of all students with their times
3. Should be sorted by fastest time

### Test 9: Manage Groups ✅

1. Go to **Groups** tab
2. Click **"Create Group"** button
3. Create a test group with a name
4. **Add students** to the group
5. **Expected**: Students appear in the group
6. Delete students or the group to test removal

### Test 10: Test Network Access ✅

1. Find your computer's IP address:
   - **Windows**: Open PowerShell, type `ipconfig`, find "IPv4 Address"
   - **Mac/Linux**: Open Terminal, type `ifconfig`, look for `inet`
2. On another device (phone, tablet, another computer):
   - Open browser
   - Go to `http://[YOUR-IP]:3000`
3. **Expected**: App loads and works the same as on localhost
4. Test creating a competition or registering students

---

## 🐛 Common Issues During Testing

### "No students appear in dropdown"
- **Problem**: Student database is empty
- **Solution**: Create test students first via Dashboard → Students
- Or add them via bulk import

### "Can't create event without rounds"
- **Problem**: Events require at least 1 round configuration
- **Solution**: Add a round before saving the event

### "Rankings cards show 'No scores yet'"
- **Problem**: Students haven't recorded any times yet
- **Solution**: Complete the "Go Live and Record Times" test first

### "Port already in use"
- **Problem**: Port 3000/3001/3002 is in use
- **Solution**: The app will automatically try the next available port. Check the terminal for which port it's using

### "Hydration mismatch warning"
- **Problem**: Browser extension modifying HTML
- **Solution**: This is development-only and harmless. Disable extensions if needed

---

## ✅ Full Feature Test Summary

Print this and check off each item:

- [ ] Can create competitions
- [ ] Can add events with multiple rounds
- [ ] Can register students for competitions
- [ ] Can view rankings by grade (1-4)
- [ ] Can see overall winner
- [ ] Can see fastest girl cuber
- [ ] Can go live and record solve times
- [ ] Can complete events and save final scores
- [ ] Can view standings/results
- [ ] Can manage competition groups
- [ ] Can access from another device on the network
- [ ] No console errors during normal use
- [ ] Performance is responsive (no lag)

---

## 🎓 Advanced Testing

### Performance Testing
- Create 100+ students
- Register 50+ for a competition
- Record 500+ times
- Check if app remains responsive

### Edge Cases
- Register same student twice (should prevent duplicate)
- Record time as "DNF" (Did Not Finish)
- Record time as "DNS" (Did Not Start)
- Delete a competition with registered students
- Change competition status mid-test

### Data Integrity
- Record times, refresh page, verify times are still there
- Create competition, close browser, reopen and verify it exists
- Register students, go back to dashboard, verify they're still registered

---

## 📊 Success Criteria

The testing is complete and successful when:

✅ All 10 main test scenarios pass
✅ No console errors appear (F12 to check)
✅ Data persists after page refreshes
✅ App loads and works from another device
✅ Rankings update correctly after recording times
✅ UI is responsive and buttons work without lag

---

## 📝 Feedback Template

When testing, note:

```
Test Scenario: [Which test]
Status: PASS / FAIL
Notes: [What worked / What didn't]
Error Message: [If applicable]
Browser: [Chrome/Firefox/Safari]
Device: [Windows/Mac/Phone]
```

---

Good luck testing! 🚀
