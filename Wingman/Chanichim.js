const form = document.getElementById('Info');
const improveQualitiesSection = document.getElementById('improvequalities');
const preferedJobsSection = document.getElementById('prefered-jobs');
const skillsSection = document.getElementById('skills');

const otherPrevJobInput = document.getElementById('prvotherjob');
const otherPrevJobCheckbox = document.getElementById('prvjob7');
const otherPreferedJobInput = document.getElementById('otherjob');
const otherPreferedJobCheckbox = document.getElementById('job7');
const otherSkillInput = document.getElementById('otherskill');
const otherSkillCheckbox = document.getElementById('skill6');

const Quality = [
    'אחריות אישית', 'סדר וארגון', 'יוזמה', 'יצירתיות',
    'עבודה מול אנשים', 'עבודה מול גורמים פיקודיים',
    'זמן השקעה שבועי', 'עמידה מול קהל', 'עבודת צוות',
    'אסרטיביות', 'מנהיגות', 'תכנון קדימה'
];

function manageLimit(section) {
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');
    const checkedCount = section.querySelectorAll('input[type="checkbox"]:checked').length;

    if (checkedCount >= 3) {
        checkboxes.forEach(cb => {
            if (!cb.checked) cb.disabled = true;
        });
    } else {
        checkboxes.forEach(cb => {
            cb.disabled = false;
        });
    }
}

function clearSectionErrors(section) {
    section.querySelectorAll('input').forEach(input => input.setCustomValidity(''));
}

function toggleOtherRequired(checkbox, input) {
    input.required = checkbox.checked;
    if (!checkbox.checked) input.value = '';

    if (checkbox.disabled && !checkbox.checked) {
        input.disabled = true;
    } else {
        input.disabled = false;
    }
}

otherPrevJobCheckbox.addEventListener('change', () => toggleOtherRequired(otherPrevJobCheckbox, otherPrevJobInput));
otherPreferedJobCheckbox.addEventListener('change', () => toggleOtherRequired(otherPreferedJobCheckbox, otherPreferedJobInput));
otherSkillCheckbox.addEventListener('change', () => toggleOtherRequired(otherSkillCheckbox, otherSkillInput));

improveQualitiesSection.addEventListener('change', () => {
    manageLimit(improveQualitiesSection);
    clearSectionErrors(improveQualitiesSection);
});

preferedJobsSection.addEventListener('change', () => {
    manageLimit(preferedJobsSection);
    clearSectionErrors(preferedJobsSection);

    if (otherPreferedJobCheckbox.disabled) {
        otherPreferedJobInput.disabled = true;
    } else if (otherPreferedJobCheckbox.checked) {
        otherPreferedJobInput.disabled = false;
    }
});

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

    const jobsCount = preferedJobsSection.querySelectorAll('input[type="checkbox"]:checked').length;
    if (jobsCount !== 3) {
        event.preventDefault();
        const firstInput = preferedJobsSection.querySelector('input[type="checkbox"]');
        firstInput.setCustomValidity(`בחרת ${jobsCount} קצינויות. חובה לבחור בדיוק 3 קצינויות מועדפות.`);
        firstInput.reportValidity();
        return;
    }

    if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
    }

    event.preventDefault();

    const formData = {
        megamot: {
            limud: document.getElementById('megamalimud').value,
            tisa: document.getElementById('megamatisa').value
        },
        previousJobs: [],
        qualitiesRating: {},
        improveQualities: [],
        preferedJobs: [],
        skills: []
    };

    const collectCheckboxes = (sectionSelector, listArray, otherInput) => {
        document.querySelectorAll(`${sectionSelector} input[type="checkbox"]:checked`)
            .forEach(cb => {
                listArray.push(
                    document.querySelector(`label[for="${cb.id}"]`).textContent.trim()
                );
            });
        if (otherInput && otherInput.value && !otherInput.disabled) {
            listArray.push(`אחר: ${otherInput.value}`);
        }
    };

    collectCheckboxes('#previousjobs', formData.previousJobs, otherPrevJobInput);
    collectCheckboxes('#improvequalities', formData.improveQualities, null);
    collectCheckboxes('#prefered-jobs', formData.preferedJobs, otherPreferedJobInput);
    collectCheckboxes('#skills', formData.skills, otherSkillInput);

    Quality.forEach((name, i) => {
        const input = document.getElementById(`quailty${i + 1}`);
        formData.qualitiesRating[name] = Number(input.value);
    });

    console.log(formData);

    alert('השאלון נשלח בהצלחה!');
    form.querySelectorAll('input, select, textarea, button')
        .forEach(el => el.disabled = true);
});