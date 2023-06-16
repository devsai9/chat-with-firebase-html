import { app } from '/js/init.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Initialize Firebase Authentication
const auth = getAuth(app);
// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();
let username;
let profile_picture;
let email;

const signInWithGoogleBtn = document.querySelector('#sign-in-with-google');
const signOutBtn = document.querySelector('#sign-out');
const profilePictureBtn = document.querySelector('#profile-picture');
const profileDropdownDetailsWrapper = document.querySelector('#profile-dropdown-details-wrapper');
const profileDropwdownPicture = document.querySelector('#profile-dropwdown-picture');
const profileDropdownName = document.querySelector('#profile-dropdown-name');
const profileDropdownEmail = document.querySelector('#profile-dropdown-email');
const input = document.querySelector('#input');
const send = document.querySelector('#send');

signInWithGoogleBtn.addEventListener('click', signInWithGoogle);
signOutBtn.addEventListener('click', customSignOut);

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

function signedIn() {
    signInWithGoogleBtn.style.display = 'none';
    signOutBtn.style.display = 'block';
    profileDropdownDetailsWrapper.style.display = 'flex';
    send.removeAttribute('disabled', 'true');
    input.removeAttribute('disabled', 'true');
    input.style.color = 'black';
    input.value = '';
}

function notSignedIn() {
    profilePictureBtn.src = '/images/default-pfp.jpg';
    signInWithGoogleBtn.style.display = 'block';
    signOutBtn.style.display = 'none';
    profileDropdownDetailsWrapper.style.display = 'none';
    send.setAttribute('disabled', 'true');
    input.setAttribute('disabled', 'true');
    input.style.color = 'white';
    input.value = 'Please Sign-in';
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

export { username, email, profile_picture };