# Photography Spin & Win

A mobile-first photography promotional website with a spin-to-win offer experience, customer registration, secure admin controls, database storage, and WhatsApp offer claiming.

## Tech Stack
- Frontend/Backend: Next.js (App Router), Tailwind CSS v4, Framer Motion
- Database: PostgreSQL (via Prisma ORM)
- Auth: Custom JWT cookie sessions via `jose`

## Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and adjust the variables with your PostgreSQL database URL.
   ```bash
   cp .env.example .env
   ```

3. **Database Setup (Local):**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## Creating the First Administrator

The `prisma/seed.ts` script automatically creates the first administrator using the credentials from `.env`:
- **Username:** `admin` (or `INITIAL_ADMIN_USERNAME`)
- **Password:** `securepassword123` (or `INITIAL_ADMIN_PASSWORD`)

If you want to change it, simply update the `.env` variables and rerun `npx prisma db seed`, or update it directly in the database.

## Configuring WhatsApp Business Number

In your `.env` file, update the `WHATSAPP_NUMBER` variable. It must include the country code without any `+` or spaces. 
Example for India: `919876543210`.

## Adding Offers & Choosing the Winning Offer

1. Login to the admin dashboard at `/admin/login`.
2. To configure or inspect offers directly, you can use Prisma Studio:
   ```bash
   npx prisma studio
   ```
3. Open `http://localhost:5555`.
4. Go to **Campaign**, create or edit a campaign, set `status` to `ACTIVE` and `selectionMode` to `WEIGHTED` or `FIXED`.
5. Go to **Offer**, create offers linking to the Campaign.
6. To set a fixed winning offer, change `selectionMode` on the Campaign to `FIXED` and set `fixedOfferId` to the Offer's ID.

## Deploying to Vercel

### 1. Set Up PostgreSQL Database
Create a hosted PostgreSQL database (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway).

### 2. Configure Environment Variables in Vercel
In **Vercel Project Settings > Environment Variables**, add the following:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `SESSION_SECRET` | Secret key for JWT cookie signing | Any long random string |
| `WHATSAPP_NUMBER` | Business WhatsApp number (country code, no `+` or spaces) | `919876543210` |
| `INITIAL_ADMIN_USERNAME` | *(Optional)* Initial admin username for seeding | `admin` |
| `INITIAL_ADMIN_PASSWORD` | *(Optional)* Initial admin password for seeding | `your-secure-password` |

> [!NOTE]
> `package.json` already contains `"postinstall": "prisma generate"`, so Prisma Client is automatically generated on Vercel during `npm install`.

---

### 3. Database Initialization & Build Commands

You have two options to initialize the database and deploy:

#### Option A: Directly via Vercel Build Command (Automated)

You can let Vercel handle database table creation, seeding, and app building during deployment:

1. **First-Time Build Command:**
   - In Vercel, go to **Project Settings** > **Build & Development Settings**.
   - Enable **Override** for **Build Command** and enter:
     ```bash
     npx prisma db push && npx prisma db seed && next build
     ```
   - **What this does:**
     - `npx prisma db push`: Pushes the schema and creates all tables in PostgreSQL.
     - `npx prisma db seed`: Runs `prisma/seed.ts` to create the initial admin user and default campaign with offers.
     - `next build`: Builds the production Next.js application.

2. **Subsequent Builds:**
   - After the first deployment succeeds, edit **Build Command** in Vercel:
     - Turn off the **Override** toggle (Vercel will run default `next build`), **OR**
     - Keep override set to:
       ```bash
       next build
       ```
   - *(Optional)* If you later modify `prisma/schema.prisma` in future updates and want Vercel to automatically sync schema changes on push, use:
     ```bash
     npx prisma db push && next build
     ```

---

#### Option B: Initialize Database from Local Machine First (Recommended)

If you prefer to initialize the database before deploying:

1. **Run push and seed from your local terminal against production DB:**
   ```bash
   DATABASE_URL="your_production_postgres_url" npx prisma db push
   DATABASE_URL="your_production_postgres_url" npx prisma db seed
   ```

2. **Vercel Build Command:**
   - Keep Vercel's default **Build Command**:
     ```bash
     next build
     ```
   - No override is needed for the first deploy or any future deploys!
