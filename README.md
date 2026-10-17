# 💻 Laptop Point Bangladesh — Official E-Commerce Platform

A high-performance, production-ready e-commerce platform specializing in premium refurbished and used laptops, original chargers, and computer accessories. Built with Next.js 16, TypeScript, Tailwind CSS v4, and PostgreSQL via Prisma 7.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![ImageKit](https://img.shields.io/badge/ImageKit-CDN-0070F3?style=flat-square)](https://imagekit.io/)

---

## 🚀 Key Features

### Storefront Experience
- **Smart Product Discovery**: Instant filtering by brand, processor, RAM, storage, price range, condition, and cosmetic grade.
- **Product Comparison**: Side-by-side comparison of up to 3 laptops with full specification matrices.
- **Interactive Photo & Video Gallery**: High-definition galleries with click-to-zoom and embedded hands-on YouTube video reviews.
- **Dedicated Accessories Catalog (`/accessories`)**: Specialized catalog for chargers, bags, stands, and peripherals with pin type and wattage attributes.
- **Authoritative Server Pricing**: Client-side prices ignored at checkout; strict validation against server catalog. Automatic free shipping threshold ($\ge ৳50,000$).
- **Privacy-Preserving Order Tracking (`/track-order`)**: Real-time lookup by phone and order number with zero PII exposure and sliding-window rate limiting.
- **Mobile First**: Sticky bottom navigation bar, tap targets $\ge 44$px, and WCAG 2.1 AA accessibility compliance.

### Administration & Operations
- **Role-Based Access Control (RBAC)**: Secure multi-role admin system (`owner`, `manager`, `marketing`, `support`) with session cookies and 15-minute rate-limit lockout.
- **Adaptive Product Forms**: Dynamically switches form fields between Laptop specifications and Accessory attributes (wattage, pin type, compatible brands).
- **Inventory Safety**: Hard stock decrement on checkout, audit logging in `InventoryLog`, and automatic stock restoration upon cancellation or return.
- **A4 Document Printing**: Print-ready A4 Tax Invoices and Delivery Challans with BDT currency formatting and amounts in words ("Taka and Poisha").
- **Flash Sales & Power Deals**: Scheduled countdown deals with automatic expiration via Vercel Cron.
- **Customer Communications**: Contact form inquiry inbox (`/admin/messages`) with unread badge and verified product Q&A publishing (`/admin/questions`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.4.2 (App Router, Webpack)
- **Runtime**: Node.js 24 LTS
- **Language**: TypeScript 5.x (Strict mode, zero `any` exceptions)
- **Styling**: Tailwind CSS 4.x with CSS custom properties
- **Database**: PostgreSQL on Neon Serverless with connection pooling
- **ORM**: Prisma 7 with `@prisma/adapter-pg`
- **Asset Storage & CDN**: ImageKit CDN with server-side MIME verification and WebP re-encoding
- **Scheduler**: Vercel Cron (`vercel.json`) with constant-time secret verification

---

## 📦 Getting Started

### Prerequisites
- Node.js 24.x LTS
- pnpm 10.x or higher

### Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/mhasan0505/laptop_point_Bangladesh.git
   cd laptop_point_Bangladesh
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and provide your credentials:
   ```env
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   ADMIN_PASSWORD="your-strong-admin-password"
   ADMIN_SESSION_SECRET="your-64-character-hex-secret"
   IMAGEKIT_PUBLIC_KEY="public_..."
   IMAGEKIT_PRIVATE_KEY="private_..."
   IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/..."
   CRON_SECRET="your-cron-secret"
   TRUSTED_PROXY="vercel"
   ```
4. **Run development server**:
   ```bash
   pnpm dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Verification Suites

The codebase is protected by 112 automated unit and integration tests using Node.js native test runner:

```bash
# Run full automated test suite (112 tests)
pnpm test

# Run TypeScript compilation check (0 errors required)
npx tsc --noEmit -p .

# Run ESLint compliance check (0 errors)
pnpm lint

# Run automated database backup
node scripts/backup-db.mjs
```

---

## 📚 Client & Operations Documentation

Comprehensive operational and technical guides are available in [`docs/handoff/`](docs/handoff/):

- 📖 [**Store Administrator & Owner Manual**](docs/handoff/ADMIN_GUIDE.md): Click-by-click instructions for daily shop management, adding laptops/accessories, and printing invoices.
- 🌅 [**Daily Operations Checklist**](docs/handoff/DAILY_CHECKLIST.md): Morning, midday dispatch, and evening routines.
- 📅 [**Weekly Maintenance Checklist**](docs/handoff/WEEKLY_CHECKLIST.md): Physical inventory audits, deal rotations, and backups.
- 🔧 [**Troubleshooting Guide**](docs/handoff/TROUBLESHOOTING.md): Quick solutions for uploads, logins, and order tracking.
- 📋 [**Client Data Remediation Guide**](docs/handoff/CLIENT_DATA_REMEDIATION.md): Admin steps for fixing catalog anomalies.
- 🔒 [**Credentials Transfer Template**](docs/handoff/CREDENTIALS_TRANSFER.md): Secure handover checklist for account ownership and password rotation.
- ✍️ [**Acceptance Sign-Off Checklist**](docs/handoff/ACCEPTANCE_CHECKLIST.md): Formal client walkthrough and sign-off document.
- 🏗️ [**Technical Handover Document**](docs/handoff/TECHNICAL_HANDOVER.md): Deep-dive architecture, environment variables, and deployment runbooks.
- 💾 [**Database Backup & Restore Runbook**](docs/RUNBOOKS/DATABASE_BACKUP_RESTORE.md): PostgreSQL disaster recovery procedures.

---

## 🏢 Showroom & Contact Information

**Laptop Point BD**  
Madbar Mansion, Shop-08, 4th Floor, Senpara Parbata, Mirpur-10, Dhaka-1216  
- **Hotline**: `+880 1612-182408`
- **Email**: `laptoppointbd1@gmail.com`
- **Website**: [laptoppointbd.com](https://laptoppointbd.com)
