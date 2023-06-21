import { app } from '/js/init.js';
import { getFirestore, collection, getDocs, where, query } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const signInWithGoogleBtn = document.querySelector('#sign-in-with-google');
const signInWithGoogleNotInDropdownBtn = document.querySelector('#sign-in-with-google-out-of-dropdown');
const signOutBtn = document.querySelector('#sign-out');
const profilePictureBtn = document.querySelector('#profile-picture');
const profileDropdown = document.querySelector('#profile-dropdown');
const profileDropdownDetailsWrapper = document.querySelector('#profile-dropdown-details-wrapper');
const profileDropwdownPicture = document.querySelector('#profile-dropwdown-picture');
const profileDropdownName = document.querySelector('#profile-dropdown-name');
const profileDropdownEmail = document.querySelector('#profile-dropdown-email');
const input = document.querySelector('#input');
const send = document.querySelector('#send');

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

signInWithGoogleNotInDropdownBtn.addEventListener('click', signInWithGoogle);
signOutBtn.addEventListener('click', customSignOut);
send.addEventListener('click', joinRoom);

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
        getRooms();
    } else {
        signedInBool = false;
        notSignedIn();
    }
}); 

let availableRooms = [];
let allowedEmails = [];
async function getRooms() {
    if (signedInBool) {
        const query1 = query(collection(db, "rooms"), where('allowedEmails', 'array-contains', email.toString()));
        const querySnapshot = await getDocs(query1);
        querySnapshot.forEach((doc) => {
            availableRooms.push(doc.id);
            allowedEmails.push(doc.data().allowedEmails);
        });
    }
}

function joinRoom() {
    if (availableRooms.includes(input.value)) {
        output.innerText = "Authenticating. This may take a moment...";
        let index = availableRooms.indexOf(input.value);
        if (allowedEmails[index].includes(email)) {
            output.innerText = "Success. Redirecting...";
            window.location.href = 'room.html?roomId=' + input.value;
        } // else {
        //     output.innerText = "You do not have access to this room";
        // }
    } else {
        output.innerText = "Room not found";
    }
}

function setProfileDropdown() {
    signedIn();
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
    send.removeAttribute('disabled', 'true');
    input.removeAttribute('disabled', 'true');
    input.style.display = 'block';
    send.style.display = 'block';
    input.style.color = 'black';
    input.value = '';
    signInWithGoogleNotInDropdownBtn.style.display = 'none';
}

function notSignedIn() {
    signedInBool = false;
    profilePictureBtn.src = '/images/default-pfp.jpg';
    signInWithGoogleBtn.style.display = 'block';
    signOutBtn.style.display = 'none';
    profileDropdown.style.display = 'none';
    profileDropdownDetailsWrapper.style.display = 'none';
    profilePictureBtn.style.display = 'none';
    send.setAttribute('disabled', 'true');
    input.setAttribute('disabled', 'true');
    input.style.display = 'none';
    send.style.display = 'none';
    signInWithGoogleNotInDropdownBtn.style.display = 'block';
}

// Sign Out
function customSignOut() {
    signOut(auth).then(() => {
        // Sign-out successful.
        notSignedIn();
        signedInBool = false;
        availableRooms = [];
        allowedEmails = [];
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

// Allow the use of "Enter"
document.onkeyup = function(eventKeyName) {
    eventKeyName = eventKeyName;
    if (eventKeyName.key == 'Enter') {
        send.click();
    }
}

export { signedInBool }