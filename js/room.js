//* VARIABLES
import { app } from '/js/init.js';
import { getFirestore, collection, getDoc, getDocs, doc, setDoc, query, onSnapshot, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const profilePictureBtn = document.querySelector('#profile-picture');
const profileDropdownDetailsWrapper = document.querySelector('#profile-dropdown-details-wrapper');
const profileDropwdownPicture = document.querySelector('#profile-dropwdown-picture');
const profileDropdownName = document.querySelector('#profile-dropdown-name');
const profileDropdownEmail = document.querySelector('#profile-dropdown-email');
const input = document.querySelector('#input');
const send = document.querySelector('#send');
const chatWindow = document.querySelector('#chat-window');
send.addEventListener('click', sendMsg);

//* Firebase Authentication
// Initialize Firebase Authentication
const auth = getAuth(app);
// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();
let username;
let profile_picture;
let email;

//* Sign in
// Sign in with Google
onAuthStateChanged(auth, (user) => {
    if (user) {
        username = user.displayName;
        profile_picture = user.photoURL;
        email = user.email;
        signedIn();
    } else {
        notSignedIn();
        window.location.href = 'index.html';
    }
});

function signedIn() {
    profilePictureBtn.src = profile_picture;
    send.removeAttribute('disabled', 'true');
    input.removeAttribute('disabled', 'true');
    input.style.color = 'black';
    input.value = '';
}

function notSignedIn() {
    profilePictureBtn.src = '/images/default-pfp.jpg';
    send.setAttribute('disabled', 'true');
    input.setAttribute('disabled', 'true');
    input.style.color = 'white';
    input.value = 'Please Sign-in';
}

const searchParams = new URLSearchParams(window.location.search);
const roomId = searchParams.get('roomId');

//* Firebase Firestore
// Initialize Firebase Firestore
const db = getFirestore(app);

// Define arrays used later
let rooms = [];
let roomIds = [];
let msgsList = [];
let orderedMsgsList = [];
let availableRooms = [];
let allowedEmails = [];

const roomMessages = collection(db, 'rooms', roomId, "messages");
const querySnapshot = await getDocs(collection(db, "rooms"));
querySnapshot.forEach((doc) => {
    rooms.push(doc.data());
    roomIds.push(doc.data().roomId);
    availableRooms.push(doc.id);
    allowedEmails.push(doc.data().allowedEmails);
});

let index = availableRooms.indexOf(roomId);
if (allowedEmails[index].includes(email) == false) {
    window.location.href = 'index.html';
}

let roomIdIndex = roomIds.indexOf(roomId);
document.querySelector('#title').innerText = rooms[roomIdIndex].roomName + " " + rooms[roomIdIndex].roomEmoji;

//* Live Chat
const q = query(roomMessages);
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    msgsList = [];
    querySnapshot.forEach((doc) => {
        msgsList.push(doc.data());
    });
    orderData();
});

// Orders data and put into orderedMsgsList[]
async function orderData() {
    orderedMsgsList = [];
    const orderDataq = query(roomMessages, orderBy('order'));
    const querySnapshot3 = await getDocs(orderDataq);
    querySnapshot3.forEach((doc) => {
        orderedMsgsList.push(doc.data());
    });
    redrawChatWindow();
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
        if (currentMinutes < 10) {currentMinutes = "0" + currentMinutes.toString();}

        let dateTime = (currentDate.getMonth()+1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " at " + currentHour + ":" + currentMinutes + currentAM;

        let docOrder;
        try {
            docOrder = parseInt(orderedMsgsList[orderedMsgsList.length - 1].order);
        } catch (error) {
            docOrder = -1;
        }
        await setDoc(doc(db, "rooms", roomId, "messages", (docOrder + 1).toString()), {
            sender: username,
            senderPfp: profile_picture,
            senderEmail: email,
            content: value,
            order: docOrder + 1,
            timestamp: dateTime // serverTimestamp()
        });

        input.value = '';
        input.focus();
    }
}

// Loads all messages
function redrawChatWindow() {
    chatWindow.innerHTML = '';
    for (let i = 0; i < orderedMsgsList.length; i++) {
        addToChatWindow(orderedMsgsList[i].senderPfp, orderedMsgsList[i].sender, orderedMsgsList[i].content, orderedMsgsList[i].timestamp);
    }
}

// Creates HTML elements to load one message with given inputs
function addToChatWindow(pfp, username, message, date) {
    // Null checking
    if (!pfp || pfp == null) {pfp = '/images/default-pfp.jpg';}
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