const jobsTBody = document.getElementById('jobsTBody');
const jobsForm = document.getElementById('jobs-form');
const Quality = ['אחריות אישית', 'סדר וארגון', 'יוזמה', 'יצרתיות',
    'עבודה מול אנשים', 'עבודה מול גורמים פיקודיים',
    'זמן השקעה שבועי', 'עמידה מול קהל', 'עבודת צוות',
    'אסרטיביות', 'מנהיגות', 'תכנון קדימה'];

function goToMefekedPage() {
    window.location.href = 'Mefeked.html'; 
}

function createJobRow(job) {
    const tr = document.createElement('tr');
    tr.dataset.jobId = job.id;//id would come from the server
    tr.innerHTML += `<td>${job.title}</td>`;
    tr.innerHTML += `<td>${job.description}</td>`;
    Quality.forEach((quality) => {
        const value = job.qualities[quality] || 1;
        tr.innerHTML += `
            <td class="quality-cell">
                <span class="quality-display" data-quality-name="${quality}">
                    ${value}
                </span>
            </td>`;
    });
    return tr;
}
async function loadJobs() {
    let jobsData = [];//here the server data would be fetched
    jobsTBody.innerHTML = '';
    jobsData.forEach(job => {
        const row = createJobRow(job);
        jobsTBody.appendChild(row);
    });
    addEventListenersToButtons();
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
    for (let i = 1; i <= 12; i++) {
        const qualityName = document.querySelector(`label[for="quailty${i}"]`).textContent.trim();
        const qualityValue = parseInt(formData.get(`quailty${i}`));
        newJob.qualities[qualityName] = qualityValue;
    }//add server communication here
    alert('הקצינות נוספה בהצלחה!');
    jobsForm.reset();
    loadJobs();
});
function addEventListenersToButtons() {
    document.querySelectorAll('.delete-job-button').forEach(button => {
        button.onclick = (e) => handleDeleteJob(e.target.dataset.jobId);
    });
    document.querySelectorAll('.edit-job-button').forEach(button => {
        button.onclick = (e) => handleEditJob(e.target.dataset.jobId, e.target);
    });
}
async function handleDeleteJob(jobId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק קצינות זו? (פעולה לא ניתנת לשחזור)')) {
        return;
    }
    alert('הקצינות נמחקה בהצלחה');
    loadJobs();
}
async function handleEditJob(jobId, button) {//edit
    const row = button.closest('tr');
    const isEditing = row.classList.contains('editing');

    if (!isEditing) {
        row.classList.add('editing');
        button.textContent = 'אישור';

        // הפיכת הדירוגים לשדות קלט
        row.querySelectorAll('.quality-display').forEach(span => {
            const qualityName = span.dataset.qualityName;
            const currentValue = span.textContent.trim();

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '10';
            input.value = currentValue;
            input.name = qualityName;

            span.replaceWith(input);
        });

    }
    else {
        const updatedJobData = { id: jobId, qualities: {} };
        let isValid = true;
        row.querySelectorAll('input[type="number"]').forEach(input => {
            const value = parseInt(input.value);
            if (value < 1 || value > 10 || isNaN(value)) {
                alert('נא ודא שכל הדירוגים בין 1-10');
                isValid = false;
                return;
            }
            updatedJobData.qualities[input.name] = value;
        });

        if (!isValid) return;
        row.classList.remove('editing');
        button.textContent = 'ערוך קצינות';
        row.querySelectorAll('input[type="number"]').forEach(input => {
            const newSpan = document.createElement('span');
            newSpan.className = 'quality-display';
            newSpan.dataset.qualityName = input.name;
            newSpan.textContent = input.value;
            input.replaceWith(newSpan);
        });

        alert('הקצינות עודכנה בהצלחה!');
    }
}
loadJobs();