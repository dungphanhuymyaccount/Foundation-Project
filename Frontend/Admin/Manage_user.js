// Mock Data
let jobPosts = [
	{
		id: 1,
		title: "Frontend Developer",
		company: "TechVision",
		location: "Hà Nội",
	},
	{
		id: 2,
		title: "Backend Engineer",
		company: "SoftWorld",
		location: "TP.HCM",
	},
];

let students = [
	{ id: 1, name: "Nguyễn Văn A", email: "a@gmail.com" },
	{ id: 2, name: "Trần Thị B", email: "b@gmail.com" },
];

let employers = [
	{ id: 1, name: "Công ty ABC", email: "hr@abc.com" },
	{ id: 2, name: "Công ty XYZ", email: "contact@xyz.com" },
];

let users = [
	{
		fullName: "Nguyễn Văn A",
		companyName: "",
		email: "a@gmail.com",
		role: "Student",
	},
	{
		fullName: "Công ty ABC",
		companyName: "ABC",
		email: "hr@abc.com",
		role: "Employer",
	},
];

// Navigation control
function showSection(sectionId) {
	document
		.querySelectorAll(".content-section")
		.forEach((s) => s.classList.add("hidden"));
	document.getElementById(sectionId).classList.remove("hidden");
}

// -------------------- CREATE EMPLOYER --------------------
document
	.getElementById("employerForm")
	.addEventListener("submit", function (e) {
		e.preventDefault();

		const fullName = document.getElementById("fullName").value.trim();
		const companyName = document.getElementById("companyName").value.trim();
		const email = document.getElementById("email").value.trim();
		const password = document.getElementById("password").value.trim();
		const phone = document.getElementById("phone").value.trim();
		const address = document.getElementById("address").value.trim();

		if (!fullName || !companyName || !email || !password) {
			alert("Please fill all required fields!");
			return;
		}

		if (!email.includes("@")) {
			alert("Invalid email format!");
			return;
		}

		const newEmployer = {
			fullName,
			companyName,
			email,
			password,
			phone,
			address,
			role: "Employer",
		};
		console.log("✅ New Employer Created:", newEmployer);

		users.push(newEmployer);
		employers.push({ id: employers.length + 1, name: companyName, email });
		updateStatistics();
		alert("Employer created successfully!");

		e.target.reset();
	});

// -------------------- DELETE USER --------------------
function renderUserTable(filter = "") {
	const tbody = document.querySelector("#userTable tbody");
	tbody.innerHTML = "";

	users
		.filter((u) =>
			Object.values(u).some((val) =>
				val.toLowerCase().includes(filter.toLowerCase()),
			),
		)
		.forEach((u, i) => {
			const row = document.createElement("tr");
			row.innerHTML = `
        <td>${u.fullName}</td>
        <td>${u.companyName}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td><button class="style-button-js"  onclick="deleteUser(${i})">Delete</button></td>
      `;
			tbody.appendChild(row);
		});
}

function deleteUser(index) {
	if (confirm("Are you sure you want to delete this user?")) {
		users.splice(index, 1);
		renderUserTable(document.getElementById("searchUser").value);
		updateStatistics();
	}
}

document.getElementById("searchUser").addEventListener("input", (e) => {
	renderUserTable(e.target.value);
});

renderUserTable();

// -------------------- STATISTICS --------------------
function updateStatistics() {
	document.getElementById("totalJobs").innerText = jobPosts.length;
	document.getElementById("totalStudents").innerText = students.length;
	document.getElementById("totalEmployers").innerText = employers.length;
}

updateStatistics();

document
	.getElementById("jobsCard")
	.addEventListener("click", () => showDetails("job"));
document
	.getElementById("studentsCard")
	.addEventListener("click", () => showDetails("student"));
document
	.getElementById("employersCard")
	.addEventListener("click", () => showDetails("employer"));

function showDetails(type) {
	let data;
	if (type === "job") data = jobPosts;
	if (type === "student") data = students;
	if (type === "employer") data = employers;

	const details = document.getElementById("detailsSection");
	details.classList.remove("hidden");

	details.innerHTML = `
    <h3>${type.toUpperCase()} LIST</h3>
    <input type="text" id="searchInput" placeholder="Search ${type}..." class="form-control" />
    <table border="1" cellpadding="8">
      <thead>
        <tr>${Object.keys(data[0])
					.map((k) => `<th>${k}</th>`)
					.join("")}</tr>
      </thead>
      <tbody id="dataTable"></tbody>
    </table>
  `;

	renderTable(data);

	document.getElementById("searchInput").addEventListener("input", (e) => {
		const keyword = e.target.value.toLowerCase();
		const filtered = data.filter((item) =>
			Object.values(item).some((val) =>
				val.toString().toLowerCase().includes(keyword),
			),
		);
		renderTable(filtered);
	});
}

function renderTable(list) {
	const tableBody = document.getElementById("dataTable");
	tableBody.innerHTML = list
		.map(
			(item) => `
    <tr onclick="showItemDetail('${JSON.stringify(item).replace(
			/"/g,
			"&quot;",
		)}')">
      ${Object.values(item)
				.map((val) => `<td>${val}</td>`)
				.join("")}
    </tr>
  `,
		)
		.join("");
}

function showItemDetail(itemStr) {
	const item = JSON.parse(itemStr);
	alert(
		"DETAIL:\n" +
			Object.entries(item)
				.map(([k, v]) => `${k}: ${v}`)
				.join("\n"),
	);
}
