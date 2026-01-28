document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('Info');
    const improveQualitiesSection = document.getElementById('improvequalities');
    // תיקון 1: שינוי ה-ID ל-preferred-jobs (פעמיים r) כדי שיתאים ל-HTML
    const preferedJobsSection = document.getElementById('preferred-jobs');
    const skillsSection = document.getElementById('skills');

    const otherSkillInput = document.getElementById('otherskill');
    const otherSkillCheckbox = document.getElementById('skill6');

    function manageLimit(section) {
        if (!section) return; // הגנה למקרה שהאלמנט לא נמצא
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const checkedCount = section.querySelectorAll('input[type="checkbox"]:checked').length;
        checkboxes.forEach(cb => {
            cb.disabled = checkedCount >= 3 && !cb.checked;
        });
    }

    function clearSectionErrors(section) {
        if (!section) return;
        section.querySelectorAll('input').forEach(input => input.setCustomValidity(''));
    }

    function toggleOtherRequired(checkbox, input) {
        input.required = checkbox.checked;
        if (!checkbox.checked) input.value = '';
        input.disabled = checkbox.disabled && !checkbox.checked;
    }

    function loadUserName() {
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

    function loadJobsForForm() {
        fetch('/api/jobs')
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('jobs-container');
                container.innerHTML = '';
                if (data.length === 0) {
                    container.innerHTML = '<p>לא נמצאו קצינויות.</p>';
                    return;
                }
                data.forEach(job => {
                    const jobHTML = `
                        <div class="checkbox-group">
                            <label for="job_${job.id}">${job.title}</label>
                            <input type="checkbox" id="job_${job.id}" name="dynamic_jobs" value="${job.title}">
                        </div>
                    `;
                    container.innerHTML += jobHTML;
                });

                // הוספת מאזינים לצ'קבוקסים החדשים שנוצרו
                container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        // קריאה לפונקציה שמנהלת את ההגבלה על כל האזור של הקצינויות
                        manageLimit(preferedJobsSection);
                        clearSectionErrors(preferedJobsSection);
                    });
                });
            })
            .catch(error => console.log("Error loading jobs:", error));
    }

    // טעינת נתונים בהתחלה
    loadJobsForForm();
    loadUserName();

    otherSkillCheckbox.addEventListener('change', () => toggleOtherRequired(otherSkillCheckbox, otherSkillInput));

    improveQualitiesSection.addEventListener('change', () => {
        manageLimit(improveQualitiesSection);
        clearSectionErrors(improveQualitiesSection);
    });

    // לא צריך מאזין נפרד ל-preferedJobsSection כי הוספנו אותו בתוך loadJobsForForm
    // אבל ליתר ביטחון נשאיר למקרה שיש אלמנטים סטטיים
    if (preferedJobsSection) {
        preferedJobsSection.addEventListener('change', () => {
            manageLimit(preferedJobsSection);
            clearSectionErrors(preferedJobsSection);
        });
    }

    form.addEventListener('submit', event => {
        clearSectionErrors(improveQualitiesSection);
        clearSectionErrors(preferedJobsSection);

        const improveCount = improveQualitiesSection.querySelectorAll('input[type="checkbox"]:checked').length;
        if (improveCount !== 3) {
            event.preventDefault();
            const firstInput = improveQualitiesSection.querySelector('input[type="checkbox"]');
            firstInput.setCustomValidity(`בחרת ${improveCount} תכונות. חובה לבחור בדיוק 3 תכונות לשיפור.`);
            firstInput.reportValidity();
            return;
        }

        // תיקון 2: ספירה פשוטה. ה-jobs-container נמצא בתוך ה-preferedJobsSection, אז מספיק לספור באבא
        const jobsCount = preferedJobsSection.querySelectorAll('input[type="checkbox"]:checked').length;

        if (jobsCount !== 3) {
            event.preventDefault();
            const firstInput = preferedJobsSection.querySelector('input[type="checkbox"]');
            if (firstInput) {
                firstInput.setCustomValidity(`בחרת ${jobsCount} קצינויות. חובה לבחור בדיוק 3 קצינויות מועדפות.`);
                firstInput.reportValidity();
            }
            return;
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
        }

        event.preventDefault();

        const ScoreFields = [
            'score_responsibility', 'score_organization', 'score_initiative',
            'score_creativity', 'score_socialSkill', 'score_commWork',
            'score_weeklyTime', 'score_publicSpeaking', 'score_teamWork',
            'score_assertiveness', 'score_leadership', 'score_forwardThinking'
        ];

        const formData = {
            megamot: {
                limud: document.getElementById('megamalimud').value,
                tisa: document.getElementById('megamatisa').value
            },
            previousJobs: [],
            improveQualities: [],
            preferedJobs: [], // שימי לב: השארתי את השם הזה עם r אחת כי זה מה שהשרת מצפה לקבל
            skills: []
        };

        document.querySelectorAll('#previousjobs input[type="checkbox"]:checked').forEach(cb => {
            const label = document.querySelector(`label[for="${cb.id}"]`);
            if (label) formData.previousJobs.push(label.textContent.trim());
        });

        document.querySelectorAll('#improvequalities input[type="checkbox"]:checked').forEach(cb => {
            const label = document.querySelector(`label[for="${cb.id}"]`);
            if (label) formData.improveQualities.push(label.textContent.trim());
        });

        // תיקון 3: שימוש ב-ID הנכון (עם שתי rr) לאיסוף הנתונים
        document.querySelectorAll('#preferred-jobs input[type="checkbox"]:checked').forEach(cb => {
            // הוספנו כאן value בבניית ה-HTML הדינמי, אז אפשר להשתמש בו ישירות
            // או להמשיך להשתמש ב-label כמו קודם
            const label = document.querySelector(`label[for="${cb.id}"]`);
            if (label) {
                formData.preferedJobs.push(label.textContent.trim());
            } else if (cb.value && cb.value !== 'on') {
                formData.preferedJobs.push(cb.value);
            }
        });

        document.querySelectorAll('#skills input[type="checkbox"]:checked').forEach(cb => {
            if (cb.id !== 'skill6') {
                const label = document.querySelector(`label[for="${cb.id}"]`);
                if (label) formData.skills.push(label.textContent.trim());
            }
        });
        if (otherSkillInput.value) formData.skills.push(`אחר: ${otherSkillInput.value}`);

        ScoreFields.forEach(fieldName => {
            const input = document.querySelector(`input[name="${fieldName}"]`);
            if (input) formData[fieldName] = Number(input.value);
        });

        console.log('Sending form data:', formData);

        fetch('/submit-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); //המרה לגייסון
                } else {
                    throw new Error('שגיאה בשליחה');
                }
            })
            .then(data => {
                alert('השאלון נשלח בהצלחה!');
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('שגיאה בשליחת הטופס');
            });
    });
});