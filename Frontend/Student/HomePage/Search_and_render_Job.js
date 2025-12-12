let jobContainer = document.querySelector(".job_post_section");
let searchedJobs = []; // Variable storing the list of posts after searching
let jobsPerPage = 6; // Number of jobs per page
let currentPage = 1; // Current page
let displayedJob = []; // Store the jobs currently displayed on the screen
let postedJobs = JSON.parse(localStorage.getItem('postedJobs')) || []; // Get job post data from local storage

// Render jobs when the page initializes
renderJob(postedJobs);
// Function to write data into the job posts
function renderJob(jobList) {
    displayedJob = jobList;
    jobContainer.innerHTML = "";

    if (jobList.length === 0) {
        jobContainer.innerHTML = "<p>There is no job here!</p>";
        return;
    }
    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const jobsToShow = jobList.slice(start, end);

    jobsToShow.forEach((job) => {
       // Check whether the salary exists and contains complete data
        let salaryText = job.salary|| "Negotiable";
        //template of job card
        let jobPost = `
                <div class="job_container" onclick = "jobDetail('${job.jobId}')">
                    <div class="company_logo"><img src = "${job.avatar}"></div>
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

function jobDetail(jobId) {
    let selectedJob = postedJobs.find(job => job.jobId === jobId);
    if (selectedJob) {
        localStorage.setItem("selected_job_ID", JSON.stringify(jobId));
        window.open("../JobDetail/jobDetail.html", "_blank");
    }else {
        alert("del lưu được job id của mày");
    }

}
// Pagination button functionality
function updatePagination() {
    const totalPages = Math.ceil(displayedJob.length / jobsPerPage) || 1;
    document.getElementById("pageInfo").textContent = `${currentPage} / ${totalPages}`;
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

// Page navigation buttons
document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderJob(displayedJob);
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(displayedJob.length / jobsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderJob(displayedJob);
    }
});
// Search functionality using the search bar
function searchJob() {
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

    if (searchTerm === "") {
        renderJob(postedJobs);
        return;
    }

    searchedJobs = postedJobs.filter(
        (job) =>
            job.jobTitle.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm) ||
            job.field.toLowerCase().includes(searchTerm) ||
            job.companyName.toLowerCase().includes(searchTerm)
    );
    if (searchedJobs) {
        renderJob(searchedJobs);
    }


}

// Search using filter options
function advanceSearch() {
    const searchLocation = document.getElementById("location").value;
    const searchField = document.getElementById("field").value;
    const searchSalary = document.getElementById("salary").value;
    const searchExperience = document.getElementById("experience").value;

    if (
        searchLocation === "none" &&
        searchField === "none" &&
        searchSalary === "none" &&
        searchExperience === "none"
    ) {
        renderJob(postedJobs);
        return;
    }

    searchedJobs = postedJobs.filter((job) => {
       // Filter by field
        let matchField;
        if (searchField === "none") {
            matchField = true;
        }
        else {
            matchField = job.field.toLowerCase() === searchField.toLowerCase();
        }

        // Filter by location: cannot compare with posts containing Vietnamese accents (e.g., "ha noi" != "Hà Nội")
        let matchLocation;
        let jobLocation = removeVietnameseTones(job.location);
        if (searchLocation === "none") {
            matchLocation = true;
        }
        else if (searchLocation === "other") {
            matchLocation =
                !jobLocation.toLowerCase().includes("viet") &&
                !jobLocation.toLowerCase().includes("ha noi") &&
                !jobLocation.toLowerCase().includes("ho chi minh") &&
                !jobLocation.toLowerCase().includes("da nang")
        }
        else {
            matchLocation = jobLocation.toLowerCase().includes(searchLocation.toLowerCase())
        }

        // Filter by salary: filter_min < post_max <= filter_max
        let matchSalary;
        let compareSalary = searchSalary.split("-");
        const minFilterSalary = parseInt(compareSalary[0]);
        const maxFilterSalary = parseInt(compareSalary[1]);
            matchSalary = job.salary >= minFilterSalary && job.salary <= maxFilterSalary;

        // Filter by experience
        let matchExperience;
        if (searchExperience === "none" || !job.experience || !job.experience.max) {
            matchExperience = searchExperience === "none";
        } else {
        let compareExp = searchExperience.split("-");
        const minExp = parseInt(compareExp[0]);
        const maxExp = parseInt(compareExp[1]);
            matchExperience = job.experience.max <= maxExp && job.experience.max > minExp;
        }

        return matchField && matchExperience && matchLocation && matchSalary;
    });
    // Display the filtered jobs
    renderJob(searchedJobs);
}

// Function to remove Vietnamese accents
function removeVietnameseTones(str) {
    return str
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/đ/g, "d") 
        .replace(/Đ/g, "D") 
        .toLowerCase(); 
}

// Attach filter events whenever a filter value changes
document.getElementById("field").addEventListener("change", advanceSearch);
document.getElementById("location").addEventListener("change", advanceSearch);
document.getElementById("salary").addEventListener("change", advanceSearch);
document.getElementById("experience").addEventListener("change", advanceSearch);

// Attach search event when clicking the search button on the toolbar
document.getElementById("searchBtn").addEventListener("click", searchJob);
// Attach search event when pressing Enter
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchJob();
    }
});