import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY)
  : null;

const app = getApps().length > 0 
  ? getApp() 
  : initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
