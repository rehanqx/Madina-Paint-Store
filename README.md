# Madina Paint Store Portal

A modern, highly performant web application and administrative management system designed for **Madina Paint Store** located in Khanewal, Punjab. This application enables customers to browse painting services, view previous projects, and book consultation appointments, while providing store administrators with a comprehensive dashboard to manage appointments, update catalogs, track project logs, and process notifications.

---

## 🚀 Key Features

### 👥 Customer-Facing Portal
- **Service Catalog:** Dynamic listing of decorative, residential, commercial, and industrial painting packages.
- **Project Gallery:** Filterable portfolio showcasing completed work with details and high-quality images.
- **On-Demand Booking Form:** Seamless scheduling tool that lets users choose service categories, dates, and times with instant email confirmation.
- **Responsive Layout:** Tailored with a custom green-and-gold design system (`#2D5016` primary, `#E8B44D` accent) optimized for all device sizes.

### 🛡️ Administrative Dashboard
- **Analytics Overview:** Visual metrics representing booking counts, inquiry statuses, and revenue targets.
- **Appointment Scheduler:** Full calendar view to track, update, confirm, or cancel bookings.
- **Service & Gallery Manager:** CRUD operations to add, edit, or remove services and gallery items directly.
- **Audit Action Logs:** In-app tracking of admin operations (logins, updates, and creation of items) for accountability.
- **Secure Authentication:** Managed via Firebase Auth with role-based access control.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 & Vanilla CSS
- **Database & Auth:** Firebase & Cloud Firestore
- **File Storage:** Firebase Cloud Storage
- **Notifications:** Nodemailer (SMTP Transport for transactional receipts)
- **Programming Language:** TypeScript
- **Export Formats:** SheetJS (XLSX export for booking sheets)

---

## ⚙️ Environment Configuration

To run this application locally or in production, create a `.env.local` file in the root directory with the following variables:

```ini
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (JSON string on single line)
FIREBASE_ADMIN_SDK_KEY='{"type": "service_account", "project_id": "...", ...}'

# Nodemailer / SMTP Email Dispatch Configuration
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_SECURE=false
NODEMAILER_USER=your_smtp_sender_email@gmail.com
NODEMAILER_PASS=your_app_specific_password
NODEMAILER_ADMIN_EMAIL=your_store_admin_email@gmail.com

# Shop Configuration Variables
NEXT_PUBLIC_SHOP_PHONE=+92 300 0000000
NEXT_PUBLIC_SHOP_EMAIL=example.com
NEXT_PUBLIC_SHOP_ADDRESS="Madina Town, Nirala Sweet, Khanewal"
```

---

## 🧑‍💻 Getting Started

### 1. Install Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the local server.

### 3. Create Admin Users
To authorize a user as an administrator:
1. Register their email/password in Firebase Authentication.
2. Run the synchronization script to create their profile document in the `admin_users` collection:
   ```bash
   npm run create-admin
   ```

### 4. Build for Production
To bundle the application for production deployment:
```bash
npm run build
```

---

## 📂 Directory Structure

```
├── src/
│   ├── app/                 # Next.js App Router (Public and Admin routes)
│   ├── components/          # Reusable React components (Form, Gallery, Footer)
│   ├── contexts/            # React Auth context providers
│   ├── hooks/               # Custom hooks (Toasts, Firestore query helpers)
│   ├── lib/                 # Core utilities (Firebase Init, Email SMTP)
│   └── styles/              # Global CSS & Form style overrides
├── public/                  # Static assets and vectors
└── next.config.ts           # Next.js compiler settings and image whitelists
```

---

## 📄 License & Contact

Developed by **Muhammad Rehan Afzal** (Lead Developer).
### 🔗 Connect with the Developer
- **📧 Email:** [0xrehan.developer](mailto:0xrehan.developer@gmail.com)
- **🌐 Portfolio:** [rehan.dev](https://trade.monsternetwork.site)
- **💼 LinkedIn:** [linkedin.com/in/rehanqx](https://linkedin.com/in/rehanqx)
- **📸 Instagram:** [@m0nster_netw0rk](https://instagram.com/m0nster_netw0rk)

For inquiries, custom software modifications, or maintenance support, please reach out via the contact channels listed above.
