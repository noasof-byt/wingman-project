const form = document.getElementById('signup');
const role = document.getElementById('role');
const commname = document.getElementById('commname');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('password-confirmation');
const fullname = document.getElementById('fullname');
const username = document.getElementById('username');
const email = document.getElementById('email');

loadCommanders();

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
    if (role.value === 'cadet') {
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
    email.setCustomValidity('');
    password.setCustomValidity('');

    const hebrewPattern = /^[\u0590-\u05FF\s]+$/;
    if (fullname.value && !hebrewPattern.test(fullname.value.trim())) {
        fullname.setCustomValidity('שם מלא חייב להכיל אותיות בעברית בלבד');
    }
    else if (fullname.value && !fullname.value.trim().includes(' ')) {
        fullname.setCustomValidity('נא להזין שם מלא (שם פרטי ושם משפחה)');
    }

    const idPattern = /^\d{7}$/;
    if (username.value && !idPattern.test(username.value.trim())) {
        username.setCustomValidity('מספר אישי חייב להכיל בדיוק 7 ספרות');
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email.value && !emailPattern.test(email.value.trim())) {
        email.setCustomValidity('כתובת אימייל לא תקינה');
    }

    if (password.value.length < 4) {
        password.setCustomValidity('הסיסמה חייבת להכיל לפחות 4 תווים');
    }
}

role.addEventListener('change', demandcommname);
commname.addEventListener('change', demandcommname);
password.addEventListener('input', () => {
    passwordvalidation();
    validatePersonalDetails();
});
confirmPassword.addEventListener('input', passwordvalidation);
fullname.addEventListener('input', validatePersonalDetails);
username.addEventListener('input', validatePersonalDetails);
email.addEventListener('input', validatePersonalDetails);

form.addEventListener('submit', function (event) {
    passwordvalidation();
    demandcommname();
    validatePersonalDetails();
    if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
    }
});

function loadCommanders() {
    fetch('/get-commanders')//פונקציה שמשתמשת בגייסון לשליפה של רשימת המפקדים הרשומים והצגתם בעת ההרשמה
        .then(response => response.json())
        .then(commanders => {
            const select = document.getElementById('commname');//שליפה של המפקדים
            commanders.forEach(commander => {//לולאה שעוברת על כל המפקדים ו"מחלצת" מספר אישי ושם ומציגה למשתמש
                const option = document.createElement('option');
                option.value = commander.personal_id;
                option.textContent = commander.full_name;
                select.appendChild(option);
            });
        })
        .catch(err => console.log("Error loading commanders: " + err));
};


