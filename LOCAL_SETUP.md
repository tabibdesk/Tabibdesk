# Local Development Setup Guide

## Environment Variables for Local Development

To run this project locally in Cursor or any local development environment, you need to set up environment variables for Supabase.

### Steps:

1. **Get your Supabase credentials:**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Click on your project
   - Navigate to Settings → API
   - Copy the following values:
     - `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` → use as `SUPABASE_SERVICE_ROLE_KEY`

2. **Create `.env.local` file:**
   - Copy `.env.example` to `.env.local` in the project root
   - Fill in your Supabase credentials
   - **Important:** Never commit `.env.local` to Git (it's in `.gitignore`)

3. **Example `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Run the project:**
   ```bash
   npm install
   npm run dev
   ```

### Features that require authentication:
- Login with email/password
- Social login (Google, Azure)
- Dashboard access
- Patient management
- Appointment scheduling
- Accounting features
- Archive management

### Demo Mode:
- Click "Try Demo" on the login page to use the app without authentication
- Demo mode uses mock data for testing
