const profileLogo = document.getElementById('profile-logo');
const profileDropdown = document.getElementById('profileDropdown');
const logoutButton = document.getElementById('logoutButton');
const usernameDisplay = document.getElementById('username-display'); //will be taken care of in the UX

profileLogo.addEventListener('click', function (event) {
    event.stopPropagation();
    profileDropdown.classList.toggle('hidden');
    if (!profileDropdown.classList.contains('hidden')) {
        document.addEventListener('click', closeDropdownOnClickOutside);
    }
});

function closeDropdownOnClickOutside(event) {
    if (!profileDropdown.contains(event.target) && event.target !== profileLogo) {
        profileDropdown.classList.add('hidden');
        document.removeEventListener('click', closeDropdownOnClickOutside);
    }
}

logoutButton.addEventListener('click', function () {
    window.location.href = '/logout';
});