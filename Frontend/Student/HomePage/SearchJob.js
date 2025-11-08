let jobContainer = document.querySelector(".job_post_section");
      let allJobs = []; // chứa danh sách job
      let searchedJobs = []; // biến chứa danh sách post sau khi tìm kiếm

      //hiển thị tên người dùng khi đã đăng nhập vào rồi
      document.addEventListener("DOMContentLoaded", () => {
        const currentUser = JSON.parse(localStorage.getItem("current_user"));
        const accountName = document.getElementById("current-user");
        if (currentUser) {
          accountName.textContent = `Hi, ${currentUser.fullName}`;
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
        jobContainer.innerHTML = "";

        if (jobList.length === 0) {
          jobContainer.innerHTML = "<p>There is no job here!</p>";
          return;
        }

        jobList.forEach((job) => {
          let jobPost = `
            <a href="#">
                <div class="job_container">
                    <div class="company_logo"><img src = "${job.avatar}"></div>
                    <div class="job_content">
                        <h3>${job.jobTitle}</h3>
                        <p>${job.companyName}</p>
                        <p>${job.location}</p>
                        <p>Salary: ${
                          job.salary && job.salary.min && job.salary.max
                            ? job.salary.min.toLocaleString() +
                              " - " +
                              job.salary.max.toLocaleString() +
                              " " +
                              job.salary.currency
                            : "Negotiable"
                        }
                        </p>
                    </div>
                </div>
            </a>`;

          jobContainer.innerHTML += jobPost;
        });
      }

      //chức năng tìm kiếm bằng thanh tìm kiếm
      function searchJob() {
        const searchTerm = document
          .getElementById("searchInput")
          .value.trim()
          .toLowerCase();

        if (searchTerm === "") {
          renderJob(allJobs.slice(0, 3));
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

        //gắn sự kiện tìm kiếm khi bấm enter
        document
          .getElementById("searchInput")
          .addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              searchJob();
            }
          });
      }

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
        }

        //lọc bằng field
        searchedJobs= allJobs.filter((job) =>job.field === searchField)
      }

      document.getElementById("searchBtn").addEventListener("click", searchJob);