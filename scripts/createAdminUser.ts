import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
const rawKey = process.env.FIREBASE_ADMIN_SDK_KEY || '{}';
let serviceAccountKey;
try {
  serviceAccountKey = JSON.parse(rawKey);
} catch (e) {
  console.error("❌ Failed to parse FIREBASE_ADMIN_SDK_KEY as JSON. Make sure it is formatted properly in .env.local.");
  process.exit(1);
}

if (!process.env.FIREBASE_ADMIN_SDK_KEY) {
  console.error("❌ FIREBASE_ADMIN_SDK_KEY is not defined in .env.local.");
  process.exit(1);
}

if (getApps().length === 0) {
  admin.initializeApp({
    credential: cert(serviceAccountKey),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();
const auth = getAuth();

async function createAdminUser(email: string, password: string, displayName: string) {
  try {
    console.log(`Creating admin user: ${email}...`);

    // Create auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log(`✓ Auth user created with UID: ${userRecord.uid}`);

    // Create admin document in Firestore
    await db.collection('admin_users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name: displayName,
      role: 'super_admin',
      permissions: ['bookings', 'inventory', 'gallery', 'services', 'messages'],
      createdAt: new Date(),
    });

    console.log(`✓ Admin document created in Firestore`);
    console.log('\n✅ Admin user created successfully!');
    console.log(`\nAdmin Email: ${email}`);
    console.log(`Admin Password: ${password}`);
    console.log('\n⚠️  Please change the password after first login.');

    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.error(`❌ Email already exists: ${email}`);
    } else if (error.code === 'auth/invalid-email') {
      console.error(`❌ Invalid email: ${email}`);
    } else {
      console.error(`❌ Error creating admin user:`, error.message);
    }
    process.exit(1);
  }
}

// Get email, password, and name from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const displayName = process.argv[4] || 'Admin';

if (!email || !password) {
  console.log('Usage: npm run create-admin <email> <password> [displayName]');
  console.log('\nExample:');
  console.log('npm run create-admin admin@paintshop.com MySecurePass123 "Shop Owner"');
  process.exit(1);
}

createAdminUser(email, password, displayName)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
