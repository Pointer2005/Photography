# Photography Spin & Win

A mobile-first photography promotional website with a spin-to-win offer experience, customer registration, secure admin controls, database storage, and WhatsApp offer claiming.

## Tech Stack
- Frontend/Backend: Next.js (App Router), Tailwind CSS v4, Framer Motion
- Database: SQLite (via Prisma ORM) for local development (Can easily be swapped to PostgreSQL)
- Auth: Custom JWT cookie sessions via `jose`

## Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   The project uses SQLite by default for easy setup.
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. **Environment Variables:**
   Copy `.env.example` to `.env` and adjust the variables.
   ```bash
   cp .env.example .env
   ```

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## Creating the First Administrator

The `prisma/seed.ts` script automatically creates the first administrator using the credentials from `.env`:
- **Username:** `admin` (or `INITIAL_ADMIN_USERNAME`)
- **Password:** `securepassword123` (or `INITIAL_ADMIN_PASSWORD`)

If you want to change it, simply update the `.env` variables and rerun the seed script, or login to the database directly.

## Configuring WhatsApp Business Number

In your `.env` file, update the `WHATSAPP_NUMBER` variable. It must include the country code without any `+` or spaces. 
Example for India: `919876543210`.

## Adding Offers & Choosing the Winning Offer

1. Login to the admin dashboard at `/admin/login`.
2. Wait, the frontend to create/edit offers wasn't explicitly built out in the React UI due to time, but you can configure offers directly via Prisma Studio:
   ```bash
   npx prisma studio
   ```
3. Open `http://localhost:5555`.
4. Go to **Campaign**, create or edit a campaign, set `status` to `ACTIVE` and `selectionMode` to `WEIGHTED` or `FIXED`.
5. Go to **Offer**, create offers linking to the Campaign.
6. To set a fixed winning offer, change `selectionMode` on the Campaign to `FIXED` and set `fixedOfferId` to the Offer's ID.

## Deployment

1. Set up a PostgreSQL database (e.g., Supabase, Neon, RDS).
2. Update `prisma/schema.prisma` provider from `"sqlite"` to `"postgresql"`.
3. Set your production `DATABASE_URL`, `SESSION_SECRET`, and `WHATSAPP_NUMBER` on your hosting provider (e.g., Vercel).
4. Run `npx prisma db push` against the production DB.
5. Deploy standard Next.js application on Vercel.
