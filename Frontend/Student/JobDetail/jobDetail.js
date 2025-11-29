document.addEventListener("DOMContentLoaded", () => {
    const selectedJobID = JSON.parse(localStorage.getItem("selected_job_ID"));
    console.log("Selected job:", selectedJobID);

    const postedJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const job = postedJobs.find(j => j.jobId === selectedJobID);

    renderJobDetailPage(job);
});


function renderJobDetailPage(job) {
    if (!job) return;

    // Phần header
    document.getElementById("companyLogo").src = job.avatar || "";
    document.getElementById("jobTitle").textContent = job.jobTitle || "No Title";
    document.getElementById("companyName").textContent = job.companyName || "Company";

    // Job Detail tab
    const experience = job.experience || {};
    const expMin = experience.min ?? 'N/A';
    const expMax = experience.max ?? '';
    const expCurrency = experience.currency ? ' ' + experience.currency : '';

    document.getElementById("jobTabContent").innerHTML = `
        <p><strong>Location:</strong> ${job.location || 'Unknown'}</p>
        <p><strong>Field:</strong> ${job.field || 'Uncategorized'}</p>
        <p><strong>Salary:</strong> ${job.salary || 'Negotiable'}</p>
        <p><strong>Vacancies:</strong> ${job.numberOfVacancy || 'N/A'}</p>
        <p><strong>Deadline:</strong> ${job.deadline || 'N/A'}</p>
        <p><strong>Experience:</strong> ${expMin}${expMax ? ' - ' + expMax : ''}${expCurrency}</p>
        <h3>Description</h3><p>${job.description || 'No description'}</p>
        <h3>Requirements</h3><p>${job.requirement || 'No requirements'}</p>
        <h3>Benefits</h3><p>${job.benefit || 'No benefits'}</p>
        <button onclick="applyNow()" class="btn-apply">Apply Now</button>
    `;

    // Tab thông tin công ty
    const allJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const related = allJobs.filter(j => j.companyName === job.companyName && j.jobId !== job.jobId);

    document.getElementById("companyTabContent").innerHTML = `
    <p><strong>Address:</strong> ${job.address || "N/A"}</p>
    <p><strong>Field:</strong> ${job.field || "N/A"}</p>
    <p><strong>Size:</strong> ${job.size || "N/A"}</p>

    <h3>Company Introduction</h3>
    <hr class="divider">
    <p>${job.companyIntroduction && job.companyIntroduction.trim() !== "" 
        ? job.companyIntroduction 
        : "<em>No introduction yet</em>"}
    </p>

    <h3>Other Positions</h3>
    <div class="other-jobs-grid">
        ${related.map(j => `
            <div class="job-item" data-jobid="${String(j.jobId)}">
                <img src="${j.avatar || ''}" class="job-logo">
                <h4>${j.jobTitle}</h4>
                <p>${j.field}</p>
            </div>
        `).join("")}
    </div>
`;

    // Gắn listener click cho các mục "Các vị trí khác" vừa được render
    const companyTab = document.getElementById("companyTabContent");
    if (companyTab) {
        const items = companyTab.querySelectorAll('.job-item');
        items.forEach(el => {
            el.addEventListener('click', () => {
                const id = el.getAttribute('data-jobid');
                if (id !== null) openJobDetail(id);
            });
        });
    }
}

function applyNow() {
    window.location.href = '../ApplyJob/applyJob.html';
}

function openJobDetail(id) {
    // Chuyển id sang số khi có thể để khớp kiểu jobId đã lưu
    const numeric = Number(id);
    const toStore = Number.isNaN(numeric) ? id : numeric;
    localStorage.setItem("selected_job_ID", JSON.stringify(toStore));

    window.location.href = "./jobDetail.html";
}
