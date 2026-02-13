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

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Use **"Try Demo"** on the login page to explore without auth.

### Local Development (Supabase)

1. Copy `.env.example` to `.env.local`
2. Add from Supabase Dashboard → Settings → API: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Run migrations in Supabase SQL Editor in order (`supabase/migrations/20260212_*`, then `20260213_*`)
4. Seed first user: in SQL Editor, create a subscription and insert into `clinic_members` for your auth user UUID (role: manager/doctor/assistant)

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

### Backend & Supabase
- **Auto-clinic on signup** – Trigger creates subscription → clinic → clinic_member; new user becomes manager
- **RLS policies** – All tables scoped by `clinic_id`; use `get_user_clinic_ids()` helper
- **Multi-tenant** – Every query filters by clinic; patients, appointments, medical_records, etc.
- **Storage buckets** – lab-results, payment-proofs, prescriptions, medical-records, attachments, clinic-documents (private, signed URLs)
- **Realtime hooks** – `useTodayAppointments`, `useRealtimeCheckIn`, `useTaskAssignments`, `usePaymentMonitoring`

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://www.radix-ui.com) - UI primitives
- [Tremor](https://www.tremor.so) - Charts, metrics, badges (prefer over custom dashboard UI)
- [Supabase](https://supabase.com) - Auth, database, storage, realtime

## Project Rules & Guidelines

### Architecture & Framework

- **Next.js App Router only**. Server Components by default; add `"use client"` only when needed.
- **Supabase** is source of truth. All reads/writes must be scoped by `clinic_id` (multi-tenant) and RLS-friendly (no client-only filtering).
- **Soft delete everywhere**: `deleted_at`; always read with `deleted_at IS NULL`.
- **Feature flags per clinic**: `clinic_settings.flags` (jsonb). Hide/disable UI modules/tabs based on flags.
- **Multi-location** (in progress): Migrations add `subscription_id` to patients, `location_ids` to clinic_members, `clinic_location_id` to appointments. Run migrations in `supabase/migrations/` order (20260212_* then 20260213_*).

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

### UI Libraries

- **Tremor**: Use for charts, metrics, badges, progress bars. Keep existing skeletons; only swap loaded content to Tremor. Theme tokens in `tailwind.config.ts`.

### Documentation

- Update README with new features in very short simple English
- Keep implementation notes concise and actionable

### Deployment (Netlify + Git)

- **Never commit build outputs**: `.next/`, `dist/`, `build/`, `out/`, `coverage/`, `node_modules/`, `.env*`
- Ensure `.gitignore` includes: `.next`, `out`, `dist`, `build`, `node_modules`, `coverage`, `.env`, `.env.local`, `.env.*`
- Netlify builds from source (no committed build artifacts). Keep/maintain `netlify.toml` if present.
- **Before finishing**: `npm run lint && npm run typecheck && npm run build`. Then list files changed + how to test.

### Troubleshooting

- **404 for _next/static/chunks**: Run `rm -rf .next && npm run build && npm run start`; hard refresh (`Cmd+Shift+R`) or incognito. Use `npm run dev` when developing, not production build.
- **Add users to clinic**: Insert into `clinic_members` with role `doctor`, `assistant`, or `manager`.

## License

This project is licensed under the Apache 2.0 License.
