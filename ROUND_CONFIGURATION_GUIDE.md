# Round Configuration Guide

**Purpose**: Configure advancement rules for each event and round
**Status**: ✅ Complete
**Date**: November 24, 2025

---

## 📍 Where to Find It

**Page**: `/dashboard/competitions/[id]/rounds`

**Navigation**:
```
Dashboard → Competitions → [Your Competition] → "Rounds" Tab
```

---

## 🎯 What Is Round Configuration?

Round configuration lets you define:
1. **How many rounds** each event will have
2. **Who advances** from one round to the next
3. **Advancement rules** (percentage, count, or time-based)

---

## ⚙️ Three Advancement Types

### 1️⃣ Percentage-Based Advancement
**Use Case**: Classic tournament style

```
Example: Top 50% advance
- 20 competitors in Round 1
- Top 10 (50%) advance to Round 2
- Automatic based on rankings
```

**When to Use:**
- Large competitions (20+ students)
- Want flexible advancement
- Natural progression

**Example Flow:**
```
Round 1: 20 competitors
  ↓ Top 50% advance
Round 2: 10 competitors
  ↓ Top 50% advance
Round 3: 5 competitors (Final)
```

---

### 2️⃣ Count-Based Advancement
**Use Case**: Set specific numbers

```
Example: Top 8 advance
- 20 competitors in Round 1
- Exactly 8 advance to Round 2
- Predetermined limit
```

**When to Use:**
- Know exact bracket sizes
- Semi-finals/finals with fixed slots
- WCA style (Top 8 or Top 4 finals)

**Example Flow:**
```
Round 1: 20 competitors
  ↓ Top 8 advance
Round 2: 8 competitors
  ↓ Top 4 advance
Round 3: 4 competitors (Final)
```

---

### 3️⃣ Time-Based (Cutoff) Advancement
**Use Case**: Qualification rounds

```
Example: Under 30 seconds advance
- 25 competitors attempt
- All with times under 30s advance
- Variable number of qualifiers
```

**When to Use:**
- Qualification rounds
- Want students to "beat the cutoff"
- School competitions with time limits

**Example Flow:**
```
Round 1: Attempt with cutoff 30s
  ↓ All under 30s advance
Round 2: Attempt with cutoff 25s
  ↓ All under 25s advance
Round 3: Final (no cutoff)
```

---

## 🛠️ How to Set Up Rounds

### Step 1: Navigate to Round Configuration
```
Dashboard → Competitions → [Your Competition] → "Rounds" Tab
```

You'll see:
- List of all events (3x3, 2x2, Pyraminx, etc.)
- Current round count per event
- Add/Edit/Delete options

---

### Step 2: Expand an Event
```
Click the event you want to configure
The event expands to show all rounds
```

---

### Step 3: Add a Round
```
Click "+ Add Round" button
System creates: "Round 1", "Round 2", etc.
Default advancement: Top 50%
You can edit immediately
```

---

### Step 4: Edit Advancement Rules

**Click the Edit (pencil) icon on a round**

You'll see:

```
Round Name: [Text field]
- Change "Round 1" to custom name
- Examples: "Preliminary", "Semi-Final", "Final"

Advancement Type: [Dropdown]
- Choose: Percentage, Count, or Time
- Based on choice, edit the value

Percentage:
- Enter: 25, 50, 75, etc.
- Shows: "Top X% will advance"

Count:
- Enter: 4, 8, 12, 16, etc.
- Shows: "Top X competitors will advance"

Time:
- Enter: Cutoff in seconds (15, 20, 30, etc.)
- Shows: "Competitors under Xs advance"
```

**Click "Save"** when done

---

## 📋 Complete Setup Example

### Scenario: 3x3 Cube Competition with 20 Students

```
COMPETITION: Local School Finals
EVENT: 3x3x3 Cube
STUDENTS: 20

ROUND SETUP:

1. ROUND 1 (Qualification)
   - Advancement: Percentage
   - Rule: Top 50%
   - Effect: 20 → 10 students advance

2. ROUND 2 (Semi-Final)
   - Advancement: Count
   - Rule: Top 8
   - Effect: 10 → 8 students advance

3. ROUND 3 (Final)
   - Advancement: None (Last round)
   - All 8 students compete for final rankings
```

---

## 🎯 WCA-Standard Configuration

**World Cube Association (WCA) competitions typically use:**

### Single-Day Competition:
```
EVENT: 3x3x3 Cube
STUDENTS: 20

Round 1:
- Advancement: Percentage
- Rule: Top 50%
- Result: 20 → 10

Round 2:
- Advancement: Count
- Rule: Top 4 (or Top 8)
- Result: 10 → 4 (or 8)

Round 3:
- Final Round
- No advancement needed
```

### Multi-Event Competition:
```
EVENT 1: 3x3x3 Cube
- Round 1: Top 50%
- Round 2: Final

EVENT 2: 2x2x2 Cube
- Round 1: Top 50%
- Round 2: Final

(Repeat for each event)
```

---

## 💡 Tips for Coaches

### For Beginners:
```
✓ Use Percentage-based (simpler)
✓ Start with: Top 50% then Top 8
✓ Keep only 2-3 rounds per event
✓ Copy successful format to other events
```

### For Advanced:
```
✓ Mix percentage and count rules
✓ Use time-based for qualification
✓ Match WCA competition format
✓ Document rules for students/parents
```

### Avoid Common Mistakes:
```
❌ Too many rounds (causes fatigue)
❌ Percentages that result in 0-1 students
❌ Inconsistent rules between events
❌ Not explaining rules to participants

✅ DO: Keep 2-3 rounds maximum
✅ DO: Ensure advancement results in reasonable numbers
✅ DO: Be consistent across similar events
✅ DO: Share rules before competition starts
```

---

## 📊 How Advancement Works (Behind the Scenes)

```
AUTOMATIC CALCULATION:

1. Round completes
   → All students have final scores

2. System ranks students
   → Sorted by best time (ascending)

3. Apply advancement rule

   Percentage:
   → Calculate percentage of students
   → Example: 50% of 20 = top 10
   → Those 10 advance

   Count:
   → Take top X students
   → Example: Top 8
   → Those 8 advance

   Time:
   → Filter by time cutoff
   → Example: Under 30s
   → All qualifying advance (could be 5-15 students)

4. Update next round
   → New round populated with advancing students
   → Previous round marked "Completed"

5. Ready for next round
   → Coach can start entering times for Round 2
```

---

## 🔄 Editing Rounds

### To Change Advancement Rule:
```
1. Click Edit (pencil icon)
2. Change advancement type
3. Set new value
4. Click Save
```

### To Rename a Round:
```
1. Click Edit (pencil icon)
2. Change "Round Name" field
3. Examples:
   - "Preliminary" instead of "Round 1"
   - "Semi-Final" instead of "Round 2"
   - "Champion Final" instead of "Round 3"
4. Click Save
```

### To Delete a Round:
```
1. Click Delete (trash icon)
2. Confirm deletion
3. Round removed
4. Students can't compete in this round
```

---

## 🎯 Real Competition Examples

### Example 1: Small School Competition
```
Students: 8
Setup:
- Round 1: Top 4 advance (percentage: 50%)
- Round 2: Finals (all 4 compete for medals)
- Total: 2 rounds, simple bracket
```

### Example 2: Regional Competition
```
Students: 32
Setup:
- Round 1: Top 50% advance (32 → 16)
- Round 2: Top 50% advance (16 → 8)
- Round 3: Finals (8 compete for medals)
- Total: 3 rounds, classic tournament
```

### Example 3: School Qualifier
```
Students: 24
Setup:
- Round 1: Qualification (cutoff: 20s)
- Round 2: Finals (top scorers)
- Total: 2 rounds, mixed format
```

---

## 📱 Mobile-Friendly Round Configuration

The interface works on:
- ✅ Smartphones (single column)
- ✅ Tablets (optimized layout)
- ✅ Computers (full experience)

**On mobile:**
- Tap event to expand/collapse
- Dropdown selectors resize automatically
- Touch-friendly buttons
- Scroll for additional options

---

## ⚡ Quick Actions

### Add Multiple Rounds at Once:
```
1. Click "Add Round" for Round 1
2. Configure Round 1
3. Click "Add Round" again for Round 2
4. Configure Round 2
(Repeat as needed)
```

### Copy Setup From Previous Competition:
```
1. Create new competition
2. Go to Rounds tab
3. Note the config from old competition
4. Recreate the same rules in new one
```

### Modify After Rounds Begin:
```
⚠️ Can edit:
✓ Round name
✓ Advancement rules (if round not started)

❌ Cannot edit:
✗ Delete started rounds
✗ Change started competition event
```

---

## 🔍 Troubleshooting

### Round won't save?
```
Check:
- Did you set advancement value? (percentage, count, or time)
- Is the value reasonable? (50% of 2 = 1 student, OK)
- Try: Click Cancel, then Edit again
```

### Advanced to wrong number of students?
```
Review:
- Check percentage calculation
- Example: 50% of 15 = 7.5 → 8 students
- Consider using Count instead of Percentage
```

### Can't delete round?
```
Reason: Round may be in progress or completed
Solution:
- Can only delete pending rounds
- Completed rounds must be left alone (history)
```

---

## 📖 Understanding the Dashboard

### Status Indicators:
```
🔵 Pending: Not started yet, can edit
🟡 In Progress: Currently happening
🟢 Completed: Finished, archived
```

### Info Cards Show:
```
Total Events: All events in competition
Total Rounds: Sum of all rounds across all events
Status: Competition status (upcoming, registration, live, completed)
```

### Group Status:
```
For each event, see:
- Event name (3x3x3, 2x2, Pyraminx, etc.)
- Number of configured rounds
- Expandable/collapsible for editing
```

---

## ✅ Pre-Competition Checklist

Before going live:
- [ ] Created all events
- [ ] Added rounds to each event
- [ ] Set advancement rules
- [ ] Rules make sense mathematically
- [ ] Shared rules with coaches
- [ ] Shared rules with students/parents
- [ ] Round 1 students clear (will compete)
- [ ] All rounds have names
- [ ] Tested with practice competition

---

## 🎓 Training Your Coaches

### What to teach:
1. How to access Rounds tab
2. When to add/edit rounds
3. Three advancement types and when to use
4. How to handle advancement mathematically
5. Typical WCA format configurations

### Practice scenario:
```
"Set up a 3-round 3x3 competition for 20 students"

Solution:
1. Round 1: Top 50% (20 → 10)
2. Round 2: Top 8 (10 → 8)
3. Round 3: Final (8 competitors)

Why: Large → Medium → Small pool, classic tournament
```

---

## 🚀 Ready to Configure?

1. Go to your competition
2. Click "Rounds" tab
3. Expand an event
4. Click "+ Add Round"
5. Edit the advancement rules
6. Save
7. Repeat for each event

**You're set!** When you go live on the "Live Entry" tab, the rounds will be ready to use.

---

## 📞 Questions?

- **How many rounds?** Typically 2-3 per event
- **Which advancement type?** Most common: Percentage then Count
- **Can I change rules?** Yes, before round starts
- **What about time zones?** Set competition date/time once, all rounds follow

---

*Round Configuration - Complete Guide*
*Last Updated: November 24, 2025*
*Part of: Live Competition System v2.0*
