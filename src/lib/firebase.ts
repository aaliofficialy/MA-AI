import { mockAuth, mockDb, where as mockWhere, orderBy as mockOrderBy, limit as mockLimit, serverTimestamp as mockServerTimestamp } from './mockFirebase';

export const auth = mockAuth;
export const db = mockDb;
export const googleProvider = {}; // Mock provider

export const signInWithPopup = (auth: any, provider: any) => mockAuth.signInWithPopup();
export const signOut = (auth: any) => mockAuth.signOut();
export const onAuthStateChanged = (auth: any, cb: any) => mockAuth.onAuthStateChanged(cb);

export const doc = (db: any, ...pathSegments: string[]) => ({ collectionName: pathSegments.slice(0, -1).join('/'), id: pathSegments[pathSegments.length - 1] });
export const collection = (db: any, ...pathSegments: string[]) => pathSegments.join('/');
export const query = (col: any, ...constraints: any[]) => mockDb.query(col, ...constraints);
export const where = mockWhere;
export const orderBy = mockOrderBy;
export const limit = mockLimit;
export const onSnapshot = (q: any, cb: any, errCb?: any) => mockDb.onSnapshot(q, cb, errCb);
export const getDoc = (docRef: any) => mockDb.getDoc(docRef);
export const setDoc = (docRef: any, data: any, options?: any) => mockDb.setDoc(docRef, data, options);
export const addDoc = (col: any, data: any) => mockDb.addDoc(col, data);
export const updateDoc = (docRef: any, data: any) => mockDb.updateDoc(docRef, data);
export const deleteDoc = (docRef: any) => mockDb.deleteDoc(docRef);
export const serverTimestamp = mockServerTimestamp;
