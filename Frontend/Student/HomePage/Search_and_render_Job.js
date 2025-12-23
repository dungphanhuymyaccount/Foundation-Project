let jobContainer = document.querySelector(".job_post_section");
let searchedJobs = []; // Variable storing the list of posts after searching
let jobsPerPage = 6; // Number of jobs per page
let currentPage = 1; // Current page
let displayedJob = []; // Store the jobs currently displayed on the screen
let postedJobs = JSON.parse(localStorage.getItem("postedJobs")) || []; // Get job post data from local storage

// Init render with current filters/search (default = all)
applyFilters();

/* =========================
   RENDER JOBS + PAGINATION
========================= */
function renderJob(jobList) {
  displayedJob = jobList;
  jobContainer.innerHTML = "";

  if (!Array.isArray(jobList) || jobList.length === 0) {
    jobContainer.innerHTML = "<p>There is no job here!</p>";
    updatePagination();
    return;
  }

  const totalPages = Math.ceil(jobList.length / jobsPerPage) || 1;

  // tránh currentPage bị vượt quá totalPages sau khi lọc
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * jobsPerPage;
  const end = start + jobsPerPage;
  const jobsToShow = jobList.slice(start, end);

  jobsToShow.forEach((job) => {
    let salaryText = job.salary || "Negotiable";

    let jobPost = `
      <div class="job_container" onclick="jobDetail('${job.jobId}')">
        <div class="company_logo"><img src="${job.avatar}"></div>
        <div class="job_content">
          <h3>${job.jobTitle}</h3>
          <p>${job.companyName}</p>
          <p>${job.location}</p>
          <p>Salary: ${salaryText} VND</p>
        </div>
      </div>`;

    jobContainer.innerHTML += jobPost;
  });

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(displayedJob.length / jobsPerPage) || 1;
  document.getElementById("pageInfo").textContent = `${currentPage} / ${totalPages}`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderJob(displayedJob);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const totalPages = Math.ceil(displayedJob.length / jobsPerPage) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    renderJob(displayedJob);
  }
});

/* =========================
   JOB DETAIL
========================= */
function jobDetail(jobId) {
  let selectedJob = postedJobs.find((job) => job.jobId === jobId);
  if (selectedJob) {
    localStorage.setItem("selected_job_ID", JSON.stringify(jobId));
    window.open("../JobDetail/jobDetail.html", "_blank");
  } else {
    alert("del lưu được job id của mày");
  }
}

/* =========================
   SEARCH + ADVANCED FILTER
   (KẾT HỢP CHUNG)
========================= */
function applyFilters() {
  // reset về trang 1 mỗi khi đổi điều kiện lọc/tìm
  currentPage = 1;

  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const searchLocation = document.getElementById("location").value;
  const searchField = document.getElementById("field").value;
  const searchSalary = document.getElementById("salary").value;
  const searchExperience = document.getElementById("experience").value;

  searchedJobs = postedJobs.filter((job) => {
    /* ---- (A) SEARCH BAR (OR) ---- */
    let matchSearch = true;
    if (searchTerm !== "") {
      const t = searchTerm;

      const title = (job.jobTitle || "").toLowerCase();
      const company = (job.companyName || "").toLowerCase();
      const field = (job.field || "").toLowerCase();
      const location = (job.location || "").toLowerCase();

      matchSearch =
        title.includes(t) ||
        company.includes(t) ||
        field.includes(t) ||
        location.includes(t);
    }

    /* ---- (B) FIELD ---- */
    let matchField;
    if (searchField === "none") {
      matchField = true;
    } else {
      matchField = (job.field || "").toLowerCase() === searchField.toLowerCase();
    }

    /* ---- (C) LOCATION ---- */
    let matchLocation;
    let jobLocation = removeVietnameseTones(job.location || "");

    if (searchLocation === "none") {
      matchLocation = true;
    } else if (searchLocation === "other") {
      // Other = không thuộc 3 TP lớn (VN vẫn ok)
      matchLocation =
        !jobLocation.includes("ha noi") &&
        !jobLocation.includes("ho chi minh") &&
        !jobLocation.includes("da nang");
    } else {
      // option value của mày đã là không dấu (ha noi, ho chi minh, da nang)
      matchLocation = jobLocation.includes(searchLocation.toLowerCase());
    }

    /* ---- (D) SALARY ---- */
    let matchSalary;
    if (searchSalary === "none") {
      matchSalary = true;
    } else {
      const jobSalary = Number(job.salary);

      // nếu job.salary không phải số thì không match khi đang lọc salary
      if (!Number.isFinite(jobSalary)) {
        matchSalary = false;
      } else if (searchSalary.includes("-")) {
        const compareSalary = searchSalary.split("-");
        const minFilterSalary = parseInt(compareSalary[0], 10);
        const maxFilterSalary = parseInt(compareSalary[1], 10);

        matchSalary = jobSalary >= minFilterSalary && jobSalary <= maxFilterSalary;
      } else {
        // ví dụ: "70000000" => More than 70,000,000
        const minFilterSalary = parseInt(searchSalary, 10);
        matchSalary = jobSalary >= minFilterSalary;
      }
    }

    /* ---- (E) EXPERIENCE (GIỮ NGUYÊN LOGIC CỦA MÀY) ---- */
    let matchExperience;
    if (searchExperience === "none" || !job.experience || !job.experience.max) {
      matchExperience = searchExperience === "none";
    } else {
      let compareExp = searchExperience.split("-");
      const minExp = parseInt(compareExp[0], 10);
      const maxExp = parseInt(compareExp[1], 10);
      matchExperience = job.experience.max <= maxExp && job.experience.max > minExp;
    }

    // Kết hợp: SearchBar AND Field AND Location AND Salary AND Experience
    return matchSearch && matchField && matchLocation && matchSalary && matchExperience;
  });

  renderJob(searchedJobs);
}

/* =========================
   WRAPPERS (GIỮ TÊN HÀM CŨ)
========================= */
function searchJob() {
  applyFilters();
}

function advanceSearch() {
  applyFilters();
}

/* =========================
   REMOVE VIETNAMESE TONES
========================= */
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/* =========================
   EVENTS
========================= */
document.getElementById("field").addEventListener("change", advanceSearch);
document.getElementById("location").addEventListener("change", advanceSearch);
document.getElementById("salary").addEventListener("change", advanceSearch);
document.getElementById("experience").addEventListener("change", advanceSearch);

document.getElementById("searchBtn").addEventListener("click", searchJob);

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchJob();
  }
});
