import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCWimaA-a6PbPpP40kXVOnQzUi2ewyGqU8",
  authDomain: "movies-97da1.firebaseapp.com",
  projectId: "movies-97da1",
  storageBucket: "movies-97da1.firebasestorage.app",
  messagingSenderId: "501822225855",
  appId: "1:501822225855:web:7388e77bdfa8206011350a",
  measurementId: "G-38HF8W4JQ6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
