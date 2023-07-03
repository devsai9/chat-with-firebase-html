import { app } from '/js/init.js';
import { getFirestore, collection, getDocs, where, query } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const signInWithGoogleBtn = document.querySelector('#sign-in-with-google');
const signOutBtn = document.querySelector('#sign-out');

const profilePictureBtn = document.querySelector('#profile-picture');
const profileDropdown = document.querySelector('#profile-dropdown');
const profileDropdownDetailsWrapper = document.querySelector('#profile-dropdown-details-wrapper');
const profileDropwdownPicture = document.querySelector('#profile-dropwdown-picture');
const profileDropdownName = document.querySelector('#profile-dropdown-name');
const profileDropdownEmail = document.querySelector('#profile-dropdown-email');

const availableChats = document.querySelector('#available-chats');
const dms_container = document.querySelector('#dms-container');
const groups_container = document.querySelector('#groups-container');
const dms = document.querySelector('#dms');
const groups = document.querySelector('#groups');
const dms_btn = document.querySelector('#dms-btn');
const groups_btn = document.querySelector('#groups-btn');

// Initialize Firebase Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();
let username;
let profile_picture;
let email;
let signedInBool;
let signedInWithGoogleBool = false;

signInWithGoogleBtn.addEventListener('click', signInWithGoogle);
signOutBtn.addEventListener('click', customSignOut);

dms_btn.addEventListener('click', toggleActiveTab);
groups_btn.addEventListener('click', toggleActiveTab);

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
        signedInBool = true;
        signedInWithGoogleBool = true;

        getRooms();
        signedIn();
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        signedInBool = false;
        notSignedIn();
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        username = user.displayName;
        profile_picture = user.photoURL;
        email = user.email;
        signedInBool = true;
        setProfileDropdown();
        signedIn();
    } else {
        signedInBool = false;
        notSignedIn();
    }
}); 

let allowedEmails = [];
let availableRoomIds = [];
let availableRoomEmojis = [];
let availableRoomNames = [];
async function getRooms() {
    if (signedInBool) {
        const query1 = query(collection(db, "rooms"), where('allowedEmails', 'array-contains', email.toString()));
        const querySnapshot = await getDocs(query1);
        querySnapshot.forEach((doc) => {
            availableRoomIds.push(doc.id);
            allowedEmails.push(doc.data().allowedEmails);
            availableRoomEmojis.push(doc.data().emoji);
            availableRoomNames.push(doc.data().name);
        });
    }
    showAvailableRooms();
}

function showAvailableRooms() {
    for (let i = 0; i < availableRoomIds.length; i++) {
        let container = document.createElement('div');
        container.classList.add('chat-list-item');
        container.tabIndex = 3;
        container.id = availableRoomIds[i];

        let emoji = document.createElement('p');
        emoji.classList.add('chat-list-item-roomemoji');
        emoji.innerText = availableRoomEmojis[i];
        container.appendChild(emoji)

        let roomDetails = document.createElement('div');
        roomDetails.classList.add('chat-list-item-room-details');

        let name = document.createElement('h3');
        name.classList.add('chat-list-item-room-name');
        name.innerText = availableRoomNames[i];
        roomDetails.appendChild(name);

        // let id = document.createElement('p');
        // id.classList.add('chat-list-item-room-id');
        // id.innerText = availableRoomIds[i];;
        // roomDetails.appendChild(id);
        container.appendChild(roomDetails);

        if (allowedEmails[i].length <= 2) {
            dms.appendChild(container);
        } else {
            groups.appendChild(container);
        }

        container.addEventListener('click', function() {
            window.location.href = 'room.html?roomId=' + availableRoomIds[i];
        });
    }
    groups_container.style.display = 'none';
}

function setProfileDropdown() {
    profilePictureBtn.src = profile_picture;
    profileDropwdownPicture.src = profile_picture;
    profileDropdownName.innerText = username;
    profileDropdownEmail.innerText = email;
}

function signedIn() {
    signedInBool = true;
    
    signInWithGoogleBtn.style.display = 'none';
    signOutBtn.style.display = 'block';
    profileDropdownDetailsWrapper.style.display = 'flex';
    profilePictureBtn.style.display = 'block';
    availableChats.style.display = 'block';

    setTimeout(function() {
        if (!signedInWithGoogleBool) {
            getRooms();
        }
    }, 500);
}

function notSignedIn() {
    allowedEmails = [];
    availableRoomIds = [];
    availableRoomEmojis = [];
    availableRoomNames = [];

    signedInBool = false;

    profilePictureBtn.src = '/images/default-pfp.jpg';
    signInWithGoogleBtn.style.display = 'flex';
    signOutBtn.style.display = 'none';
    profileDropdown.style.display = 'none';
    profileDropdownDetailsWrapper.style.display = 'none';
    profilePictureBtn.style.display = 'none';
    availableChats.style.display = 'none';

    dms.innerHTML = '';
    groups.innerHTML = '';
}

// Sign Out
function customSignOut() {
    signOut(auth).then(() => {
        // Sign-out successful.
        notSignedIn();
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

// Side Menu
function toggleActiveTab() {
    let activeTabId = document.querySelector('.side-menu-btn-active').id;
    if (activeTabId == 'dms-btn') {
        dms_btn.classList.remove('side-menu-btn-active');
        groups_btn.classList.add('side-menu-btn-active');
        dms_container.style.display = 'none';
        groups_container.style.display = 'block';
    } else if (activeTabId == 'groups-btn') {
        groups_btn.classList.remove('side-menu-btn-active');
        dms_btn.classList.add('side-menu-btn-active');
        groups_container.style.display = 'none';
        dms_container.style.display = 'block';
    }
}

// Dropdown
const imgBtn = document.querySelector('#profile-picture');
const dropDown = document.querySelector('#profile-dropdown');

imgBtn.addEventListener('click', toggleDropdown);

document.onkeyup = function(eventKeyName) {
    eventKeyName = eventKeyName;
    if (eventKeyName.key == 'Enter' && availableRoomIds.includes(document.activeElement.id)) {
        window.location.href = 'room.html?roomId=' + document.activeElement.id;
    }
    if (eventKeyName.key == 'Enter' && document.activeElement === imgBtn) {
        toggleDropdown();
    }
}

function toggleDropdown() {
    if (signedInBool) {
        if (dropDown.style.display == 'none' || dropDown.style.display == '') {
            dropDown.style.display = 'flex';
        } else {
            dropDown.style.display = 'none';
        }
    } else {}
}