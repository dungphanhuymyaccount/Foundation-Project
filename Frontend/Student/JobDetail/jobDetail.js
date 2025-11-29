const selectedJobID = JSON.parse(localStorage.getItem('selected_job_ID'));
let postedJobs = JSON.parse(localStorage.getItem('postedJobs')) || [];
findJobToRender(selectedJobID)

function findJobToRender(jobID) {
    let clickedJob = postedJobs.findIndex(job => job.jobId === jobID);
    if (clickedJob === -1) {
        alert('Job not found');
    }
    else {
        console.log("Job found! Rendering...");
        renderDetail(postedJobs[clickedJob]);
    }
}

function renderDetail(job) {
    const experience = job.experience || {};
    const experienceMin = experience.min ?? 'N/A';
    const experienceMax = experience.max ?? '';
    const experienceCurrency = experience.currency ? ' ' + experience.currency : '';

    document.getElementById('job').innerHTML = `
    <div class="detail">
        <div class="company_logo">
            <img src="${job.avatar || ''}" alt="company logo">
        </div>
        <div class="Name_Company">
            <div>
                <h1 class="job-title">${job.jobTitle ?? 'No title'}</h1>
            </div>
            <div>
                <h3 class="company_title">${job.companyName ?? 'Company'}</h3>
            </div>
        </div>
    </div>

    <hr/>
    <div class="info">
        <div>
            <h3><span><ion-icon name="location-outline"></ion-icon></span>Location</h3>
            <p>${job.location ?? 'Unknown'}</p>
        </div>
        <div>
            <h3><span><ion-icon name="briefcase-outline"></ion-icon></span>Field</h3>
            <p>${job.field ?? 'Uncategorized'}</p>
        </div>
    </div>

    <div class="info">
        <div>
            <h3><span><ion-icon name="people-outline"></ion-icon></span>Number of Vacancies</h3>
            <p>${job.numberOfVacancy ?? 'Unknown'}</p>
        </div>
        <div>
            <h3><span><ion-icon name="cash-outline"></ion-icon></span>Salary</h3>
            <p>${job.salary ?? 'Unknown'}</p>
        </div>
    </div>

    <div class="info">
        <div>
            <h3><span><ion-icon name="calendar-outline"></ion-icon></span>Deadline</h3>
            <p>${job.deadline ?? 'Unknown'}</p>
        </div>
        <div>
            <h3><span><ion-icon name="star-outline"></ion-icon></span>Experience</h3>
            <p>${experienceMin}${experienceMax ? ' - ' + experienceMax : ''}${experienceCurrency}</p>
        </div>
    </div>

    <hr/>
    <h3>Description</h3>
    <p>${job.description ?? 'No description.'}</p>

    <h3>Requirements</h3>
    <p>${job.requirement ?? 'No requirements'}</p>

    <h3>Benefits</h3>
    <p>${job.benefit ?? 'No benefits'}</p>

    <div style="margin-top:16px">
        <button onclick="applyNow()" class="btn-apply">Apply Now</button>
    </div>
    `;
}

function applyNow() {
  const modal = document.getElementById("applyModal");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeApplyModal() {
  const modal = document.getElementById("applyModal");
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

