const form = document.getElementById('signup');
const role = document.getElementById('role');
const commname = document.getElementById('commname');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('password-confirmation');
const fullname = document.getElementById('fullname');
const username = document.getElementById('username');

function passwordvalidation() {
    confirmPassword.setCustomValidity('');
    const passwordInput = password.value;
    const confirmPasswordInput = confirmPassword.value;
    if (passwordInput !== confirmPasswordInput) {
        confirmPassword.setCustomValidity('שומע מלך הסיסמאות לא תואמות! נסה שוב');
    }
}

function demandcommname() {
    commname.setCustomValidity('');
    if (role.value === 'chanich') {
        commname.required = true;
        if (commname.value === "") {
            commname.setCustomValidity('אם בחרת חניך יש לבחור שם מפקד');
        }
    }
    else {
        commname.required = false;
    }
}

function validatePersonalDetails() {
    fullname.setCustomValidity('');
    username.setCustomValidity('');

    const hebrewPattern = /^[\u0590-\u05FF\s]+$/;
    if (fullname.value && !hebrewPattern.test(fullname.value.trim())) {
        fullname.setCustomValidity('שם מלא חייב להכיל אותיות בעברית בלבד');
    }

    const idPattern = /^\d{7}$/;
    if (username.value && !idPattern.test(username.value.trim())) {
        username.setCustomValidity('מספר אישי חייב להכיל בדיוק 7 ספרות');
    }
}

role.addEventListener('change', demandcommname);
commname.addEventListener('change', demandcommname);
password.addEventListener('input', passwordvalidation);
confirmPassword.addEventListener('input', passwordvalidation);
fullname.addEventListener('input', validatePersonalDetails);
username.addEventListener('input', validatePersonalDetails);

form.addEventListener('submit', function (event) {
    passwordvalidation();
    demandcommname();
    validatePersonalDetails();

    if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
    }

    event.preventDefault();
    
    const formData = {
        fullname: fullname.value,
        email: document.getElementById('email').value,
        username: username.value,
        role: role.value,
        commname: commname.value,
        password: password.value
    }

    alert('ההרשמה בוצעה בהצלחה!');
    window.location.href = 'login.html';
});