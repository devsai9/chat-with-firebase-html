const imgBtn = document.querySelector('#profile-picture');
const dropDown = document.querySelector('#profile-dropdown');

imgBtn.addEventListener('click', toggleDropdown);

function toggleDropdown() {
    if (dropDown.style.display == 'none' || dropDown.style.display == '') {
        dropDown.style.display = 'flex';
    } else {
        dropDown.style.display = 'none';
    }
}