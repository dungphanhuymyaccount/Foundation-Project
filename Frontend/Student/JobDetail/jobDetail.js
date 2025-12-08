// Selected job from list page
const selectedJobID = JSON.parse(localStorage.getItem("selected_job_ID"));
// All posted jobs
let postedJobs = JSON.parse(localStorage.getItem("postedJobs")) || [];

// Find and render job detail
findJobToRender(selectedJobID);

// Find job by ID and render
function findJobToRender(jobID) {
  const idx = postedJobs.findIndex((job) => job.jobId === jobID);
  if (idx === -1) {
    alert("Job not found");
    return;
  }
  console.log("Job found → render");
  renderDetail(postedJobs[idx]);
}

// Render job detail + tabs
function renderDetail(job) {
  const experience = job.experience || {};
  const experienceMin = experience.min ?? "N/A";
  const experienceMax = experience.max ?? "";
  const experienceCurrency = experience.currency ? " " + experience.currency : "";

  document.getElementById("job").innerHTML = `
    <div class="detail">
      <div class="company_logo">
        <img src="${job.avatar || ""}" alt="company logo">
      </div>
      <div class="Name_Company">
        <div>
          <h1 class="job-title">${job.jobTitle ?? "No title"}</h1>
        </div>
        <div>
          <h3 class="company_title">${job.companyName ?? "Company"}</h3>
        </div>
      </div>
    </div>

    <div class="tabs">
      <div class="tab-buttons">
        <button class="tab-btn active" data-tab="job-tab">Job Detail</button>
        <button class="tab-btn" data-tab="company-tab">Company Information</button>
      </div>

      <div class="tab-contents">
        <div id="job-tab" class="tab-content active">
          <hr/>
          <div class="info">
            <div>
              <h3><span><ion-icon name="location-outline"></ion-icon></span>Location</h3>
              <p>${job.location ?? "Unknown"}</p>
            </div>
            <div>
              <h3><span><ion-icon name="briefcase-outline"></ion-icon></span>Field</h3>
              <p>${job.field ?? "Uncategorized"}</p>
            </div>
          </div>

          <div class="info">
            <div>
              <h3><span><ion-icon name="people-outline"></ion-icon></span>Number of Vacancies</h3>
              <p>${job.numberOfVacancy ?? "Unknown"}</p>
            </div>
            <div>
              <h3><span><ion-icon name="cash-outline"></ion-icon></span>Salary</h3>
              <p>${job.salary ?? "Unknown"}</p>
            </div>
          </div>

          <div class="info">
            <div>
              <h3><span><ion-icon name="calendar-outline"></ion-icon></span>Deadline</h3>
              <p>${job.deadline ?? "Unknown"}</p>
            </div>
            <div>
              <h3><span><ion-icon name="star-outline"></ion-icon></span>Experience</h3>
              <p>${experienceMin}${experienceMax ? " - " + experienceMax : ""}${experienceCurrency}</p>
            </div>
          </div>

          <hr/>
          <h3>Description</h3>
          <p>${job.description ?? "No description."}</p>

          <h3>Requirements</h3>
          <p>${job.requirement ?? "No requirements"}</p>

          <h3>Benefits</h3>
          <p>${job.benefit ?? "No benefits"}</p>

          <div style="margin-top:16px">
            <button onclick="applyNow()" class="btn-apply">Apply Now</button>
          </div>
        </div>

        <div id="company-tab" class="tab-content">
          <!-- Filled by populateCompanyTab() -->
          <div class="company-info-placeholder">Loading company information...</div>
        </div>
      </div>
    </div>
  `;

  // Fill company tab
  populateCompanyTab(job);
}

// Fill "Company Information" tab + "Other positions"
function populateCompanyTab(job) {
  try {
    const container = document.querySelector("#company-tab");
    if (!container) return;

    // Employer DB
    const db = JSON.parse(localStorage.getItem("list_user")) || { list_employer: [] };
    const employers = db.list_employer || [];

    // Match by companyName (case-insensitive)
    const match = employers.find(
      (e) => (e.companyName || "").toLowerCase() === (job.companyName || "").toLowerCase()
    );

    // Other jobs in same company
    const jobs = JSON.parse(localStorage.getItem("postedJobs")) || [];
    const other = jobs.filter(
      (j) =>
        (j.companyName || "").toLowerCase() === (job.companyName || "").toLowerCase() &&
        j.jobId !== job.jobId
    );

    const otherHtml = other.length
      ? `
        <div class="other-positions">
          <h3>Other positions</h3>
          <div class="other-grid">
            ${other
              .map(
                (j) => `
              <a href="#" class="other-item" data-jobid="${j.jobId}">
                <img src="${j.avatar || job.avatar || ""}" alt="logo" class="other-logo">
                <div class="other-body">
                  <strong class="other-title">${j.jobTitle}</strong>
                  <div class="other-meta">${j.location || ""} ${
                  j.field ? "· " + j.field : ""
                }</div>
                </div>
              </a>
            `
              )
              .join("")}
          </div>
        </div>`
      : `<div class="other-positions"><h3>Other positions</h3><p>No other positions found.</p></div>`;

    // Prefer employer profile > job data > fallback
    const addressVal =
      (match && (match.address || match.Address)) || job.address || "N/A";
    const fieldVal =
      (match && (match.field || match.Field)) || job.field || "N/A";
    const sizeVal = (match && (match.size || match.Size)) || "N/A";
    const introVal =
      (match && (match.introduction || match.CompanyIntroduction)) ||
      "No introduction yet";

    container.innerHTML = `
      <div class="company-header">
        <img src="${(match && (match.avatar || match.Avatar)) || job.avatar || ""}" 
             alt="company logo" 
             class="company-info-logo">
        <h2>${
          (match && (match.companyName || match.CompanyName)) ||
          job.companyName ||
          "Company"
        }</h2>
      </div>

      <div class="company-details simple">
        <p><strong>Address:</strong> ${addressVal}</p>
        <p><strong>Field:</strong> ${fieldVal}</p>
        <p><strong>Size:</strong> ${sizeVal}</p>

        <h3>Company Introduction</h3>
        <p>${introVal}</p>
      </div>

      ${otherHtml}
    `;

    // Click handler for "Other positions"
    const anchors = container.querySelectorAll(".other-item");
    anchors.forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const jid = a.getAttribute("data-jobid");
        if (!jid) return;
        localStorage.setItem("selected_job_ID", JSON.stringify(jid));
        location.href = "jobDetail.html";
      });
    });
  } catch (e) {
    console.error("populateCompanyTab error", e);
  }
}

// Open Apply modal
function applyNow() {
  const modal = document.getElementById("applyModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close Apply modal
function closeApplyModal() {
  const modal = document.getElementById("applyModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Tab switching 
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;

  const tabId = btn.getAttribute("data-tab");
  if (!tabId) return;

  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll(".tab-content").forEach((c) =>
    c.classList.remove("active")
  );
  const target = document.getElementById(tabId);
  if (target) target.classList.add("active");
});
