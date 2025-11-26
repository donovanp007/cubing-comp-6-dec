# ⚡ Quick Start - 5 Minutes to Testing

## For Windows Users (Easiest) 🪟

### Step 1: Run Setup (Do this ONCE)
1. Double-click **`setup.bat`** in the project folder
2. Wait for installation to complete
3. A text window will close when done

### Step 2: Configure Supabase
1. Open **`.env.local`** file (in the project folder)
2. Replace the placeholder values with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Save the file

### Step 3: Start the App
1. Double-click **`run.bat`** in the project folder
2. Wait for "Ready in X seconds" message
3. Open http://localhost:3000 in your browser
4. **Done!** 🎉

---

## For Mac/Linux Users 🍎

### Step 1: Open Terminal
1. Right-click the project folder
2. Select "Open in Terminal"

### Step 2: Run Setup (Do this ONCE)
```bash
chmod +x setup.sh
./setup.sh
```

### Step 3: Configure Supabase
1. Open **`.env.local`** file
2. Add your Supabase credentials (see step 2 above)
3. Save

### Step 4: Start the App
```bash
./run.sh
```

Open http://localhost:3000 in your browser

---

## Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in / create account
3. Create a new project
4. Go to **Settings** → **API**
5. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Test the App Immediately

1. Go to **Dashboard** → **Competitions**
2. Click **"Create New Competition"**
3. Fill in details (name, location, date)
4. Click **Create**
5. Go to **Rounds** tab and add an event
6. Click **"Batch Register"** and add some test students
7. Look for the **Rankings/Stats** section - you'll see grade rankings!

---

## Share with Others

Once running, you can share with people on your network:

1. Find your IP (when server starts, it shows: `Network: http://[YOUR-IP]:3000`)
2. Share that URL
3. Others on same network can access it!

---

## Problems?

- **"Port already in use"** → Server tries next port, check terminal for correct port
- **"Dependencies not installed"** → Did you run `setup.bat/setup.sh`? Do that first
- **"Supabase error"** → Check `.env.local` has correct credentials
- **Other issues** → See `README.md` for troubleshooting

---

## What's Included?

✅ Full competition management system
✅ Student registration
✅ Live time entry & scoring
✅ Real-time rankings by grade
✅ Overall winner & fastest girl cuber tracking
✅ Group management
✅ Results & standings

---

**Ready?** Start with `setup.bat` or `./setup.sh`! 🚀
