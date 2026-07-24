'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useLogin';
import { useToast } from '@/hooks/useToast';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { mapFirebaseError } from '@/lib/firebaseErrorMap';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { loginWithEmail, loginWithGoogle, loading, error: hookError } = useLogin();
  const toast = useToast();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Form validation before submit
    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    console.log("Attempting login with:", email);
    try {
      console.log("Calling loginWithEmail...");
      const user = await loginWithEmail(email, password);
      console.log("Login success! User:", user);

      // Check if user is admin in Firestore
      const adminDocRef = doc(db, 'admin_users', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      console.log("Admin check:", adminDoc.exists());

      if (!adminDoc.exists()) {
        console.error("User not found in admin_users collection");
        setLocalError("This account is not authorized as an admin.");
        await signOut(auth);
        return;
      }

      console.log("Admin verified, redirecting...");
      toast.success("Welcome to Admin Dashboard!");
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      const errorCode = err.code || 'default';
      const mapped = mapFirebaseError(errorCode);
      setLocalError(mapped);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    try {
      console.log("Attempting Google login...");
      const user = await loginWithGoogle();
      console.log("Google login success! User:", user);

      // Check if user is admin in Firestore
      const adminDocRef = doc(db, 'admin_users', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      console.log("Admin check:", adminDoc.exists());

      if (!adminDoc.exists()) {
        console.error("User not found in admin_users collection");
        setLocalError("This account is not authorized as an admin.");
        await signOut(auth);
        return;
      }

      console.log("Admin verified, redirecting...");
      toast.success("Welcome back!");
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorCode = err.code || 'default';
      const mapped = mapFirebaseError(errorCode);
      setLocalError(mapped);
    }
  };

  const activeError = localError || hookError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-[#1b300d] to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 p-8 transition-transform">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2D5016]">
            Madina <span className="text-[#E8B44D]">Paint</span> Store
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm uppercase tracking-wider">Admin Portal</p>
        </div>

        {activeError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {activeError}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-base disabled:bg-gray-100"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-base disabled:bg-gray-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#2D5016] text-white rounded-lg font-semibold hover:bg-[#203a10] disabled:bg-gray-400 transition shadow-lg flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400 font-medium">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 mt-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Login with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Not an admin? <Link href="/" className="text-[#2D5016] hover:text-[#203a10] font-semibold hover:underline">Go to home</Link>
        </p>
      </div>
    </div>
  );
}
