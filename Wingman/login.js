const loginForm = document.getElementById('login');
const email = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!loginForm.checkValidity()) {
        form.reportValidity();
        return;
    }
    else {
        const formData = {
            email: email.value,
            username: username.value,
            password: password.value
        }
    }
    //here would be the server-side validation and response
    alert('ההתחברות בוצעה בהצלחה!');
    //window.location.href = (appropriate page based on role);)
});
