# The Cubing Hub CRM Dashboard

A comprehensive student management system for The Cubing Hub, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### ✅ Phase 1 - Complete
- **Dashboard Overview**: Summary metrics tiles showing active students, new sign-ups, and outstanding payments
- **School Progress Tracking**: Visual grid showing each school's enrollment progress against targets
- **Excel-style Student List**: Comprehensive table view with search, filtering, and inline editing capabilities
- **Student Profile Modal**: Detailed student information with tabs for overview, progress, payments, and notes
- **Responsive Design**: Mobile-first approach with iOS-inspired clean interface
- **Real-time Data**: Supabase integration with live updates

### 🎯 Core Components Built
- Dashboard with metrics tiles and school progress grid
- Student management with Excel-style table view
- Student profile modal with comprehensive details
- Navigation sidebar with clean iOS-inspired design
- Search and filtering functionality
- Payment status tracking
- Progress tracking with timeline view

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React 19
- **Styling**: Tailwind CSS with custom iOS-inspired design system
- **UI Components**: shadcn/ui for consistent, accessible components
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth (ready for implementation)
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript strict mode

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with custom CSS variables
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx          # Dashboard home page
│   └── students/         # Student management pages
├── components/
│   ├── ui/               # Reusable shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MetricsTiles.tsx
│   │   └── SchoolProgressGrid.tsx
│   └── students/         # Student management components
│       ├── StudentsPage.tsx
│       ├── StudentsTable.tsx
│       └── StudentProfileModal.tsx
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   └── utils.ts          # Utility functions and helpers
└── types/
    ├── database.ts       # Database schema types
    └── index.ts          # Application types
```

## Database Schema

The application uses a well-structured PostgreSQL schema with the following tables:

- **schools**: School information with enrollment targets
- **students**: Complete student records with relationships to schools
- **payments**: Payment tracking and history
- **reminders**: Task and reminder management

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and configure your Supabase credentials:

```bash
cp .env.example .env.local
```

Fill in your Supabase project details:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup
Run the SQL schema in your Supabase dashboard:
```bash
# Execute the contents of supabase-schema.sql in your Supabase SQL editor
```

### 4. Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Design System

### Color Palette
- **Primary**: #007AFF (iOS Blue)
- **Secondary**: #34C759 (iOS Green) 
- **Accent**: #FF9500 (iOS Orange)
- **Background**: #F2F2F7 (iOS Light Gray)
- **Foreground**: #1C1C1E (iOS Dark)

### Key Design Principles
- **iOS-Inspired**: Clean, minimal interface with smooth animations
- **8px Grid System**: Consistent spacing throughout the application
- **Card-Based Layout**: Clean separation of content areas
- **Color-Coded Status**: Intuitive visual indicators for different states
- **Mobile-First**: Responsive design that works on all devices

## Current Status

✅ **Phase 1 Complete** - All core dashboard and student management features implemented
- Fully functional dashboard with real-time metrics
- Comprehensive student management system
- Professional UI with iOS-inspired design
- Database schema and Supabase integration
- TypeScript with strict mode
- Responsive design

### Next Steps (Future Phases)
- Student add/edit modals
- Bulk operations and Excel import/export
- Advanced analytics and reporting
- Reminder and task management
- Payment processing integration
- Mobile app (React Native)

## Contributing

This project follows clean code principles with:
- TypeScript strict mode
- ESLint configuration
- Component-first architecture
- Comprehensive type safety
- Consistent code formatting

## License

Private project for The Cubing Hub.