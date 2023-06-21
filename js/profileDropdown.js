const imgBtn = document.querySelector('#profile-picture');
const dropDown = document.querySelector('#profile-dropdown');
import { signedInBool } from "./selectRoom.js";

imgBtn.addEventListener('click', toggleDropdown);

function toggleDropdown() {
    if (signedInBool) {
        if (dropDown.style.display == 'none' || dropDown.style.display == '') {
            dropDown.style.display = 'flex';
        } else {
            dropDown.style.display = 'none';
        }
    } else {}
}