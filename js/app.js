import { db, doc, setDoc, orderedMsgsList, roomId, availableRooms, allowedEmails } from '/js/firestore.js';
import { username, email, profile_picture } from '/js/auth.js';

const chatWindow = document.querySelector('#chat-window');
const input = document.querySelector('#input');
const send = document.querySelector('#send');
send.addEventListener('click', sendMsg);

let index = availableRooms.indexOf(roomId);
if (allowedEmails[index].includes(email) == false) {
    window.location.href = 'index.html';
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

        redrawChatWindow();

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
            timestamp: dateTime
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

export { redrawChatWindow, addToChatWindow };
console.log('Initalized app.js functions');