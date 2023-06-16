// Imported functions from SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, onSnapshot, orderBy, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

// Initialize Firebase Firestore
const db = getFirestore(app);
// Get collection and define arrays used later
const msgsCol = collection(db, 'messages');
let msgsList = [];
let orderedMsgsList = [];

// Initialize Firebase Authentication
const auth = getAuth(app);
// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();
let username;
let profile_picture;
let email;

const chatWindow = document.querySelector('#chat-window');
const input = document.querySelector('#input');
const send = document.querySelector('#send');
send.addEventListener('click', sendMsg);
const signInWithGoogleBtn = document.querySelector('#sign-in-with-google');
signInWithGoogleBtn.addEventListener('click', signInWithGoogle);
const signOutBtn = document.querySelector('#sign-out');
signOutBtn.addEventListener('click', customSignOut);
const profilePictureBtn = document.querySelector('#profile-picture');
const profileDropdownDetailsWrapper = document.querySelector('#profile-dropdown-details-wrapper');
const profileDropwdownPicture = document.querySelector('#profile-dropwdown-picture');
const profileDropdownName = document.querySelector('#profile-dropdown-name');
const profileDropdownEmail = document.querySelector('#profile-dropdown-email');

// Live Chat
const q = query(collection(db, "messages"));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    msgsList = [];
    console.log(msgsList);
    querySnapshot.forEach((doc) => {
        msgsList.push(doc.data());
    });
    orderData();
});

// Orders data and put into orderedMsgsList[]
async function orderData() {
    orderedMsgsList = [];
    const orderDataq = query(msgsCol, orderBy('order'));
    const querySnapshot2 = await getDocs(orderDataq);
    querySnapshot2.forEach((doc) => {
        orderedMsgsList.push(doc.data());
    });
    loadChatWindow();
}

// Sign in
// Sign in with Google
function signInWithGoogle() {
    signInWithPopup(auth, provider)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        const user = result.user;

        username = user.displayName;
        profile_picture = user.photoURL;
        email = user.email;

        signedIn();
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        notSignedIn();
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        username = user.displayName;
        profile_picture = user.photoURL;
        email = user.email;
        
        setProfileDropdown();
    } else {
        notSignedIn();
    }
});  

function setProfileDropdown() {
    signedIn();
    profilePictureBtn.src = profile_picture;
    profileDropwdownPicture.src = profile_picture;
    profileDropdownName.innerText = username;
    profileDropdownEmail.innerText = email;
}

function notSignedIn() {
    profilePictureBtn.src = '/assets/images/default-pfp.jpg';
    signInWithGoogleBtn.style.display = 'block';
    signOutBtn.style.display = 'none';
    profileDropdownDetailsWrapper.style.display = 'none';
    send.setAttribute('disabled', 'true');
    input.setAttribute('disabled', 'true');
    input.style.color = 'white';
    input.value = 'Please Sign-in';
}

function signedIn() {
    signInWithGoogleBtn.style.display = 'none';
    signOutBtn.style.display = 'block';
    profileDropdownDetailsWrapper.style.display = 'flex';
    send.removeAttribute('disabled', 'true');
    input.removeAttribute('disabled', 'true');
    input.style.color = 'black';
    input.value = '';
}

function customSignOut() {
    signOut(auth).then(() => {
        // Sign-out successful.
        notSignedIn();
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

// Creates Firebase document
async function sendMsg() {
    let value = input.value;
    if (value == '' || value == ' ') {

    } else {
        let currentDate = new Date();

        let currentHour = currentDate.getHours();
        let currentAM = 'AM';
        if (currentHour >= 12) {currentAM = 'PM';}
        if (currentHour > 12) {currentHour = currentHour - 12;}

        let currentMinutes = currentDate.getMinutes();
        if (currentMinutes.length < 2) {currentMinutes = "0" + currentMinutes;}

        let dateTime = (currentDate.getMonth()+1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " at " + currentHour + ":" + currentDate.getMinutes() + currentAM;

        await setDoc(doc(db, "messages", (orderedMsgsList[orderedMsgsList.length - 1].order + 1).toString()), {
            sender: username,
            senderPfp: profile_picture,
            content: value,
            order: orderedMsgsList[orderedMsgsList.length - 1].order + 1,
            timestamp: dateTime
        });

        input.value = '';
        input.focus();
    }
}

// Loads all messages
function loadChatWindow() {
    chatWindow.innerHTML = '';
    for (let i = 0; i < orderedMsgsList.length; i++) {
        reloadChatWindow(orderedMsgsList[i].senderPfp, orderedMsgsList[i].sender, orderedMsgsList[i].content, orderedMsgsList[i].timestamp);
    }
}

// Creates HTML elements to load one message with given inputs
function reloadChatWindow(pfp, username, message, date) {
    // Null checking
    if (!pfp || pfp == null) {pfp = '/assets/images/default-pfp.jpg';}
    if (!username || username == null) {username = 'User';}
    if (!message) {message = 'Test12345';}

    // HTML Elements for one message
    let msg_wrapper = document.createElement('div');
    msg_wrapper.classList.add('msg-wrapper');

    let img = document.createElement('img');
    img.src = pfp;
    img.alt = username + '\'s Profile Picture';
    img.classList.add('msg-pfp');
    msg_wrapper.appendChild(img);

    let msg_inner = document.createElement('div');
    msg_inner.classList.add('msg-inner');

    let msg_sender = document.createElement('p');
    msg_sender.classList.add('msg-sender');
    msg_sender.innerText = username;
    msg_inner.appendChild(msg_sender);

    let msg_timestamp = document.createElement('p');
    msg_timestamp.classList.add('msg-timestamp');
    msg_timestamp.innerText = date;
    msg_inner.appendChild(msg_timestamp);

    let msg_content = document.createElement('p');
    msg_content.classList.add('msg-content');
    msg_content.innerText = message;
    msg_inner.appendChild(msg_content);

    msg_wrapper.appendChild(msg_inner);
    chatWindow.appendChild(msg_wrapper);
}

// Allow the use of "Enter" to send messages
document.onkeyup = function(eventKeyName) {
    eventKeyName = eventKeyName;
    if (eventKeyName.key == 'Enter') {
        send.click();
    }
}