import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA4I-4SaMem2A9cCL4YC31Cni3kkYKDeis",
  authDomain: "nbcbillingsystem.firebaseapp.com",
  projectId: "nbcbillingsystem",
  storageBucket: "nbcbillingsystem.firebasestorage.app",
  messagingSenderId: "268993827239",
  appId: "1:268993827239:web:7a5b5ef02d9502a2c52682",
  measurementId: "G-1V1PLFPHCJ",
  databaseURL: "https://nbcbillingsystem-default-rtdb.firebaseio.com"
};

export const app = initializeApp(firebaseConfig);