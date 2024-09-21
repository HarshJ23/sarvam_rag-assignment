// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAzwkWTYYXfDtToqwAUZWvROzG9n2-OCaw",
    authDomain: "walmart-assistant-d0901.firebaseapp.com",
    projectId: "walmart-assistant-d0901",
    storageBucket: "walmart-assistant-d0901.appspot.com",
    messagingSenderId: "1007571379271",
    appId: "1:1007571379271:web:b06028421d9a7a4d8a7d62"
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
