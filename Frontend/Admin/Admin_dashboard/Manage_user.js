let allUser = [];
// Get user account data from local storage
let list_user = JSON.parse(localStorage.getItem('list_user')) || {
	list_student: [],
	list_employer: []
};
// Combine all user account objects from both the student list and employer list into a single array
allUser = [...list_user.list_student, ...list_user.list_employer];
let pendingDeleteEmail = null;// Email in pending deletion confirmation status
// Navigation control
function showSection(sectionId) {
	document
		.querySelectorAll(".content-section")
		.forEach((s) => s.classList.add("hidden"));
	document.getElementById(sectionId).classList.remove("hidden");
}

// Validate the format of email and name
function validate(email, password, employerName, companyName) {
	const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const password_pattern = /^.{6,}$/;
	const error_message_email = document.getElementById('error-message-email');
	const error_message_password = document.getElementById('error-message-password');
	const error_message_employer_name = document.getElementById('error-message-employer-name');
	const error_message_company_name = document.getElementById("error-message-company-name");
	let validEmail = true;
	let validPassword = true;
	let validEmployerName = true;
	let validCompanyName = true;
	let isValid = false;
	// Check if the email field is filled
	if (!email) {
		error_message_email.innerHTML = "<p>Please enter your email!</p>";
		validEmail = false;
	}
	else {
		// Check if the format is valid
		if (!email_pattern.test(email)) {
			error_message_email.innerHTML = "<p>Incorrect format. Please enter again!</p>";
			validEmail = false;
		}
		else {
			error_message_email.innerHTML = "";
			validEmail = true;
		}

	}

	// Check if the password field is filled
	if (!password) {
		error_message_password.innerHTML = "<p>Please enter your password!</p>";
		validPassword = false;
	}
	else {
		error_message_password.innerHTML = "";
		validPassword = true;
	}

	// Check if the format is correct
	if (!password_pattern.test(password)) {
		error_message_password.innerHTML = "<p>Your password must contain at least 6 characters!</p>";
		validPassword = false;
	}
	else {
		error_message_password.innerHTML = "";
		validPassword = true;
	}

	// Check the full name format
	if (!employerName) {
		error_message_employer_name.innerHTML = "<p>Please enter your name!</p>";
		validEmployerName = false;
	}
	else {
		error_message_employer_name.innerHTML = "";
		validEmployerName = true;
	}

	if (!companyName) {
		error_message_company_name.innerHTML = "<p>Please enter your company's name!</p>";
		validCompanyName = false;
	}
	else {
		error_message_company_name.innerHTML = "";
		validCompanyName = true;
	}

	if ((validEmail && validPassword && validEmployerName && validCompanyName)) {
		isValid = true;
	}
	return isValid;
}
// Check if the email already exists
function existEmail(email) {
	if (email) {
		return checkEmail = allUser.some(user => user.email === email);
	}
}

function getEmployerID() {
    let list = JSON.parse(localStorage.getItem('list_user')) || {
        list_student: [],
        list_employer: []
    };

    let allEmployers = list.list_employer;

	if (allEmployers.length === 0) {
		return "EMP001";
	}

    let maxID = allEmployers.reduce((max, user) => {
       // ✅ FIXED: Use user.EmployerID
        let num = parseInt(user.EmployerID?.replace("EMP", "")) || 0; 
        return Math.max(max, num);
    }, 0);

	let nextID = maxID + 1;

	return "EMP" + String(nextID).padStart(3, "0");
}
// Function to create an employer
document.getElementById("employerForm").addEventListener("submit", function (e) {
	e.preventDefault();

	const employerName = document.getElementById("employerName").value.trim();
	const companyName = document.getElementById("companyName").value.trim();
	const email = document.getElementById("email").value.trim();
	const password = document.getElementById("password").value.trim();
	//validate
	if (!validate(email, password, employerName, companyName)) {
		return;
	}


	if (existEmail(email)) {
		document.getElementById('error-message-email').innerHTML = "<p>Email already exist!!</p>";;
		return;
	}

	const newEmployer = {
		EmployerID: getEmployerID(),
		employerName: employerName,
		companyName: companyName,
		email: email,
		password: password,
		role: "Employer",
	};
	console.log("✅ New Employer Created:", newEmployer);
	// Get user account data from local storage
	let list_user = JSON.parse(localStorage.getItem('list_user')) || {
		list_student: [],
		list_employer: []
	};
	// Push the new user into the array
	list_user.list_employer.push(newEmployer);
	allUser = [...list_user.list_student, ...list_user.list_employer];// Update the user list
	//lưu lại mảng list user mới cập nhật vào local storage
	
	localStorage.setItem('list_user', JSON.stringify(list_user))
	alert("Create employer successfull!")
	e.target.reset();
});

// Display account information by role, including search functionality
function renderUserTable(searchTerm = "") {
	const tbody = document.querySelector("#userTable tbody");// Display the user list
	const thead = document.querySelector("#userTable thead");/// Display the table header
	const roleSelect = document.getElementById('role').value; // Filter and display users based on their role
	thead.innerHTML = "";
	tbody.innerHTML = "";
	let userRoleFilter = allUser.filter(user => user.role === roleSelect);
	if (searchTerm !== "") {
		if (roleSelect === "Student") {
			userRoleFilter = userRoleFilter.filter(student =>
				student.fullName.trim().toLowerCase().includes(searchTerm) ||
				student.email.trim().toLowerCase().includes(searchTerm)
			)
		}
		if (roleSelect === "Employer") {
			userRoleFilter = userRoleFilter.filter(employer =>
				employer.employerName.trim().toLowerCase().includes(searchTerm) ||
				employer.companyName.trim().toLowerCase().includes(searchTerm) ||
				employer.email.trim().toLowerCase().includes(searchTerm)
			)
		}
	}
	// Template for displaying the table of users with the student role
	if (roleSelect === "Student") {
		thead.innerHTML = `
      <th>Full Name</th>
      <th>Email</th>
      <th>Action</th>`;
		userRoleFilter.forEach(student => {
			const row = document.createElement("tr");
			row.innerHTML = `
	    <td>${student.fullName}</td>
	    <td>${student.email}</td>
		<td><button id= "delete-btn" class="style-button-js"  onclick="deleteUser('${student.email}')">Delete</button></td>`;
			tbody.appendChild(row);
		})

		// Template for displaying the table of users with the employer role
	}
	if (roleSelect === "Employer") {
		thead.innerHTML = `
      <th>Full Name</th>
      <th>Company Name</th>
      <th>Email</th>
      <th>Action</th>
    `;
		userRoleFilter.forEach(employer => {
			const row = document.createElement("tr");
			row.innerHTML = `
	    <td>${employer.employerName}</td>
	    <td>${employer.companyName}</td>
	    <td>${employer.email}</td>
	    <td><button id= "delete-btn" class="style-button-js"  onclick="deleteUser('${employer.email}')">Delete</button></td>
	  `;
			tbody.appendChild(row);
		})
	}
}

// Search for user
document.getElementById("searchUser").addEventListener("keyup", function () {
	renderUserTable(this.value.toLowerCase());
});

// Change role (student / employer)
document.getElementById("role").addEventListener("change", function () {
	renderUserTable();
});

renderUserTable();// Display on the first load

// Trigger popup when clicking delete
function deleteUser(email) {
	pendingDeleteEmail = email;
	document.getElementById("confirmModal").classList.remove("hidden");
}

// delpete user
document.getElementById("Yes").addEventListener("click", function () {
	console.log(document.getElementById("Yes"));
	if (!pendingDeleteEmail) return;

	// delete user in allUser
	allUser = allUser.filter(user => user.email !== pendingDeleteEmail);

	// Update the list_user according to the role
	list_user.list_student = allUser.filter(user => user.role === "Student");
	list_user.list_employer = allUser.filter(user => user.role === "Employer");
	allUser = [...list_user.list_student, ...list_user.list_employer];
	// Save changes
	localStorage.setItem("list_user", JSON.stringify(list_user));
	renderUserTable(document.getElementById("searchUser").value.toLowerCase());
	alert("Delete User successful!")
	updateStatistics();
	// Close the popup
	document.getElementById("confirmModal").classList.add("hidden");
	pendingDeleteEmail = null;

});

// IF NO is clicked → Close the popup
document.getElementById("No").addEventListener("click", function () {
	pendingDeleteEmail = null;
	document.getElementById("confirmModal").classList.add("hidden");
});



// -------------------- STATISTICS --------------------
// function updateStatistics() {
// 	document.getElementById("totalJobs").innerText = jobPosts.length;
// 	document.getElementById("totalStudents").innerText = students.length;
// 	document.getElementById("totalEmployers").innerText = employers.length;
// }

// updateStatistics();

// document
// 	.getElementById("jobsCard")
// 	.addEventListener("click", () => showDetails("job"));
// document
// 	.getElementById("studentsCard")
// 	.addEventListener("click", () => showDetails("student"));
// document
// 	.getElementById("employersCard")
// 	.addEventListener("click", () => showDetails("employer"));

// function showDetails(type) {
// 	let data;
// 	if (type === "job") data = jobPosts;
// 	if (type === "student") data = students;
// 	if (type === "employer") data = employers;

// 	const details = document.getElementById("detailsSection");
// 	details.classList.remove("hidden");

// 	details.innerHTML = `
//     <h3>${type.toUpperCase()} LIST</h3>
//     <input type="text" id="searchInput" placeholder="Search ${type}..." class="form-control" />
//     <table border="1" cellpadding="8">
//       <thead>
//         <tr>${Object.keys(data[0])
// 			.map((k) => `<th>${k}</th>`)  hxcvV
// 			.join("")}</tr>
//       </thead>
//       <tbody id="dataTable"></tbody>
//     </table>
//   `;

// 	renderTable(data);

// 	document.getElementById("searchInput").addEventListener("input", (e) => {
// 		const keyword = e.target.value.toLowerCase();
// 		const filtered = data.filter((item) =>
// 			Object.values(item).some((val) =>
// 				val.toString().toLowerCase().includes(keyword),
// 			),
// 		);
// 		renderTable(filtered);
// 	});
// }

// function renderTable(list) {
// 	const tableBody = document.getElementById("dataTable");
// 	tableBody.innerHTML = list
// 		.map(
// 			(item) => `
//     <tr onclick="showItemDetail('${JSON.stringify(item).replace(
// 				/"/g,
// 				"&quot;",
// 			)}')">
//       ${Object.values(item)
// 					.map((val) => `<td>${val}</td>`)
// 					.join("")}
//     </tr>
//   `,
// 		)
// 		.join("");
// }

// function showItemDetail(itemStr) {
// 	const item = JSON.parse(itemStr);
// 	alert(
// 		"DETAIL:\n" +
// 		Object.entries(item)
// 			.map(([k, v]) => `${k}: ${v}`)
// 			.join("\n"),
// 	);
// }

