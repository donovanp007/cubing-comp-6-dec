# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Cubing Hub CRM - A comprehensive customer relationship management platform for cubing/Rubik's cube educational programs. Built to manage schools, students, payments, inventory, and sales opportunities for cubing instruction businesses.

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Architecture & Structure

### Frontend Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks and context
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui component library

### Project Structure
```
cubing-hub-crm/
├── src/
│   ├── app/                 # Next.js 14 app router pages
│   │   ├── ceo/            # CEO dashboard and analytics
│   │   ├── inventory/      # Inventory management
│   │   ├── students/       # Student management
│   │   └── page.tsx        # Main dashboard
│   ├── components/
│   │   ├── analytics/      # Analytics components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── inventory/      # Inventory management components
│   │   ├── schools/        # School management components
│   │   ├── students/       # Student management components
│   │   └── ui/            # Reusable shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries (Supabase, utils)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── supabase-schema.sql    # Database schema
└── package.json
```

## Database Schema

The CRM uses Supabase with the following main entities:

### Core Tables
- **schools** - Educational institutions using the cubing program
- **students** - Individual students enrolled in cubing classes
- **payments** - Payment tracking and financial records
- **reminders** - Task and follow-up management
- **inventory_items** - Cubing equipment and educational materials
- **sales_opportunities** - Sales pipeline and opportunities

### Key Relationships
- Students belong to schools (many-to-one)
- Payments are linked to students (many-to-one)
- Reminders are associated with students (many-to-one)
- Sales opportunities connect students to inventory items

## Core Features

### Dashboard & Analytics
- Main dashboard with key metrics
- CEO analytics with financial, growth, and operational insights
- School progress tracking
- Performance metrics and KPIs

### Student Management
- Complete student lifecycle management
- Student profiles with contact information
- Status tracking (active, in_progress, completed, concern, inactive)
- Payment status monitoring
- Certificate and cube distribution tracking

### School Management
- School enrollment targets vs. actual
- Financial tracking per school
- Progress monitoring and reporting

### Inventory Management
- Cubing equipment and educational materials
- Stock level monitoring
- Supplier management
- Cost and pricing tracking

### Sales & Opportunities
- Sales pipeline management
- Opportunity tracking
- Student-item matching for sales

### Financial Management
- Payment tracking and status
- Revenue reporting
- Outstanding payment management
- Financial analytics and forecasting

## Design System

### Color Palette
- Primary: Blue (#3B82F6) - professional and trustworthy
- Success: Green (#10B981) - positive actions and success states
- Warning: Yellow (#F59E0B) - attention and warnings
- Danger: Red (#EF4444) - errors and critical actions
- Neutral: Gray scale for text and backgrounds

### Typography
- Font family: Inter (system font fallback)
- Consistent sizing scale (text-sm, text-base, text-lg, etc.)
- Clear hierarchy with proper contrast

### Layout Principles
- Card-based design for data organization
- Responsive grid layouts
- Consistent spacing using Tailwind's spacing scale
- Clean, professional aesthetic suitable for business use

## User Roles & Permissions

### Administrator
- Full access to all features
- User management capabilities
- System configuration

### Manager
- Access to analytics and reporting
- Student and school management
- Financial oversight

### Instructor
- Student progress tracking
- Limited reporting access
- Inventory access for classes

## Development Guidelines

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure
- Error handling and user feedback

### Database Operations
- Use Supabase client for all database operations
- Implement proper error handling
- Follow Row Level Security (RLS) policies
- Use TypeScript types for database operations

### Component Development
- Follow shadcn/ui patterns for consistency
- Implement proper loading and error states
- Use React hooks for state management
- Ensure components are reusable and well-documented

### Performance Considerations
- Optimize database queries
- Implement proper pagination for large datasets
- Use React best practices for rendering performance
- Minimize bundle size with proper imports

## Security Considerations

### Authentication
- Supabase Auth integration
- Role-based access control
- Session management

### Data Protection
- Row Level Security (RLS) policies
- Input validation and sanitization
- Secure API endpoints
- HTTPS enforcement

## Deployment

### Environment Setup
- Development: Local Supabase instance
- Staging: Supabase staging environment
- Production: Supabase production environment

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server operations

## Future Enhancements

### Planned Features
- Advanced reporting and analytics
- Email communication integration
- Mobile application
- API for third-party integrations
- Advanced inventory forecasting
- Automated payment reminders

### Technical Improvements
- Performance optimization
- Enhanced error handling
- Comprehensive testing suite
- Documentation improvements
- Accessibility enhancements