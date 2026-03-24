'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCdjYHr6E5KpHUpaFHZYj7Ei7IQ1UXcIf0',
  authDomain: 'society-subscription-3b386.firebaseapp.com',
  projectId: 'society-subscription-3b386',
  storageBucket: 'society-subscription-3b386.firebasestorage.app',
  messagingSenderId: '337033554338',
  appId: '1:337033554338:web:83575d326c300c3c6daafb',
  measurementId: 'G-G22D0QT4KL',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
