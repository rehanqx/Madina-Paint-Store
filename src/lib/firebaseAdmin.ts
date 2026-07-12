import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Parse the service account key from environment variable safely
const serviceAccountKey = JSON.parse(
  process.env.FIREBASE_ADMIN_SDK_KEY || '{}'
);

if (getApps().length === 0) {
  admin.initializeApp({
    credential: Object.keys(serviceAccountKey).length > 0
      ? cert(serviceAccountKey)
      : undefined,
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

export default admin;
