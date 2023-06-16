// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, onSnapshot, orderBy, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const db = getFirestore(app);

const msgsCol = collection(db, 'messages');
// const msgsSnapshot = await getDocs(msgsCol);
// let msgsList = msgsSnapshot.docs.map(doc => doc.data());
// console.log(msgsList);
let msgsList = [];

let orderedMsgsList = [];

let chatWindow = document.querySelector('#chat-window');

const q = query(collection(db, "messages"));
const unsubscribe = onSnapshot(q, (querySnapshot) => {
    msgsList = [];
    console.log(msgsList);
    querySnapshot.forEach((doc) => {
        msgsList.push(doc.data());
    });
    orderData();
});

async function orderData() {
    orderedMsgsList = [];
    const orderDataq = query(msgsCol, orderBy('order'));
    const querySnapshot2 = await getDocs(orderDataq);
    querySnapshot2.forEach((doc) => {
        orderedMsgsList.push(doc.data());
    });
    loadChatWindow();
}

// Code for website
let input = document.querySelector('#input');
let send = document.querySelector('#send');

send.addEventListener('click', sendMsg);

async function sendMsg() {
    let value = input.value;
    if (value == '' || value == ' ') {

    } else {
        let currentDate = new Date();

        let currentHour = currentDate.getHours();
        let currentAM = 'AM';
        if (currentHour >= 12) {currentAM = 'PM';}
        if (currentHour > 12) {currentHour = currentHour - 12;}

        let dateTime = (currentDate.getMonth()+1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + " at " + currentHour + ":" + currentDate.getMinutes()+ currentAM;

        await setDoc(doc(db, "messages", (orderedMsgsList[orderedMsgsList.length - 1].order + 1).toString()), {
            sender: "User",
            content: value,
            order: orderedMsgsList[orderedMsgsList.length - 1].order + 1,
            timestamp: dateTime
        });

        input.value = '';
        input.focus();
    }
}

function loadChatWindow() {
    chatWindow.innerHTML = '';
    for (let i = 0; i < orderedMsgsList.length; i++) {
        reloadChatWindow(null, orderedMsgsList[i].name, orderedMsgsList[i].content, orderedMsgsList[i].timestamp);
    }
}

function reloadChatWindow(pfp, username, message, date) {
    if (!pfp || pfp == null) {pfp = '/assets/images/default-pfp.jpg';}
    if (!username || username == null) {username = 'User';}
    if (!message) {message = 'Test12345';}

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

document.onkeyup = function(eventKeyName) {
    eventKeyName = eventKeyName;
    if (eventKeyName.key == 'Enter') {
        send.click();
    }
}