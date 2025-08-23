// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiQng4jJWlmlrFBOfQvF14LgpuA3TlzNc",
  authDomain: "konkou-lakay.firebaseapp.com",
  projectId: "konkou-lakay",
  storageBucket: "konkou-lakay.appspot.com",
  messagingSenderId: "995665826821",
  appId: "1:995665826821:web:ce5d2e99ef0ce4730ef86c",
  measurementId: "G-0MV789VHW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 