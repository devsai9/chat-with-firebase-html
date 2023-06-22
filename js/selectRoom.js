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
const dms = document.querySelector('#dms');
const groups = document.querySelector('#groups');

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
let availableRoomTypes = [];
async function getRooms() {
    if (signedInBool) {
        const query1 = query(collection(db, "rooms"), where('allowedEmails', 'array-contains', email.toString()));
        const querySnapshot = await getDocs(query1);
        querySnapshot.forEach((doc) => {
            availableRoomIds.push(doc.id);
            allowedEmails.push(doc.data().allowedEmails);
            availableRoomEmojis.push(doc.data().roomEmoji);
            availableRoomNames.push(doc.data().roomName);
            availableRoomTypes.push(doc.data().roomType);
        });
    }
    showAvailableRooms();
}

function showAvailableRooms() {
    for (let i = 0; i < availableRoomIds.length; i++) {
        showAvailableRoom(availableRoomNames[i], "Room ID: " + availableRoomIds[i], availableRoomEmojis[i], availableRoomTypes[i]);
    }
}

function showAvailableRoom(roomName, roomId, roomEmoji, groupType) {
    let container = document.createElement('div');
    container.classList.add('chat-list-item');

    let emoji = document.createElement('p');
    emoji.classList.add('chat-list-item-roomemoji');
    emoji.innerText = roomEmoji;
    container.appendChild(emoji)

    let roomDetails = document.createElement('div');
    roomDetails.classList.add('chat-list-item-room-details');

    let name = document.createElement('h3');
    name.classList.add('chat-list-item-room-name');
    name.innerText = roomName;
    roomDetails.appendChild(name);

    let id = document.createElement('p');
    id.classList.add('chat-list-item-room-id');
    id.innerText = roomId;
    roomDetails.appendChild(id);
    container.appendChild(roomDetails);

    if (groupType == "dm") {
        dms.appendChild(container);
    } else {
        groups.appendChild(container);
    }

    container.addEventListener('click', function() {
        window.location.href = 'room.html?roomId=' + roomId.replace("Room ID: ", "");
    });
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
    }, 100);
}

function notSignedIn() {
    allowedEmails = [];
    availableRoomIds = [];
    availableRoomEmojis = [];
    availableRoomNames = [];
    availableRoomTypes = [];

    signedInBool = false;

    profilePictureBtn.src = '/images/default-pfp.jpg';
    signInWithGoogleBtn.style.display = 'block';
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

export { signedInBool }