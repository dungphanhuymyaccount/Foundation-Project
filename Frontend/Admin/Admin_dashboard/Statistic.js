// ==================== STATISTICS FUNCTIONALITY ====================

// 1. Fetch latest data from LocalStorage
function getStatsData() {
	const listUser = JSON.parse(localStorage.getItem("list_user")) || {
		list_student: [],
		list_employer: [],
	};
	const jobPosts = JSON.parse(localStorage.getItem("postedJobs")) || [];
	return {
		students: listUser.list_student,
		employers: listUser.list_employer,
		jobs: jobPosts,
	};
}

// 2. Update statistics on the Cards
function updateStatistics() {
	const data = getStatsData();
	document.getElementById("totalJobs").innerText = data.jobs.length;
	document.getElementById("totalStudents").innerText = data.students.length;
	document.getElementById("totalEmployers").innerText = data.employers.length;
}

// Call the update function immediately on page load
updateStatistics();

// 3. Attach Click events to the Cards
document
	.getElementById("jobsCard")
	.addEventListener("click", () => showDetails("job"));
document
	.getElementById("studentsCard")
	.addEventListener("click", () => showDetails("student"));
document
	.getElementById("employersCard")
	.addEventListener("click", () => showDetails("employer"));

// 4. Function to show details (Data Table + Search)
function showDetails(type) {
	const data = getStatsData();
	let currentList = [];
	let title = "";
	let headers = [];

	// Determine the type of data to display
	if (type === "job") {
		currentList = data.jobs;
		title = "JOB POSTS";
		headers = ["Job Title", "Company", "Location", "Salary"];
	} else if (type === "student") {
		currentList = data.students;
		title = "STUDENTS";
		headers = ["Full Name", "Email", "Phone", "University"];
	} else if (type === "employer") {
		currentList = data.employers;
		title = "EMPLOYERS";
		headers = ["Employer Name", "Company", "Email"];
	}

	const detailsSection = document.getElementById("detailsSection");
	detailsSection.classList.remove("hidden");

	// Render the container (Title, Search Box, Table)
	detailsSection.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:30px; margin-bottom:15px;">
            <h3>${title} LIST (${currentList.length})</h3>
            <button onclick="document.getElementById('detailsSection').classList.add('hidden')" 
                    class="style-button-js"">Close</button>
        </div>
        
        <input type="text" id="searchInputStats" placeholder="Search in ${title}..." class="form-control" style="margin-bottom: 15px;" />
        
        <div style="overflow-x: auto;">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        ${headers.map((h) => `<th>${h}</th>`).join("")}
                    </tr>
                </thead>
                <tbody id="statsTableBody"></tbody>
            </table>
        </div>
    `;

	// Render initial data
	renderStatsTable(currentList, type);

	// Scroll down to the details section
	detailsSection.scrollIntoView({ behavior: "smooth" });

	// Attach search event listener to the newly created input
	document.getElementById("searchInputStats").addEventListener("keyup", (e) => {
		const keyword = e.target.value.toLowerCase();
		const filtered = currentList.filter((item) => {
			// Search within all values of the object
			return Object.values(item).some((val) =>
				String(val).toLowerCase().includes(keyword),
			);
		});
		renderStatsTable(filtered, type);
	});
}

// 5. Function to render each row in the table
function renderStatsTable(list, type) {
	const tbody = document.getElementById("statsTableBody");

	if (list.length === 0) {
		tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No data found</td></tr>`;
		return;
	}

	tbody.innerHTML = list
		.map((item) => {
			let rowHtml = "";

			// Create columns based on data type
			if (type === "job") {
				rowHtml = `
                <td>${item.jobTitle || "N/A"}</td>
                <td>${item.companyName || "N/A"}</td>
                <td>${item.location || "N/A"}</td>
                <td>${item.salary || "N/A"}</td>
            `;
			} else if (type === "student") {
				rowHtml = `
                <td>${item.fullName || "N/A"}</td>
                <td>${item.email || "N/A"}</td>
                <td>${item.phoneNumber || "N/A"}</td>
                <td>${item.university || "N/A"}</td>
            `;
			} else if (type === "employer") {
				rowHtml = `
                <td>${item.employerName || "N/A"}</td>
                <td>${item.companyName || "N/A"}</td>
                <td>${item.email || "N/A"}</td>
            `;
			}
			return `<tr>${rowHtml}</tr>`;
		})
		.join("");
}
