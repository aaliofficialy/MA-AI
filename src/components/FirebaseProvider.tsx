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
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      setUser(user);
      if (user) {
        // Sync user data
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            currentMode: 'personal',
            language: 'English',
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newData);
          setUserData(newData);
        } else {
          setUserData(userSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, userData }}>
      {children}
    </FirebaseContext.Provider>
  );
};
