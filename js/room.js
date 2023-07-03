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
let availableRooms = [];
let msgs = [];
let availableRoomIds = [];
let allowedEmails = [];
let replyingToVar = null;

const roomMessages = collection(db, 'rooms', roomId, "messages");
const querySnapshot = await getDocs(collection(db, "rooms"));
querySnapshot.forEach((doc) => {
    availableRooms.push(doc.data());
    availableRoomIds.push(doc.id);
    allowedEmails.push(doc.data().allowedEmails);
});

let index = availableRoomIds.indexOf(roomId);
if (allowedEmails[index].includes(email) == false) {
    window.location.href = 'index.html';
}

let roomIdIndex = availableRoomIds.indexOf(roomId);
document.querySelector('#title').innerText = availableRooms[roomIdIndex].name + " " + availableRooms[roomIdIndex].emoji;

//* Live Chat
const q = query(roomMessages);
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    msgs = [];
    querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
    });
    orderData();
});

// Orders data and put into msgs[]
async function orderData() {
    msgs = [];
    const orderDataq = query(roomMessages, orderBy('order'));
    const querySnapshot3 = await getDocs(orderDataq);
    querySnapshot3.forEach((doc) => {
        msgs.push(doc.data());
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
            docOrder = parseInt(msgs[msgs.length - 1].order);
        } catch (error) {
            docOrder = -1;
        }

        await setDoc(doc(db, "rooms", roomId, "messages", (docOrder + 1).toString()), {
            sender: username,
            senderPfp: profile_picture,
            senderEmail: email,
            content: value,
            order: docOrder + 1,
            timestamp: dateTime, // serverTimestamp()
            replyingTo: replyingToVar || null
        })
        input.value = '';
        input.focus();
        replyingToVar = null;
    }
}

// Loads all messages
function redrawChatWindow() {
    chatWindow.innerHTML = '';
    for (let i = 0; i < msgs.length; i++) {
        // HTML Elements for one message
        let msg_wrapper = document.createElement('div');
        msg_wrapper.classList.add('msg-wrapper');
        msg_wrapper.id = 'msg-wrapper-' + i;

        if (msgs[i].replyingTo != null && msgs[i].replyingTo != undefined) {
            let reply = document.createElement('div');
            reply.classList.add('reply');
            reply.id = 'reply-' + i;

            let spine = document.createElement('div');
            spine.classList.add('reply-spine');
            reply.appendChild(spine);

            // let reply_details = document.createElement('div');
            // reply_details.classList.add('reply-details');

            let reply_sender = document.createElement('p');
            reply_sender.innerText = msgs[msgs[i].replyingTo].sender/* + ":" */;
            reply_sender.classList.add('reply-sender');
            reply_sender.id = 'reply-sender-' + i;
            reply.appendChild(reply_sender);
            // reply_details.appendChild(reply_sender);

            let reply_msg = document.createElement('p');
            reply_msg.innerText = msgs[msgs[i].replyingTo].content;
            reply_msg.classList.add('reply-msg');
            reply_msg.id = 'reply-msg-' + i;
            reply.appendChild(reply_msg);
            // reply_details.appendChild(reply_msg);

            // reply.appendChild(reply_details);
            msg_wrapper.appendChild(reply);
            msg_wrapper.style.paddingTop = "5px";
        }

        let msg = document.createElement('div');
        msg.classList.add('msg');
        msg.id = 'msg-' + i;

        let img = document.createElement('img');
        img.src = msgs[i].senderPfp;
        img.alt = username + '\'s Profile Picture';
        img.classList.add('msg-pfp');
        img.id = 'pfp-' + i;
        msg.appendChild(img);

        let msg_inner = document.createElement('div');
        msg_inner.classList.add('msg-inner');
        msg_inner.id = 'msg-inner-' + i;

        let msg_sender = document.createElement('p');
        msg_sender.classList.add('msg-sender');
        msg_sender.innerText = msgs[i].sender;
        msg_sender.id = 'msg-sender-' + i;
        msg_inner.appendChild(msg_sender);

        let msg_timestamp = document.createElement('p');
        msg_timestamp.classList.add('msg-timestamp');
        msg_timestamp.innerText =  msgs[i].timestamp;
        msg_timestamp.id = 'msg-timestamp-' + i;
        msg_inner.appendChild(msg_timestamp);

        let msg_content = document.createElement('p');
        msg_content.classList.add('msg-content');
        msg_content.innerText =  msgs[i].content;
        msg_content.id = 'msg-content-' + i;
        msg_inner.appendChild(msg_content);

        msg.appendChild(msg_inner);
        msg_wrapper.appendChild(msg);

        msg_wrapper.addEventListener('click', function() {
            if (replyingToVar != i) {
                if (replyingToVar != null && replyingToVar != undefined) {
                    document.querySelector('#msg-wrapper-' + replyingToVar.toString()).classList.remove('replying-to');
                }
                replyingToVar = i;
                msg_wrapper.classList.add('replying-to');
            } else if (replyingToVar == i) {
                replyingToVar = null;
                msg_wrapper.classList.remove('replying-to');
            }
        });

        chatWindow.appendChild(msg_wrapper);
    }
}

// Allow the use of "Enter" to send messages
document.onkeyup = function(eventKeyName) {
    eventKeyName = eventKeyName;
    if (eventKeyName.key == 'Enter') {
        send.click();
    }
}

window.onresize = function() {
    if (window.innerWidth <= 480) {
        for (let j = 0; j < msgs.length; j++) {
            let msg_sender = document.querySelector('#msg-sender-' + j).innerText;
            if (msg_sender.length >= 20) {
                document.querySelector('#msg-sender-' + j).innerText = msg_sender.substr(0, 20) + "...";
            }

            if (msgs[j].replyingTo != null) {
                let reply_sender = document.querySelector('#reply-sender-' + j).innerText;
                if (reply_sender.length >= 20) {
                    document.querySelector('#reply-sender-' + j).innerText = reply_sender.substr(0, 20) + "...";
                }
            }
        }
    }
}