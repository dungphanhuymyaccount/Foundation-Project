let jobContainer = document.querySelector(".job_post_section");
let allJobs = []; // chứa danh sách job
let searchedJobs = []; // biến chứa danh sách post sau khi tìm kiếm
let jobsPerPage = 6; //số job 1 trang
let currentPage = 1; //trang hiện tại
let displayedJob =[]; //chứa các job đang hiển thị trên màn hình

//hiển thị tên người dùng khi đã đăng nhập vào rồi
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const accountName = document.getElementById("current-user");
    if (currentUser) {
        accountName.textContent = `Hi, ${currentUser.fullName}`;
        //nếu chưa đăng nhập thì sẽ hiện là account
    } else {
        accountName.textContent = "Account";
    }
});

//lấy dữ liệu từ file job-data
fetch("../../../json/jobs-data.json")
    .then((res) => res.json())
    .then((data) => {
        allJobs = data.jobs || [];
        renderJob(allJobs);
    });

//hàm ghi dữ liệu ra các jobposts
function renderJob(jobList) {
    displayedJob= jobList;
    jobContainer.innerHTML = "";

    if (jobList.length === 0) {
        jobContainer.innerHTML = "<p>There is no job here!</p>";
        return;
    }
    const start = (currentPage -1) * jobsPerPage;
    const end = start + jobsPerPage;
    const jobsToShow = jobList.slice(start, end);

    //template của jobpost
    jobsToShow.forEach((job) => {
        let jobPost = `
            <a href="#">
                <div class="job_container">
                    <div class="company_logo"><img src = "${job.avatar}"></div>
                    <div class="job_content">
                        <h3>${job.jobTitle}</h3>
                        <p>${job.companyName}</p>
                        <p>${job.location}</p>
                        <p>Salary: ${job.salary && job.salary.min && job.salary.max ? job.salary.min.toLocaleString() + " - " +
                job.salary.max.toLocaleString() + " " + job.salary.currency : "Negotiable"}
                        </p>
                    </div>
                </div>
            </a>`;

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

        //lọc bằng location: không so sánh được với thằng có dấu tiếng việt. VD: ha noi!= Hà Nội
        let matchLocation;
        if (searchLocation === "none") {
            matchLocation = true;
        }
        else if (searchLocation === "other") {
            matchLocation =
                !job.location.toLowerCase().includes("viet") &&
                !job.location.toLowerCase().includes("ha noi") &&
                !job.location.toLowerCase().includes("ho chi minh") &&
                !job.location.toLowerCase().includes("da nang")
        }
        else {
            matchLocation = job.location.toLowerCase().includes(searchLocation.toLowerCase())
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