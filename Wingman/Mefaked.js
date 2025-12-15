const filterTisa=document.getElementById('filter-tisa');
const filterLimud=document.getElementById('filter-limud');
const chanichData = [// מערך של חניכים לדוגמה בחסות הצ'אט        
    { 
        id: 1, 
        name: "איתי לוי", 
        tisa: "קרב", 
        limud: "מדמ\"ח", 
        ktzinut: "בטיחות", 
        job1: "מנהל פרויקט", 
        job2: "רמ\"ד הכשרה", 
        chal1: "מומחה סייבר", 
        chal2: "קמ\"ן", 
        pref1: "קרב", 
        pref2: "תובלה",  
        pref3: "בטיחות" 
    },
        { 
        id: 2, 
        name: "דנה כהן", 
        tisa: "נווטי קרב", 
        limud: "פוליטיקה וממשל", 
        ktzinut: "רכב", 
        job1: "רמ\"ד הכשרה", 
        job2: "מפקד קורס", 
        chal1: "ראש צוות", 
        chal2: "קמ\"ן", 
        pref1: "ניווט", 
        pref2: "בטיחות", 
        pref3: "אחר"
    },
    { 
        id: 3, 
        name: "יוסי פרץ", 
        tisa: "תובלה", 
        limud: "ניהול מערכות מידע", 
        ktzinut: "תחקור", 
        job1: "ראש צוות", 
        job2: "מנהל פרויקט", 
        chal1: "מומחה סייבר", 
        chal2: "רמ\"ד", 
        pref1: "תובלה", 
        pref2: "קרב", 
        pref3: "ניווט"
    },
    { 
        id: 4, 
        name: "מאיה אטיאס", 
        tisa: "מסוקים", 
        limud: "מדמ\"ח", 
        ktzinut: "לוז", 
        job1: "מפקד קורס", 
        job2: "רמ\"ד הכשרה", 
        chal1: "קמ\"ן", 
        chal2: "ראש צוות", 
        pref1: "מסוקים", 
        pref2: "תחקור", 
        pref3: "כלכלה"
    },
    { 
        id: 5, 
        name: "רן גבאי", 
        tisa: "נווטי תובלה", 
        limud: "כלכלה", 
        ktzinut: "תחקור", 
        job1: "ראש צוות", 
        job2: "מנהל פרויקט", 
        chal1: "רמ\"ד", 
        chal2: "מומחה סייבר", 
        pref1: "נווטי תובלה", 
        pref2: "ניווט", 
        pref3: "ספורט"
    },
    { 
        id: 6, 
        name: "ליאור דויד", 
        tisa: "מכוננים", 
        limud: "פוליטיקה וממשל", 
        ktzinut: "ספורט", 
        job1: "קמ\"ן", 
        job2: "מפקד קורס", 
        chal1: "ראש צוות", 
        chal2: "מומחה סייבר", 
        pref1: "מכוננים", 
        pref2: "תובלה", 
        pref3: "ניווט"
    },
    { 
        id: 7, 
        name: "שיר אלון", 
        tisa: "קרב", 
        limud: "ניהול מערכות מידע", 
        ktzinut: "גיבוש", 
        job1: "רמ\"ד הכשרה", 
        job2: "מנהל פרויקט", 
        chal1: "קמ\"ן", 
        chal2: "ראש צוות", 
        pref1: "קרב", 
        pref2: "מסוקים", 
        pref3: "תחקור"
    },
];

function goToChanichPage(chanichName, chanichId) {
window.location.href = `chanichim_page.html?id=${chanichId}&name=${chanichName}`;}

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
        nameButton.onclick = () => goToChanichPage(chanich.name, chanich.id);// פונקציית מעבר לדף החניך עם פרמטרים של שם ומספר אישי
        nameCell.appendChild(nameButton);
        row.insertCell().innerText = chanich.tisa;// טעינת שאר העמודות
        row.insertCell().innerText = chanich.limud;
        row.insertCell().innerText = chanich.ktzinut;
        row.insertCell().innerText = chanich.job1;//כרגע הוספנו חניכים קבועים עם טקסט קבוע מראש
        row.insertCell().innerText = chanich.job2;// בצד שרת נוסיף פונקציה שתחשב מה תפקיד הכי מתאים והכי מאתגר לכל חניך
        row.insertCell().innerText = chanich.chal1;
        row.insertCell().innerText = chanich.chal2;
        row.insertCell().innerText = chanich.pref1;
        row.insertCell().innerText = chanich.pref2;
        row.insertCell().innerText = chanich.pref3;
    });
}

function filterTable() {
    const tisaFilter = document.getElementById('filter-tisa').value;
    const limudFilter = document.getElementById('filter-limud').value;
    const filteredData = chanichData.filter(chanich => {
        const matchesTisa = (tisaFilter === 'all' || chanich.tisa === tisaFilter);
        const matchesLimud = (limudFilter === 'all' || chanich.limud === limudFilter);
        return matchesTisa && matchesLimud;// סינון לפי מגמת הטיסה והלימוד
    });
    loadTable(filteredData);
}

document.addEventListener('DOMContentLoaded', () => {    // טוען את החניכים לטבלה ברגע שהדף נטען
    loadTable(chanichData);
});