import { app } from '/js/init.js';
import { redrawChatWindow, addToChatWindow } from './app.js'
import { getFirestore, collection, getDoc, getDocs, doc, setDoc, query, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const searchParams = new URLSearchParams(window.location.search);
const roomId = searchParams.get('roomId');

// Initialize Firebase Firestore
const db = getFirestore(app);

// Get collection and define arrays used later
let rooms = [];
let roomIds = [];
let msgsList = [];
let orderedMsgsList = [];

const roomMessages = collection(db, 'rooms', roomId, "messages");

const querySnapshot = await getDocs(collection(db, "rooms"));
querySnapshot.forEach((doc) => {
    rooms.push(doc.data());
    roomIds.push(doc.data().roomId);
});

let roomIdIndex = roomIds.indexOf(roomId);
document.querySelector('#title').innerText = rooms[roomIdIndex].roomName + " " + rooms[roomIdIndex].roomEmoji;

// Live Chat
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
    const querySnapshot2 = await getDocs(orderDataq);
    querySnapshot2.forEach((doc) => {
        orderedMsgsList.push(doc.data());
    });
    redrawChatWindow();
}

console.log(orderedMsgsList);

console.log('Initalized Firestore');
export { doc, setDoc, orderedMsgsList, db, roomId };