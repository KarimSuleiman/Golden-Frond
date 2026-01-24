# Golden Palm Car Trading Platform

## Overview

This is an Arabic car trading and tracking platform called "السعفة الذهبية" (Golden Palm / Al-Saafa Al-Thahabeya). The application allows users to track their purchased vehicles through the import/shipping process. Users can view their cars' status, container numbers, booking numbers, and tracking URLs. The platform features a light golden/cream color theme with warm tones and uses Replit Auth for authentication. The entire UI is in Arabic with RTL support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components (New York style)
- **Animations**: Framer Motion for page transitions and scroll animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` for tables, `shared/models/auth.ts` for auth tables
- **Migrations**: Drizzle Kit with `db:push` command

### Project Structure
```
├── client/           # Frontend React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utilities and query client
│       └── pages/       # Route components
├── server/           # Backend Express application
│   ├── replit_integrations/  # Replit Auth integration
│   └── routes.ts     # API route definitions
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Drizzle table definitions
│   ├── routes.ts     # API contract definitions
│   └── models/       # Domain models
└── migrations/       # Database migrations
```

### Authentication Flow
- Uses Replit's OIDC provider for authentication
- Sessions stored in PostgreSQL `sessions` table
- User data synced to `users` table on login
- Protected routes use `isAuthenticated` middleware
- Frontend hook `useAuth` manages auth state

### API Contract Pattern
- Route definitions in `shared/routes.ts` with Zod schemas
- Type-safe request/response handling
- Centralized error schemas for consistent error responses

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Tables**: `users`, `sessions` (auth), `cars` (domain)

### Authentication
- **Replit Auth**: OIDC-based authentication
- **Required Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: Session encryption key
  - `ISSUER_URL`: Replit OIDC issuer (defaults to `https://replit.com/oidc`)
  - `REPL_ID`: Replit deployment identifier

### UI Components
- **shadcn/ui**: Full component library with Radix UI primitives
- **Lucide Icons**: Icon library
- **react-icons/si**: Brand logos (WhatsApp, Facebook)
- **Framer Motion**: Page transitions and scroll animations
- **Google Fonts**: Manrope (body) and Playfair Display (display)

### Landing Page Sections
- Hero with brand logo and CTA buttons
- Testimonials section with customer quotes and motion animations
- About Us section with features grid (id="about" for scroll navigation)
- Contact section with 5 contact methods (phone, WhatsApp, email, Facebook, location)
- Footer with social links

### Contact Methods
- Phone: 796796108
- WhatsApp: +962796796108
- Email: amairehkareem@gmail.com
- Facebook: golden.frond.gallery
- Location: Amman, Jordan

### Build & Development
- **Vite**: Frontend bundling with HMR
- **esbuild**: Server bundling for production
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner