import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCustomer = async (email: string, password: string, name: string, phone: string, address: string) => {
    setLoading(true);
    setError(null);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: name });

      // Create customer document in Firestore
      await setDoc(doc(db, 'customers', user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        address,
        createdAt: new Date(),
        lastBookingDate: null,
      });

      return user;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registerCustomer, loading, error };
}
