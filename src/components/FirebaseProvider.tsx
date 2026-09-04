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

    const unsubscribe = onAuthStateChanged(auth, async (nextUser: any) => {
      if (!mounted) return;
      setUser(nextUser);
      // Never block the whole application on optional profile syncing.
      setLoading(false);

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
        // The app remains usable even if local profile storage is unavailable/corrupt.
        if (mounted) setUserData(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, userData }}>
      {children}
    </FirebaseContext.Provider>
  );
};
