let jobContainer = document.querySelector(".job_post_section");
let allJobs = []; // chứa danh sách job
let searchedJobs = []; // biến chứa danh sách post sau khi tìm kiếm
let jobsPerPage = 6; //số job 1 trang
let currentPage = 1; //trang hiện tại
let displayedJob = []; //chứa các job đang hiển thị trên màn hình

//lấy dữ liệu từ file job-data
fetch("../../../json/jobs-data.json")
    .then((res) => res.json())
    .then((data) => {
        allJobs = data.jobs || [];
        renderJob(allJobs);
    });

//hàm ghi dữ liệu ra các jobposts
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

    //template của jobpost
    jobsToShow.forEach((job) => {
        let jobPost = `
                <div class="job_container" onclick = "jobDetail('${job.jobId}')">
                    <div class="company_logo"><img src = "${job.avatar}"></div>
                    <div class="job_content">
                        <h3>${job.jobTitle}</h3>
                        <p>${job.companyName}</p>
                        <p>${job.location}</p>
                        <p>Salary: ${job.salary && job.salary.min && job.salary.max ? job.salary.min.toLocaleString() + " - " +
                job.salary.max.toLocaleString() + " " + job.salary.currency : "Negotiable"}</p>
                    </div>
                </div>`;
        jobContainer.innerHTML += jobPost;
    });
    updatePagination();
}

function jobDetail(jobId) {
    let selectedJob = allJobs.find(job => job.jobId === jobId);
    if (selectedJob) {
        localStorage.setItem("selected_job_ID", JSON.stringify(jobId));
        window.location.href = "../JobDetail/jobDetail.html";
    }else {
        alert("del lưu được job id của mày");
    }

}
//chức năng bấm chuyển trang
function updatePagination() {
    const totalPages = Math.ceil(displayedJob.length / jobsPerPage) || 1;
    document.getElementById("pageInfo").textContent = `${currentPage} / ${totalPages}`;
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages;
}

// Nút chuyển trang
document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderJob(displayedJob);
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(allJobs.length / jobsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderJob(displayedJob);
    }
});
//chức năng tìm kiếm bằng thanh tìm kiếm
function searchJob() {
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();

    if (searchTerm === "") {
        renderJob(allJobs);
        return;
    }

    searchedJobs = allJobs.filter(
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

//tìm kiếm bằng filter lọc 
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
        renderJob(allJobs);
        return;
    }

    searchedJobs = allJobs.filter((job) => {
        //lọc bằng field
        let matchField;
        if (searchField === "none") {
            matchField = true;
        }
        else {
            matchField = job.field.toLowerCase() === searchField.toLowerCase();
        }

        //lọc bằng location: không so sánh được với post có location có dấu tiếng việt. VD: ha noi!= Hà Nội
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

        //lọc bằng salary: min của filter < max của post <= max của filter
        let compareSalary = searchSalary.split("-");
        const minFilterSalary = parseInt(compareSalary[0]);
        const maxFilterSalary = parseInt(compareSalary[1]);
        let matchSalary;
        if (searchSalary === "none") {
            matchSalary = true
        } else {
            matchSalary = job.salary.max > minFilterSalary && job.salary.max <= maxFilterSalary;
        }


        //lọc bằng experience: như lọc salary
        let compareExp = searchExperience.split("-");
        const minExp = parseInt(compareExp[0]);
        const maxExp = parseInt(compareExp[1]);
        let matchExperience;
        if (searchExperience === "none") {
            matchExperience = true;
        } else {
            matchExperience = job.experience.max <= maxExp && job.experience.max > minExp;
        }

        return matchField && matchExperience && matchLocation && matchSalary;
    }
    )
    //hiện các job được filter
    renderJob(searchedJobs);

}

//hàm xóa dấu tiếng việt
function removeVietnameseTones(str) {
    return str
        .normalize("NFD") // tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d") // thay đ -> d
        .replace(/Đ/g, "D") // thay Đ -> D
        .toLowerCase(); // viết thường để so sánh dễ
}

//gắn sự kiện lọc filter mỗi khi giá trị của filter thay đổi
document.getElementById("field").addEventListener("change", advanceSearch);
document.getElementById("location").addEventListener("change", advanceSearch);
document.getElementById("salary").addEventListener("change", advanceSearch);
document.getElementById("experience").addEventListener("change", advanceSearch);

//gắn sự kiện tìm kiếm khi bấm nút tìm kiếm ở thanh công cụ
document.getElementById("searchBtn").addEventListener("click", searchJob);
//gắn sự kiện tìm kiếm khi bấm enter
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchJob();
    }
});