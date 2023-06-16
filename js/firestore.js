import { app } from '/js/init.js';
import { redrawChatWindow, addToChatWindow } from './app.js'
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, onSnapshot, orderBy, where } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Initialize Firebase Firestore
const db = getFirestore(app);
export { doc, setDoc, orderedMsgsList, db };

// Get collection and define arrays used later
const msgsCol = collection(db, 'messages');
let msgsList = [];
let orderedMsgsList = [];

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
    redrawChatWindow();
}

console.log('Initalized Firestore');