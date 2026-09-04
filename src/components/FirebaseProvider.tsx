import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from '../lib/firebase';

interface FirebaseContextType {
  user: any | null;
  loading: boolean;
  userData: any | null;
}

const FirebaseContext = createContext<FirebaseContextType>({ user: null, loading: true, userData: null });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    // Safety net: the UI must never remain on the loading screen forever.
    const loadingTimeout = window.setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timeout; continuing as guest.');
        setLoading(false);
      }
    }, 3000);

    try {
      unsubscribe = onAuthStateChanged(auth, async (nextUser: any) => {
        if (!mounted) return;
        setUser(nextUser);
        setLoading(false);
        window.clearTimeout(loadingTimeout);

        if (!nextUser) {
          setUserData(null);
          return;
        }

        try {
          const userRef = doc(db, 'users', nextUser.uid);
          const userSnap = await getDoc(userRef);

          if (!mounted) return;

          if (!userSnap.exists()) {
            const newData = {
              uid: nextUser.uid,
              email: nextUser.email,
              displayName: nextUser.displayName,
              currentMode: 'personal',
              language: 'English',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newData);
            if (mounted) setUserData(newData);
          } else {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error('Profile sync skipped:', error);
          if (mounted) setUserData(null);
        }
      });
    } catch (error) {
      console.error('Auth initialization failed; continuing as guest:', error);
      if (mounted) {
        setUser({
          uid: 'guest_user',
          email: 'guest@example.com',
          displayName: 'Guest User',
        });
        setUserData(null);
        setLoading(false);
      }
      window.clearTimeout(loadingTimeout);
    }

    return () => {
      mounted = false;
      window.clearTimeout(loadingTimeout);
      try {
        unsubscribe?.();
      } catch (error) {
        console.warn('Auth cleanup skipped:', error);
      }
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, userData }}>
      {children}
    </FirebaseContext.Provider>
  );
};
