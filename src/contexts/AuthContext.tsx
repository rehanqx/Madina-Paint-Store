'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

interface AuthContextType {
  currentUser: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.uid);
      
      if (user) {
        setCurrentUser(user);
        
        try {
          const adminDocRef = doc(db, 'admin_users', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          
          console.log("Admin doc exists:", adminDocSnap.exists());
          console.log("Admin doc data:", adminDocSnap.data());
          
          if (adminDocSnap.exists()) {
            setAdminUser(adminDocSnap.data() as AdminUser);
            console.log("User is admin!");
          } else {
            setAdminUser(null);
            console.log("User is NOT admin");
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
          setAdminUser(null);
        }
      } else {
        console.log("User logged out");
        setCurrentUser(null);
        setAdminUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAdminUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    adminUser,
    loading,
    isAdmin: adminUser !== null,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
