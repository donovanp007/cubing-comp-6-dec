# 🎲 Cubing Hub - Competition Management System

A modern web application for managing Rubik's Cube competitions. Built with Next.js, React, TypeScript, and Supabase.

## ✨ Features

- **🏆 Competition Management** - Create and manage competitions with multiple events
- **📝 Student Registration** - Register students for competitions with event selection
- **⏱️ Live Time Entry** - Real-time scoring and leaderboard updates
- **📊 Rankings & Statistics** - View rankings by grade, overall winners, and fastest girl cuber
- **👥 Group Management** - Organize students into groups for competition rounds
- **📈 Standings & Results** - Real-time standings and detailed competition results

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Supabase Account** - [Sign up free](https://supabase.com/)

### Windows Users (Easiest)

Simply double-click the scripts in File Explorer:

1. **First Time Only**: Double-click `setup.bat`
   - Installs dependencies
   - Creates configuration file
   - Builds the project

2. **Configure Supabase**: Edit `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start the Server**: Double-click `run.bat`
   - Server starts automatically
   - Open http://localhost:3000 in your browser

### Mac/Linux Users

Open Terminal in the project directory:

```bash
# First time only: Setup
chmod +x setup.sh
./setup.sh

# Configure Supabase (edit .env.local with your credentials)

# Every time: Run the app
chmod +x run.sh
./run.sh
```

### Manual Setup (All Platforms)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local from template
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials

# 4. Build the project
npm run build

# 5. Start development server
npm run dev
```

## 🌐 Accessing the App

Once the dev server starts, you'll see:

```
✓ Ready in X.Xs

- Local:        http://localhost:3000
- Network:      http://[YOUR-IP]:3000
```

### Local Access
- Open **http://localhost:3000** in your browser

### Network Access (Share with Others)
- Use **http://[YOUR-IP]:3000** to access from other devices
- Your IP address is shown when the server starts
- Both devices must be on the same network

## 🗂️ Project Structure

```
cubing-hub/
├── src/
│   ├── app/                    # Next.js pages and routes
│   │   ├── dashboard/          # Admin dashboard
│   │   │   └── competitions/   # Competition management
│   │   └── login/              # Authentication
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase/           # Database client
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper functions
│   └── styles/                 # Global styles
├── database/                   # SQL migration files
├── public/                     # Static assets
├── setup.bat / setup.sh        # Setup scripts
├── run.bat / run.sh            # Run scripts
└── package.json               # Dependencies
```

## 🔧 Supabase Setup

### Getting Your Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the SQL from `database/schema.sql`
4. Run the query
5. Repeat for any other migration files in the `database/` folder

## 📱 Using the App

### Admin Dashboard
1. Navigate to `/dashboard`
2. Create a new competition
3. Add events and configure rounds
4. Register students for the competition
5. Go "Live" to start recording times

### Competition Overview
- View registered students
- See real-time rankings (by grade, overall, fastest girl cuber)
- Manage competition events

### Live Time Entry
- Record student solve times
- View live leaderboard
- Monitor round progress

## 🐛 Troubleshooting

### "Port 3000 already in use"
The app will automatically try ports 3001, 3002, etc. Check the terminal output for which port is being used.

### "Cannot find module"
Run `npm install` again to ensure all dependencies are installed.

### Database errors
Make sure:
- Supabase credentials in `.env.local` are correct
- Database migrations have been applied
- Your Supabase project is active

### Hydration mismatch warning
This is a development-only warning caused by browser extensions (usually Grammarly). It doesn't affect functionality and won't appear in production.

## 📚 Documentation

See the following files for more details:
- `GETTING_STARTED.md` - Initial setup guide
- `COMPETITION_MANAGEMENT_GUIDE.md` - Managing competitions
- `FEATURES_OVERVIEW.md` - Feature descriptions
- `DATABASE_SETUP_INSTRUCTIONS.md` - Database configuration

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Testing & Quality
npm run lint        # Run linter
npm run type-check  # Check TypeScript types
```

## 📝 Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: n8n Webhooks
N8N_WEBHOOK_URL=https://n8n.example.com/webhook
N8N_API_KEY=your-n8n-api-key
```

## 🤝 Testing Checklist

Before sharing with others, test:

- [ ] App starts without errors
- [ ] Can create a competition
- [ ] Can register students
- [ ] Can view rankings
- [ ] Can record times in live entry
- [ ] Can view real-time standings

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed documentation files
3. Check browser console for error messages (F12 or Ctrl+Shift+I)
4. Ensure Supabase credentials are correct

## 🎯 Next Steps for Testing

1. **Run the setup script** (`setup.bat` or `./setup.sh`)
2. **Configure your Supabase database** (instructions in setup)
3. **Start the app** (`run.bat` or `./run.sh`)
4. **Create a test competition** in the dashboard
5. **Register test students** with various grades
6. **Record some times** in live entry
7. **View rankings** on the competition overview page

---

**Happy cubing! 🎲**
