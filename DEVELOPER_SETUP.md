# Developer Setup & Architecture Guide

Welcome to the Madina Paint Store project! This document outlines local environment setup steps, our Firestore database schemas, API routes, and a troubleshooting guide.

---

## 1. Local Environment Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Setup Steps
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd "Madina Paint Store"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize environment configuration:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your credentials (Firebase credentials from the console, Nodemailer credentials, and a secure NextAuth secret).
4. Launch the local dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 2. Firestore Database Schemas

We utilize the following main collections in Firestore:

### `services`
Stores painting service packages.
- `id` (string): Unique document ID.
- `name` (string): Service title.
- `description` (string): Description.
- `pricing` (number): Starting cost in Rs.
- `image_urls` (array of strings): Image URLs.
- `category` (string): interior, exterior, commercial, residential.
- `order` (number): Order for sequence sorting.
- `createdAt` (timestamp).

### `gallery`
Stores portfolio gallery items.
- `id` (string): Unique document ID.
- `image_url` (string): Image storage link.
- `title` (string): Project title.
- `service_category` (string): interior, exterior, commercial, residential.
- `description` (string): Details of work done.
- `order` (number): Order for grid drag-and-drop sorting.
- `createdAt` (timestamp).

### `bookings`
Stores site consultation bookings.
- `id` (string): Unique document ID.
- `customerName` (string): Customer name.
- `phone` (string): Contact number.
- `email` (string): Email address.
- `address` (string): Site address.
- `serviceType` (string): Name of service selected.
- `bookingDate` (string): Date in `YYYY-MM-DD`.
- `bookingTime` (string): e.g. `10:00 AM`.
- `status` (string): pending, confirmed, completed, cancelled.
- `notes` (string): Internal admin notes.
- `createdAt` (timestamp).
- `updatedAt` (timestamp).

### `messages`
Stores contact form submissions.
- `id` (string): Unique document ID.
- `name` (string): Contact name.
- `email` (string): Contact email.
- `phone` (string): Optional contact phone.
- `message` (string): Body text.
- `status` (string): unread, read, replied.
- `createdAt` (timestamp).

### `admin_logs`
Stores audit trails of administrator changes.
- `id` (string): Unique document ID.
- `adminEmail` (string): Email of the modifying admin.
- `action` (string): Action tag (e.g., `ADD_INVENTORY`, `UPDATE_BOOKING`).
- `details` (string): Human-readable change log description.
- `timestamp` (timestamp).

---

## 3. API Routes Directory

| Endpoint | Method | Purpose | Authentication |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Handles administrative auth sessions | None / NextAuth |
| `/api/bookings` | POST | Submits a new customer consultation booking | None |
| `/api/contact` | POST | Submits contact inquiries into the database | None |
| `/api/email` | POST | Dispatches dispatch emails for confirmation | Public / Key secured |

---

## 4. Troubleshooting Guide

### 1. Prerendering/Static Build Fails (`dummy-api-key`)
- **Symptom**: `next build` fails with Firebase connection or api-key validation warnings.
- **Fix**: The client initialization in `src/lib/firebase.ts` incorporates automated fallbacks for build time. Ensure your environment variables are configured in `.env.local` for complete local production tests.

### 2. Emails Do Not Dispatch
- **Symptom**: Booking status changes are saved, but no email notifications are received.
- **Fix**: Double-check `NODEMAILER_EMAIL` and `NODEMAILER_PASSWORD`. If using Gmail, you MUST use an **App Password** instead of your regular password. Enable 2-Step Verification and generate an App Password in your Google Account Settings.

### 3. Vercel Admin Logins Fail
- **Symptom**: Logging in at `/login` on Vercel redirects back with an authentication error.
- **Fix**: Ensure `NEXTAUTH_URL` is set to your Vercel deployment URL (e.g. `https://paintshop.vercel.app`) and `NEXTAUTH_SECRET` is configured in the Vercel Project Settings.
