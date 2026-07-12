import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logAdminAction(adminEmail: string | null | undefined, action: string, details: string) {
  try {
    const logsRef = collection(db, 'admin_logs');
    await addDoc(logsRef, {
      adminEmail: adminEmail || 'system@madinapaintstore.com',
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to write admin activity log:', err);
  }
}
