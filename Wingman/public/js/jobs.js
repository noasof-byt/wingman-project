const jobsTBody = document.getElementById('jobsTBody');
const jobsForm = document.getElementById('jobs-form');
const Quality = ['req_responsibility', 'req_organization', 'req_initiative', 'req_creativity',
    'req_socialSkill', 'req_commWork', 'req_weeklyTime', 'req_publicSpeaking',
    'req_teamWork', 'req_assertiveness', 'req_leadership', 'req_forwardThinking'];

function goToMefekedPage() {
    window.location.href = 'Mefeked.html';
}

function createJobRow(job) {
    const tr = document.createElement('tr');
    tr.dataset.jobId = job.id;
    tr.innerHTML += `<td>${job.title}</td>`;
    tr.innerHTML += `<td>${job.description}</td>`;
    Quality.forEach((quality) => {
        const value = job[quality] || 0;
        tr.innerHTML += `
            <td class="quality-cell">
                <span class="quality-display" data-quality-name="${quality}">
                    ${value}
                </span>
            </td>`;
    });
    tr.innerHTML += `
        <td><button class="simple-button edit-job-button" data-job-id="${job.id}">ערוך קצינות</button></td>
        <td><button class="simple-button delete-job-button" data-job-id="${job.id}">הסר קצינות</button></td>
    `;
    return tr;
}

function loadJobs() {//טעינת הקצינויות
    fetch('/api/jobs')
        .then(response => response.json())//המרה לגייסון
        .then(jobsData => {
            jobsTBody.innerHTML = '';
            jobsData.forEach(job => {
                const row = createJobRow(job);
                jobsTBody.appendChild(row);
            });
            addEventListenersToButtons();//חיבור הכפתורים לשורות החדשות
        })
        .catch(err => console.log("Error loading jobs:", err));
}

jobsForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!jobsForm.checkValidity()) {
        jobsForm.reportValidity();
        return;
    }
    const formData = new FormData(jobsForm);

    const newJob = {
        title: formData.get('job-title'),
        description: formData.get('job-description'),
        qualities: {}
    };
    Quality.forEach(key => {//קליטת התכונות והמרה מטקסט למספר
        const val = formData.get(key);
        newJob.qualities[key] = val ? parseInt(val) : 0;
    });
    fetch('/api/jobs', {//שליחה לשרת עם פוסט
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
    })
        .then(response => {
            if (response.ok) {
                alert('הקצינות נוספה בהצלחה!');
                jobsForm.reset();
                loadJobs();
            } else {
                alert('שגיאה בהוספה');
            }
        })
        .catch(err => console.log(err));
});

function addEventListenersToButtons() {
    document.querySelectorAll('.delete-job-button').forEach(button => {
        button.onclick = (e) => handleDeleteJob(e.target.dataset.jobId);
    });
    document.querySelectorAll('.edit-job-button').forEach(button => {
        button.onclick = (e) => handleEditJob(e.target.dataset.jobId, e.target);
    });
}

function handleDeleteJob(jobId) {//מחיקת קצינות
    if (!confirm('האם אתה בטוח שברצונך למחוק קצינות זו?')) {
        return;
    }
    fetch('/api/jobs/' + jobId, {//שליחת בקשת מחיקה לשרת
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                alert('הקצינות נמחקה');
                loadJobs(); //רענון הטבלה כדי להעלים את השורה שנמחקה
            } else {
                alert('שגיאה במחיקה');
            }
        })
        .catch(err => console.log(err));
}

function handleEditJob(jobId, button) {//עריכת קצינות
    const row = button.closest('tr');
    const isEditing = row.classList.contains('editing');//הגדרה של מצב עריכה

    if (!isEditing) {
        row.classList.add('editing');//הוספת תגית עריכה
        button.textContent = 'אישור';//שינוי הכפתור לכפתור אישור

        row.querySelectorAll('.quality-display').forEach(span => {
            const keyName = span.dataset.qualityName;
            const currentValue = span.textContent.trim();

            const input = document.createElement('input');//יצירת תיבת קלט חדשה
            input.type = 'number';
            input.min = '1'; input.max = '10';
            input.value = currentValue;
            input.name = keyName;
            input.style.width = "40px";

            span.replaceWith(input);//החלפת הטקסט בתיבה
        });

    }

    else {
        const updatedJobData = { id: jobId, qualities: {} };
        let isValid = true;

        row.querySelectorAll('input[type="number"]').forEach(input => {//איסוף נתונים מהאינפוטים
            const value = parseInt(input.value);
            if (value < 1 || value > 10 || isNaN(value)) isValid = false;//ולידציה
            updatedJobData.qualities[input.name] = value;
        });
        if (!isValid) { alert('ערכים בין 1-10 בלבד'); return; }
        fetch('/api/jobs/' + jobId, {//שליחה לשרת
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedJobData)
        })
            .then(response => {
                if (response.ok) {
                    alert('עודכן בהצלחה!');
                    row.classList.remove('editing');
                    button.textContent = 'ערוך קצינות';

                    row.querySelectorAll('input[type="number"]').forEach(input => {//החזרת התצוגה מתיבות עריכה לטקסט רגיל
                        const newSpan = document.createElement('span');
                        newSpan.className = 'quality-display';
                        newSpan.dataset.qualityName = input.name;
                        newSpan.textContent = input.value;
                        input.replaceWith(newSpan);
                    });
                } else {
                    alert('שגיאה בעדכון');
                }
            })
            .catch(err => console.log(err));
    }
}
function loadUserName() {//שם את שם המשתמש בתור יוזרניים בתפריט למעלה
    fetch('/api/me')
        .then(response => {
            if (response.status === 401) window.location.href = '../html/login.HTML';
            return response.json();
        })
        .then(data => {
            const display = document.getElementById('username-display');
            if (display && data.name) display.innerText = data.name;
        })
        .catch(err => console.log("Error loading user name:", err));
}

loadUserName();
loadJobs();