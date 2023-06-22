// Imported functions from SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdFXFvjXFUN4oRQrhh53kre4no6UrSLgU",
    authDomain: "chat-app-try1-saisiddhish.firebaseapp.com",
    projectId: "chat-app-try1-saisiddhish",
    storageBucket: "chat-app-try1-saisiddhish.appspot.com",
    messagingSenderId: "85191752183",
    appId: "1:85191752183:web:fe1202346953562c37d6f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };