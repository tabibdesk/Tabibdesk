# TabibDesk

A modern medical practice management system for solo doctors and small clinics in Egypt, built with Next.js and TypeScript.

## 🎨 Branding

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#158ce2` | ![#158ce2](https://via.placeholder.com/15/158ce2/158ce2.png) Main brand color, primary buttons, key UI elements |
| **Secondary** | `#30d4a1` | ![#30d4a1](https://via.placeholder.com/15/30d4a1/30d4a1.png) Secondary actions, success states, highlights |
| **Accent** | `#29446b` | ![#29446b](https://via.placeholder.com/15/29446b/29446b.png) Tertiary color, backgrounds, supporting elements |

These colors are configured in `tailwind.config.ts` and available as:
- `primary-{50-950}` for primary color shades
- `secondary-{50-950}` for secondary color shades
- `accent-{50-950}` for accent color shades

## Getting Started

1. Install the dependencies. We recommend using pnpm. If you want to use `npm`, just replace `pnpm` with `npm`.

```bash
pnpm install
```

2. Then, start the development server:

```bash
pnpm dev
```

3. Visit [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

- `/app/(auth)` - Authentication pages (login, register)
- `/app/(app)` - Main app pages (dashboard, patients, appointments, insights, settings)
- `/app/(design)` - Design library and component showcase
- `/components` - Reusable UI components
  - `/components/shell/navigation` - Sidebar, TopBar, navigation components
  - `/components/landing` - Landing page sections
- `/lib` - Utility functions and helpers
- `/public/landing` - Landing page images

## Features

### Core App Pages
- **Dashboard** (`/dashboard`) - Overview with key metrics, upcoming appointments, recent patients, quick actions
- **Patients** (`/patients`) - Card-based responsive patient list with search
- **Patient Details** (`/patients/[id]`) - Full patient profile with visits, labs, files tabs
- **Appointments** (`/appointments`) - Google Calendar integration + appointment cards
- **Insights** (`/insights`) - Analytics dashboard with KPIs and performance metrics
- **Settings** (`/settings`) - Profile, clinic, security, notifications, preferences

### Navigation & UI
- **Icon-only sidebar** - Clean 64px sidebar on desktop with tooltips, full 256px drawer on mobile
- **Top bar** - User menu and mobile navigation
- **Landing page** (`/`) - Bilingual (Arabic/English) marketing page with RTL support
- **Auth pages** - Login and registration with demo mode
- **Design library** (`/components`) - Component showcase with all UI patterns

### Demo Mode
- Demo context with mock data for testing without a backend
- Mock patients, appointments, and clinic data

### Infrastructure (Ready for Supabase Integration)
- Supabase client/server setup (commented, ready to uncomment)
- API functions for patients and appointments
- Auth helpers for user management
- Database types and schemas
- Validation schemas (ready for Zod)

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://www.radix-ui.com) - UI primitives
- [Recharts](https://recharts.org) - Charts and data visualization

## Project Rules & Guidelines

### Architecture & Framework

- **Next.js App Router only**. Server Components by default; add `"use client"` only when needed.
- **Supabase** is source of truth. All reads/writes must be scoped by `clinic_id` (multi-tenant) and RLS-friendly (no client-only filtering).
- **Soft delete everywhere**: `deleted_at`; always read with `deleted_at IS NULL`.
- **Feature flags per clinic**: `clinic_settings.flags` (jsonb). Hide/disable UI modules/tabs based on flags.

### Code Quality & Organization

- Reuse shared components (no duplicates). Keep files <200 lines; split into smaller components/hooks when needed.
- Clean code: no unused imports/files/routes; no commented-out code; no `console.log` in committed code.
- Modals: use ONE shared Modal component/pattern across the app.

### UI/UX Standards

- **Responsive tables**: no horizontal scroll; hide columns on small screens; filters above content.
- **Tailwind CSS**:
  - Avoid arbitrary values; follow existing theme tokens
  - Mobile-first with `md:`, `lg:` breakpoints
  - Use flex/grid for layouts; avoid fixed heights
  - Use design system colors: `primary-*`, `secondary-*`, `accent-*`

### Documentation

- After a plan is executed, delete temporary planning `*.md` files
- Update README with new features in very short simple English
- Keep implementation notes concise and actionable

### Deployment (Netlify + Git)

- **Never commit build outputs**: `.next/`, `dist/`, `build/`, `out/`, `coverage/`, `node_modules/`, `.env*`
- Ensure `.gitignore` includes: `.next`, `out`, `dist`, `build`, `node_modules`, `coverage`, `.env`, `.env.local`, `.env.*`
- Netlify builds from source (no committed build artifacts). Keep/maintain `netlify.toml` if present.
- **Before finishing**: `npm run lint && npm run typecheck && npm run build`. Then list files changed + how to test.

## License

This project is licensed under the Apache 2.0 License.
