// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJTvsp_JUOw0_yDqRIQ9jb7uHJlc5UX_Q",
  authDomain: "dj-request-app-49063.firebaseapp.com",
  projectId: "dj-request-app-49063",
  storageBucket: "dj-request-app-49063.firebasestorage.app",
  messagingSenderId: "50988290668",
  appId: "1:50988290668:web:ddbe45146bd1898fb83e49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };