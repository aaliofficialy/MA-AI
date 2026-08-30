
import { useEffect, useState } from 'react';

// Simplified types to match Firebase SDK used in the app
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class MockDb {
  private listeners: { [key: string]: Function[] } = {};

  private getStorageKey(collectionName: string) {
    return `mock_db_${collectionName}`;
  }

  private getData(collectionName: string): any[] {
    const data = localStorage.getItem(this.getStorageKey(collectionName));
    return data ? JSON.parse(data) : [];
  }

  private setData(collectionName: string, data: any[]) {
    localStorage.setItem(this.getStorageKey(collectionName), JSON.stringify(data));
    this.notify(collectionName);
  }

  private notify(collectionName: string) {
    if (this.listeners[collectionName]) {
      const data = this.getData(collectionName);
      this.listeners[collectionName].forEach(cb => cb(data));
    }
  }

  async collection(name: string) {
    return name;
  }

  async doc(collectionName: string, id: string) {
    return { collectionName, id };
  }

  async getDoc(docRef: any) {
    const data = this.getData(docRef.collectionName);
    const item = data.find(i => i.id === docRef.id);
    return {
      exists: () => !!item,
      data: () => item
    };
  }

  async setDoc(docRef: any, data: any, options?: { merge?: boolean }) {
    const collectionData = this.getData(docRef.collectionName);
    const index = collectionData.findIndex(i => i.id === docRef.id);
    
    let newData = { ...data, id: docRef.id };
    if (index !== -1 && options?.merge) {
      newData = { ...collectionData[index], ...data, id: docRef.id };
    }

    if (index !== -1) {
      collectionData[index] = newData;
    } else {
      collectionData.push(newData);
    }
    
    this.setData(docRef.collectionName, collectionData);
  }

  async addDoc(collectionName: string, data: any) {
    const collectionData = this.getData(collectionName);
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    const newData = { ...data, id };
    collectionData.push(newData);
    this.setData(collectionName, collectionData);
    return { id };
  }

  async updateDoc(docRef: any, data: any) {
    return this.setDoc(docRef, data, { merge: true });
  }

  async deleteDoc(docRef: any) {
    const collectionData = this.getData(docRef.collectionName);
    const newData = collectionData.filter(i => i.id !== docRef.id);
    this.setData(docRef.collectionName, newData);
  }

  onSnapshot(query: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) {
    const collectionName = typeof query === 'string' ? query : query.collectionName;
    
    const wrapper = (data: any[]) => {
      // Apply mock filtering/sorting if needed (query object would contain it)
      let filteredData = data;
      if (query.filters) {
        query.filters.forEach((f: any) => {
          if (f.op === '==') {
            filteredData = filteredData.filter(i => i[f.field] === f.value);
          }
        });
      }
      if (query.orderByField) {
        filteredData.sort((a, b) => {
          const valA = a[query.orderByField];
          const valB = b[query.orderByField];
          const modifier = query.orderDirection === 'desc' ? -1 : 1;
          if (valA < valB) return -1 * modifier;
          if (valA > valB) return 1 * modifier;
          return 0;
        });
      }
      if (query.limitCount) {
        filteredData = filteredData.slice(0, query.limitCount);
      }

      callback({
        docs: filteredData.map(d => ({
          id: d.id,
          data: () => d
        })),
        size: filteredData.length,
        empty: filteredData.length === 0
      });
    };

    if (!this.listeners[collectionName]) {
      this.listeners[collectionName] = [];
    }
    this.listeners[collectionName].push(wrapper);
    
    // Initial call
    wrapper(this.getData(collectionName));

    return () => {
      this.listeners[collectionName] = this.listeners[collectionName].filter(l => l !== wrapper);
    };
  }

  query(collectionName: string, ...constraints: any[]) {
    const q: any = { collectionName, filters: [] };
    constraints.forEach(c => {
      if (c.type === 'where') q.filters.push(c);
      if (c.type === 'orderBy') {
        q.orderByField = c.field;
        q.orderDirection = c.direction;
      }
      if (c.type === 'limit') q.limitCount = c.count;
    });
    return q;
  }
}

export const mockDb = new MockDb();

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => ({ type: 'orderBy', field, direction });
export const limit = (count: number) => ({ type: 'limit', count });
export const serverTimestamp = () => Date.now();

class MockAuth {
  private user: MockUser | null = null;
  private listeners: Function[] = [];

  constructor() {
    const stored = localStorage.getItem('mock_auth_user');
    if (stored) {
      this.user = JSON.parse(stored);
    } else {
        // Default guest user for direct access
        this.user = {
            uid: 'guest_user',
            email: 'guest@example.com',
            displayName: 'Guest User'
        };
        localStorage.setItem('mock_auth_user', JSON.stringify(this.user));
    }
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    callback(this.user);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signInWithPassword(role: string, pass: string) {
    if (role === 'admin' && pass === 'Admin@MA2024') {
      this.user = {
        uid: 'admin_user',
        email: 'aaliofficialy@gmail.com',
        displayName: 'Aali (Admin)'
      };
      localStorage.setItem('mock_auth_user', JSON.stringify(this.user));
      this.listeners.forEach(l => l(this.user));
      return { success: true, user: this.user };
    }
    return { success: false };
  }

  async signInWithPopup() {
    // Falls back to password for admin
    return { success: false, error: 'Password authentication required for Admin Portal' };
  }

  async signOut() {
    this.user = {
      uid: 'guest_user',
      email: 'guest@example.com',
      displayName: 'Guest User'
    };
    localStorage.setItem('mock_auth_user', JSON.stringify(this.user));
    this.listeners.forEach(l => l(this.user));
  }

  get currentUser() {
    return this.user;
  }
}

export const mockAuth = new MockAuth();
