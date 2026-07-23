const admin = require('firebase-admin');
const { getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const rawKey = process.env.FIREBASE_ADMIN_SDK_KEY || '{}';
let serviceAccountKey = JSON.parse(rawKey);

if (getApps().length === 0) {
  admin.initializeApp({
    credential: cert(serviceAccountKey),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

async function checkGallery() {
  try {
    const snapshot = await db.collection('gallery').orderBy('order', 'asc').get();
    console.log(`Total gallery items: ${snapshot.size}`);
    snapshot.forEach(doc => {
      console.log(`ID: ${doc.id}`);
      console.log(`Data:`, JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
  } catch (error) {
    console.error(error);
  }
}

checkGallery().then(() => process.exit(0));
