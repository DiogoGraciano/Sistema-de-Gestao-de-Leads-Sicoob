// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "sua-auth-domain.firebaseapp.com",
  projectId: "sua-project-id",
  storageBucket: "sua-storage-bucket.firebasestorage.app",
  messagingSenderId: "sua-messaging-sender-id",
  appId: "1:sua-app-id:web:sua-web-id",
  measurementId: "sua-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
