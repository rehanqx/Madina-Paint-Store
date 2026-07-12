# Client Handover & Administration Guide

Welcome to your new Madina Paint Store web platform! This document serves as your complete guide to managing and maintaining the website, customer bookings, paint inventory, gallery, services catalog, and messages.

---

## 1. Admin Access & Portal Guide

### Accessing the Admin Panel
- **Login URL**: `https://<your-domain>.com/login` (or `http://localhost:3000/login` in development).
- **Credentials**: Log in using your authorized administrator Google Account or secure email/password credential configured in your Firebase Authentication panel.

### Step-by-Step Feature Guides

#### 1. Managing Customer Bookings (`/dashboard/bookings`)
- View a listing of all booking requests (Pending, Confirmed, Completed, Cancelled).
- **Updating Booking Status**:
  1. Click on a booking row to view details (phone, email, site address, notes).
  2. Change status via the dropdown.
  3. Input internal notes (e.g. "Sent quotation estimates").
  4. Click **Confirm** or **Save & Close**. The system will dispatch an automated email notification to the customer.
- **Exporting Bookings**: Click **Export to Excel** to download the bookings sheet using SheetJS.

#### 2. Managing Paint Inventory (`/dashboard/inventory`)
- View metrics cards for Total Products, Low Stock Items, and Total Inventory Value.
- **Manual Adjustments**: Click **Add Product** to manually input a product name, color code, opening stock, cost, and supplier.
- **Excel Batch Upload**:
  1. Click **Download Template** to get the correct structure (`Product Name`, `Color`, `Opening Stock`, `Sold`, `Cost`, `Supplier`).
  2. Populate your data in Excel.
  3. Click **Upload Excel File** to preview validation results.
  4. Click **Confirm Upload** to batch upload to Firestore in a single transaction.

#### 3. Managing Services Catalog (`/dashboard/services-manager`)
- View your catalog of painting packages (Interior, Exterior, Commercial, Residential).
- **Adding/Editing Packages**:
  - Click **Add Service** or **Edit** on an existing row.
  - Fill in the Service Name, Category, Description, Pricing, and comma-separated Image URLs.
  - Reorder packages using the ordering number sequence.

#### 4. Project Showcase Gallery (`/dashboard/gallery-manager`)
- Add high-quality project showcase items by providing image URLs, titles, and descriptions.
- **Drag-and-Drop Reordering**: Drag rows up or down to update the sequence in which images display on the public website.

#### 5. Contact Inquiries (`/dashboard/messages`)
- Read user contact messages.
- Input response text and click **Send Reply** to directly email the customer. The message status updates to "Replied" automatically.

---

## 2. Database Collections Overview

All data is stored securely in Firestore collections:

1. **`services`**: Stores name, pricing, categories, descriptions, order, and image links.
2. **`gallery`**: Stores title, category, descriptions, order, and image links.
3. **`bookings`**: Stores customer data, site address, preferred date/time slot, internal notes, and status.
4. **`messages`**: Stores user contact messages, email, phone, and reply status.
5. **`admin_logs`**: System audit trail logging administrative modifications.

---

## 3. Maintenance & Backup Schedule

- **Firestore Database Backups**:
  - We recommend enabling automated backups in your Firebase Console (under Database → Backups).
  - Set a **30-day retention period** to keep daily snapshots.
- **Environment Variables Backup**:
  - Keep a secure copy of your `.env.local` keys inside a password manager (e.g. 1Password, Bitwarden). **Do not upload `.env.local` to GitHub.**
- **Content Updates**:
  - Update services pricing and gallery images every 3-6 months to keep your portfolio fresh.

---

## 4. FAQ & Troubleshooting

### Q: The website shows "Image Not Available" on some services or projects.
- **A**: Ensure the image URL starts with a valid protocol (`https://`). If using Firebase Storage links, verify they are public and the domain is allowed in Vercel settings.

### Q: Customer notifications or message reply emails are not sending.
- **A**: If using Gmail for Nodemailer, verify that your Gmail account has **App Passwords** enabled and the password string in `NODEMAILER_PASSWORD` is correct. Regular account passwords will be blocked by Google.

### Q: System shows "Build Failed" during Vercel deployment.
- **A**: Check the build logs. Make sure all public parameters (`NEXT_PUBLIC_*`) and private administrative keys (`FIREBASE_ADMIN_SDK_KEY`) match your local `.env.local` config exactly.

---

## 5. Contact & Support

- **Lead Developer**: Rehan
- **Support Email**: support@madinapaintstore.com
- **Emergency Procedure**: In case of critical site downtime, check the Vercel Deployment status panel and verify Google Firebase Billing limits.
