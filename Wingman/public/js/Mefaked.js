const filterTisa = document.getElementById('filter-tisa');
const filterLimud = document.getElementById('filter-limud');
const logoutBtn = document.getElementById('logoutButton');

let allCadetsData = [];

fetch('/api/me')
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/html/login.HTML';
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('username-display').innerText = data.name;
        document.getElementById('greeting').innerHTML = "שלום " + data.name + "!";
    })
    .catch(err => console.log("Error loading profile:", err));

fetch('/api/commander/my-cadets')
    .then(response => response.json())
    .then(cadets => {
        allCadetsData = cadets;
        loadTable(allCadetsData);
    })
    .catch(err => console.log("Error loading cadets:", err));

logoutBtn.addEventListener('click', () => {
    window.location.href = '/logout';
});

function goToChanichPage(chanichName, chanichId) {
    window.location.href = `/results/${chanichId}`;
}

function goToJobsPage() {
    window.location.href = 'jobs.html';
}


function loadTable(data) {
    const tableBody = document.querySelector('#chanich-table tbody');
    tableBody.innerHTML = '';

    data.forEach(chanich => {
        const row = tableBody.insertRow();
        const nameCell = row.insertCell();
        const nameButton = document.createElement('button');//יצירת כפתור על שם החניך שנוכל להגיע אל דף החניך
        nameButton.className = 'chanich-name-button';
        nameButton.innerHTML = chanich.name;
        nameButton.onclick = () => goToChanichPage(chanich.name, chanich.personal_id);// פונקציית מעבר לדף החניך עם פרמטרים של שם ומספר אישי
        nameCell.appendChild(nameButton);
        row.insertCell().innerText = chanich.megama_tisa || "-";//טעינת העמודות מאפשרת מצב בו חניך נרשם למערכת תחת המפקד אבל עדיין לא מילא את הטופס
        row.insertCell().innerText = chanich.megama_limud || "-";//כלומר יש לנו את פרטי ההרשמה של החניך אבל לא את העדפותיו, מגמות וכו
        row.insertCell().innerText = chanich.previous || "-";//ברגע שימלא את הטופס הערך ישתנה ממקף לערך שהוא מילא בטופס
        row.insertCell().innerText = chanich.rec1 || "-";//ניתן לראות דוגמה באתר על אמיתי הס - רשום למערכת אבל לא מילא טופס
        row.insertCell().innerText = chanich.rec2 || "-";
        row.insertCell().innerText = chanich.chal1 || "-";
        row.insertCell().innerText = chanich.chal2 || "-";
        row.insertCell().innerText = chanich.pref1 || "-";
        row.insertCell().innerText = chanich.pref2 || "-";
        row.insertCell().innerText = chanich.pref3 || "-";
    });
}

function filterTable() {
    const tisaFilter = document.getElementById('filter-tisa').value;
    const limudFilter = document.getElementById('filter-limud').value;
    const filteredData = allCadetsData.filter(chanich => {
        const currentTisa = chanich.megama_tisa || "";
        const currentLimud = chanich.megama_limud || "";
        const matchesTisa = (tisaFilter === 'all' || currentTisa === tisaFilter);
        const matchesLimud = (limudFilter === 'all' || currentLimud === limudFilter);
        return matchesTisa && matchesLimud;// סינון לפי מגמת הטיסה והלימוד
    });
    loadTable(filteredData);
};

