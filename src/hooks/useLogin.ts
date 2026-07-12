import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Starting email login for:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Auth success:", result.user.uid);
      return result.user;
    } catch (err: any) {
      console.error("Login error code:", err.code);
      console.error("Login error message:", err.message);
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Starting Google OAuth login");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google Auth success:", result.user.uid);
      return result.user;
    } catch (err: any) {
      console.error("Google Login error code:", err.code);
      console.error("Google Login error message:", err.message);
      const errorMessage = err.message || 'Failed to login with Google';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loginWithEmail, loginWithGoogle, loading, error };
}
