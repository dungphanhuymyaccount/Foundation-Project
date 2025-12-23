	// ==================== CONFIGURATION AND GLOBAL VARIABLES ====================
	const ALL_STUDENTS_STORAGE_KEY = "list_user";
	const LOGGED_IN_EMAIL_KEY = "loggedInEmail"; // Still kept, but less important
	const CURRENT_USER_STORAGE_KEY = "current_user"; // New key being used
	const DEFAULT_AVATAR = "image/OIP.jpg";

	let allStudents = [];
	let currentUser = null;
	let originalData = {}; // Original data to check for changes (e.g., email change)

	// ==================== COMMON DATA HANDLING FUNCTIONS (LOCAL STORAGE) ====================

	/**
	 * Get the entire database object from Local Storage, including list_student.
	 * @returns {object} - Object containing list_student and list_employer.
	 */
	const getDatabaseObject = () => {
		const storedData = localStorage.getItem(ALL_STUDENTS_STORAGE_KEY);
		if (storedData) {
			try {
				return JSON.parse(storedData);
			} catch (e) {
				console.error("Error parsing Local Storage DB:", e);
			}
		}
		// Return default structure if not found or error occurs
		return { list_student: [], list_employer: [] };
	};

	/**
	 * Initialize Database: Read student array from Local Storage.
	 * BUG FIX: Ensure emails in DB are converted to lowercase on first load.
	 */
	function initializeDatabase() {
		const db = getDatabaseObject();
		allStudents = db.list_student || [];
		allStudents = allStudents.map((student) => ({
			...student,
			email: student.email ? student.email.toLowerCase() : "",
		}));
		console.log(
			`Loaded student DB (${allStudents.length} items) from Local Storage.`,
		);
	}

	/**
	 * Save the entire allStudents array to Local Storage (in the list_student field).
	 */
	function saveAllStudents() {
		const db = getDatabaseObject();
		// Update list_student
		db.list_student = allStudents;
		localStorage.setItem(ALL_STUDENTS_STORAGE_KEY, JSON.stringify(db));
		console.log("Saved entire student DB to Local Storage.");
	}

	/**
	 * Find student by Email in allStudents array (to check for duplicates).
	 * @param {string} email - Email to find (already normalized to lowercase)
	 * @returns {object|null} - Student object if found, otherwise null.
	 */
	const findStudentByEmail = (email) => {
		//Ensure the search email is also normalized to lowercase
		const normalizedEmail = email ? email.toLowerCase() : "";
		const student = allStudents.find((s) => s.email === normalizedEmail);
		return student ? { ...student } : null;
	};

	// ==================== GET CURRENT_USER FUNCTION (NEW LOGIC) ====================

	/**
	 * Get current user data stored directly under the 'current_user' key.
	 * @returns {object|null} - User object if it exists and is successfully parsed.
	 */
	function getCurrentUserFromLocalStorage() {
		const storedData = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

		if (storedData) {
			try {
				const userData = JSON.parse(storedData);

				// Handle case where data is stored as an array
				const finalUserData = Array.isArray(userData) ? userData[0] : userData;

				if (finalUserData && finalUserData.email) {
					//Normalize email to lowercase immediately after reading
					finalUserData.email = finalUserData.email.toLowerCase();
				}

				return finalUserData || null;
			} catch (e) {
				console.error(
					`Error parsing JSON from key "${CURRENT_USER_STORAGE_KEY}":`,
					e,
				);
				return null;
			}
		}
		console.log(
			`No data found under key "${CURRENT_USER_STORAGE_KEY}" in Local Storage.`,
		);
		return null;
	}

	// ==================== DATE CONVERSION FUNCTIONS ====================

	/**
	 * Convert MM/DD/YYYY (from DB) to YYYY-MM-DD (for input type="date")
	 * @param {string} dateString - Date in MM/DD/YYYY format
	 * @returns {string} - Date in YYYY-MM-DD format
	 */
	function convertToYYYYMMDD(dateString) {
		if (!dateString) return "";
		const parts = dateString.split("/");
		if (parts.length === 3) {
			const [month, day, year] = parts;
			const formattedMonth = month.padStart(2, "0");
			const formattedDay = day.padStart(2, "0");
			return `${year}-${formattedMonth}-${formattedDay}`;
		}
		return "";
	}

	/**
	 * Convert YYYY-MM-DD (from input type="date") to MM/DD/YYYY (for DB)
	 * @param {string} dateString - Date in YYYY-MM-DD format
	 * @returns {string} - Date in MM/DD/YYYY format
	 */
	function convertToMMDDYYYY(dateString) {
		if (!dateString) return "";
		const parts = dateString.split("-");
		if (parts.length === 3) {
			const [year, month, day] = parts;
			return `${month}/${day}/${year}`;
		}
		return dateString;
	}

	// ==================== GET FORM INPUTS ====================
	const getPersonalInputs = () => {
		const generalSection = document.querySelector("#account-general");
		if (!generalSection) return {};

		const inputs = generalSection.querySelectorAll(
			'.card-body input:not([type="file"])',
		);

		return {
			fullName: inputs[0],
			birthday: inputs[1],
			phoneNumber: inputs[2],
			address: inputs[3],
			email: inputs[4],
			university: inputs[5],
		};
	};

	const getPasswordInputs = () => {
		const passwordSection = document.querySelector("#account-change-password");
		if (!passwordSection) return {};
		const allInputs = passwordSection.querySelectorAll(
			".card-body input[type='password']",
		);
		return {
			currentPassword: allInputs[0],
			newPassword: allInputs[1],
			repeatPassword: allInputs[2],
		};
	};

	// ==================== MAIN PAGE INITIALIZATION (NEW LOGIC) ====================
	function initializePage() {
		console.log("Initializing page...");

		// 1. Initialize DB (Read list_user - required for updates and duplicate checks)
		initializeDatabase();

		// 2. GET USER DATA FROM "current_user" KEY (NEW LOGIC)
		const studentData = getCurrentUserFromLocalStorage();

		if (studentData) {
			// Data has been normalized to lowercase in getCurrentUserFromLocalStorage()
			currentUser = studentData;
			loadPersonalProfile();

			// Reset password form
			const passInputs = getPasswordInputs();
			if (passInputs.currentPassword) passInputs.currentPassword.value = "";
			if (passInputs.newPassword) passInputs.newPassword.value = "";
			if (passInputs.repeatPassword) passInputs.repeatPassword.value = "";

			console.log("Current user (from current_user):", currentUser);

			// BUG FIX: Ensure this currentUser exists in allStudents to enable Saving
			const foundInDB = findStudentByEmail(currentUser.email);
			if (!foundInDB) {
				// Case where user is logged in but not in list_user, add them to allow Saving
				allStudents.push(currentUser);
				saveAllStudents();
				console.warn(
					"Warning: Added currentUser to allStudents to ensure Save functionality.",
				);
			}
		} else {
			// Case where "current_user" key is not found
			showNotification(
				"Logged-in user data not found (key 'current_user' is empty/error). Please log in again.",
				"error",
			);
			// Remove loggedInEmail/current_user to avoid potential loops
			localStorage.removeItem(LOGGED_IN_EMAIL_KEY);
			localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
		}
	}

	// ==================== LOAD PERSONAL PROFILE ====================
	function loadPersonalProfile() {
		if (!currentUser) {
			console.error("No currentUser data available");
			return;
		}
		console.log("Loading personal profile...");
		const avatar = document.querySelector(".ui-w-80");
		const inputs = getPersonalInputs();

		// Prepare data for form (using unified lowercase keys)
		const personalData = {
			fullName: currentUser.fullName || "",
			// Convert MM/DD/YYYY to YYYY-MM-DD
			birthday: convertToYYYYMMDD(currentUser.birthday) || "",
			phoneNumber: currentUser.phoneNumber || "",
			address: currentUser.address || "",
			email: currentUser.email || "",
			university: currentUser.university || "",
			avatar: currentUser.avatar || DEFAULT_AVATAR,
		};

		// Fill form with data
		if (inputs.fullName) inputs.fullName.value = personalData.fullName;
		if (inputs.birthday) inputs.birthday.value = personalData.birthday;
		if (inputs.phoneNumber) inputs.phoneNumber.value = personalData.phoneNumber;
		if (inputs.address) inputs.address.value = personalData.address;
		if (inputs.email) inputs.email.value = personalData.email;
		if (inputs.university) inputs.university.value = personalData.university;
		if (avatar) avatar.src = personalData.avatar;

		// Save original data (important for comparing email changes)
		originalData = { ...personalData };

		// Clear old error messages
		document
			.querySelectorAll(".is-invalid")
			.forEach((el) => el.classList.remove("is-invalid"));

		console.log("Personal profile loaded:", personalData);
		showNotification("Personal info loaded: " + personalData.fullName, "success");
	}

	// ==================== GENERAL SAVE PROFILE ====================
	window.saveProfile = function () {
		if (!currentUser) {
			showNotification("Error: No logged-in user found.", "error");
			return false;
		}

		const isPersonalSaved = savePersonalProfile();
		const passInputs = getPasswordInputs();

		const isPasswordChangeAttempted =
			passInputs.currentPassword?.value.trim() !== "" ||
			passInputs.newPassword?.value.trim() !== "" ||
			passInputs.repeatPassword?.value.trim() !== "";

		let isPasswordSaved = true;

		if (isPasswordChangeAttempted) {
			console.log("Password change attempt detected...");
			isPasswordSaved = savePassword();
		}

		if (isPersonalSaved) {
			if (isPasswordChangeAttempted) {
				if (isPasswordSaved) {
					// Password changed successfully (notification already handled in savePassword)
				} else {
					showNotification(
						"Personal info saved successfully! (Password change failed)", "warning",
					);
				}
			} else {
				showNotification("Personal info and new password saved successfully!", "success");
			}
		}

		return isPersonalSaved && isPasswordSaved;
	};

	// ==================== SAVE PERSONAL PROFILE ====================
	function savePersonalProfile() {
		console.log("Saving personal profile...");
		if (!validatePersonalForm()) {
			return false;
		}
		const inputs = getPersonalInputs();
		const avatar = document.querySelector(".ui-w-80");

		// Prepare new data using keys matching the DB
		const newPersonalData = {
			fullName: inputs.fullName?.value.trim() || "",
			birthday: convertToMMDDYYYY(inputs.birthday?.value.trim()) || "",
			phoneNumber: inputs.phoneNumber?.value.trim() || "",
			address: inputs.address?.value.trim() || "",
			//New email always converted to lowercase before saving
			email: inputs.email?.value.trim().toLowerCase() || "",
			university: inputs.university?.value.trim() || "",
			avatar: avatar?.src || DEFAULT_AVATAR,
		};

		// 1. Find user index in DB (list_user)
		const userIndex = allStudents.findIndex((s) => s.email === currentUser.email);

		if (userIndex !== -1) {
			// 2. Update fields in DB (list_user)
			allStudents[userIndex] = {
				...allStudents[userIndex],
				...newPersonalData,
			};

			// 3. Update currentUser variable
			currentUser = { ...allStudents[userIndex] };

			// UPDATE "current_user" KEY IN LOCAL STORAGE (NEW LOGIC)
			localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));

			// 4. Save entire DB to Local Storage
			saveAllStudents();

			console.log("Personal saved:", newPersonalData);
			return true;
		} else {
			showNotification(
				"Error: User not found in database while saving personal info.",
				"error",
			);
			return false;
		}
	}

	// ==================== SAVE PASSWORD ====================
	function savePassword() {
		console.log("Saving password...");

		if (!validatePasswordForm()) {
			return false;
		}

		const inputs = getPasswordInputs();
		const newPassword = inputs.newPassword.value.trim();

		// Find user index in DB
		const userIndex = allStudents.findIndex((s) => s.email === currentUser.email);

		if (userIndex !== -1) {
			// Update "database" - Using 'password' key
			allStudents[userIndex].password = newPassword;
			// Update session variable - Using 'password' key
			currentUser.password = newPassword;

			// UPDATE "current_user" KEY IN LOCAL STORAGE (NEW LOGIC)
			localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));

			// Save entire DB to Local Storage
			saveAllStudents();

			console.log("Password updated for:", currentUser.email);
			showNotification("Password changed successfully!", "success");

			// Clear inputs after success
			inputs.currentPassword.value = "";
			inputs.newPassword.value = "";
			inputs.repeatPassword.value = "";

			Object.values(inputs).forEach(
				(input) => input && input.classList.remove("is-invalid"),
			);

			return true;
		} else {
			showNotification("Error: User not found in database.", "error");
			return false;
		}
	}

	// ==================== VALIDATE PERSONAL FORM ====================
	function validatePersonalForm() {
		let isValid = true;
		let errors = [];
		const inputs = getPersonalInputs();
		const errorFullName = document.getElementById("error-full-name");
		const errorPhone = document.getElementById("error-phone");
		const errorDob = document.getElementById("error-dob");

		// Reset old error status
		Object.values(inputs).forEach(
			(input) => input && input.classList.remove("is-invalid"),
		);

		if (inputs.fullName && inputs.fullName.value.trim() === "") {
			errorFullName.innerHTML = "<p>Please enter full name.</p>";
			inputs.fullName.classList.add("is-invalid");
			isValid = false;
		} else {
			errorFullName.innerHTML = "";
		}

		if (
			inputs.phoneNumber &&
			inputs.phoneNumber.value.trim() !== "" &&
			inputs.phoneNumber.value.trim().length < 10
		) {
			errorPhone.innerHTML = "<p>Phone number must have at least 10 digits.</p>";
			inputs.phoneNumber.classList.add("is-invalid");
			isValid = false;
		} else {
			errorPhone.innerHTML = "";
		}

		if (inputs.birthday && inputs.birthday.value !== "") {
			const dob = new Date(inputs.birthday.value);
			const today = new Date();
			if (dob.getTime() > today.getTime()) {
				errorDob.innerHTML = "<p>Birthday cannot be in the future.</p>";
				inputs.birthday.classList.add("is-invalid");
				isValid = false;
			} else {
				errorDob.innerHTML = "";
			}
		}

		if (!isValid) {
			showNotification("Personal Info Error:\n" + errors.join("\n"), "error");
		}

		return isValid;
	}

	// ==================== VALIDATE PASSWORD FORM ====================
	function validatePasswordForm() {
		let isValid = true;
		let errors = [];
		const inputs = getPasswordInputs();

		Object.values(inputs).forEach(
			(input) => input && input.classList.remove("is-invalid"),
		);

		const currentPass = inputs.currentPassword?.value.trim() || "";
		const newPass = inputs.newPassword?.value.trim() || "";
		const repeatPass = inputs.repeatPassword?.value.trim() || "";
		const errorNewPassword = document.getElementById("error-new-password");
		const errorCurrentPassword = document.getElementById(
			"error-current-password",
		);
		const errorRepeatPassword = document.getElementById("error-repeat-password");

		if (!currentUser) {
			errors.push("Error: User info not found.");
			isValid = false;
			showNotification("Critical Error: No currentUser", "error");
			return false;
		}

		if (currentPass === "") {
			errorCurrentPassword.innerHTML = "<p>Please enter current password.</p>";
			inputs.currentPassword?.classList.add("is-invalid");
			isValid = false;
		} else if (currentPass !== currentUser.password) {
			errorCurrentPassword.innerHTML = "<p>Incorrect current password.</p>";
			inputs.currentPassword?.classList.add("is-invalid");
			isValid = false;
		} else {
			errorCurrentPassword.innerHTML = "";
		}

		if (newPass === "") {
			errorNewPassword.innerHTML = "<p>Please enter new password.</p>";
			inputs.newPassword?.classList.add("is-invalid");
			isValid = false;
		} else if (newPass.length < 6) {
			errorNewPassword.innerHTML =
				"<p>New password must be at least 6 characters long.</p>";
			inputs.newPassword?.classList.add("is-invalid");
			isValid = false;
		} else if (newPass === currentUser.password) {
			errorNewPassword.innerHTML =
				"<p>New password cannot be the same as old password.</p>";
			inputs.newPassword?.classList.add("is-invalid");
			isValid = false;
		} else {
			errorNewPassword.innerHTML = "";
		}

		if (repeatPass === "") {
			errorRepeatPassword.innerHTML = "<p>Please re-enter new password.</p>";
			inputs.repeatPassword?.classList.add("is-invalid");
			isValid = false;
		} else if (newPass !== repeatPass) {
			errorRepeatPassword.innerHTML = "<p>Passwords do not match.</p>";
			inputs.repeatPassword?.classList.add("is-invalid");
			isValid = false;
		} else {
			errorRepeatPassword.innerHTML = "";
		}

		if (!isValid) {
			showNotification("Password Change Error:\n" + errors.join("\n"), "error");
		}
		return isValid;
	}

	// ==================== IMAGE UPLOAD AND RESET ====================
	function handleImageUpload(event) {
		const file = event.target.files[0];
		if (!file) return;
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			showNotification("Only JPG, PNG, or GIF are accepted!", "error");
			return;
		}
		const maxSize = 800 * 1024;
		if (file.size > maxSize) {
			showNotification("Maximum file size is 800KB!", "error");
			return;
		}
		const reader = new FileReader();
		reader.onload = function (e) {
			const avatar = document.querySelector(".ui-w-80");
			if (avatar) {
				avatar.src = e.target.result;
				showNotification("Image uploaded. Click Save to apply.", "info");
			}
		};
		reader.readAsDataURL(file);
	}

	window.resetPhoto = function () {
		const avatar = document.querySelector(".ui-w-80");
		const uploadInput = document.querySelector(".account-settings-fileinput");
		if (avatar) {
			avatar.src = currentUser?.Avatar || DEFAULT_AVATAR; // Using optional chaining
		}
		if (uploadInput) {
			uploadInput.value = "";
		}
		showNotification("Photo reset", "info");
	};

	// ==================== DISPLAY NOTIFICATION ====================
	// (Unchanged)
	function showNotification(message, type = "info") {
		const notification = document.createElement("div");
		const bgColor =
			type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8";
		notification.style.cssText = `
					position: fixed;
					top: 20px;
					right: 20px;
					z-index: 9999;
					min-width: 300px;
					max-width: 400px;
					padding: 15px 20px;
					background: ${bgColor};
					color: white;
					border-radius: 5px;
					box-shadow: 0 4px 12px rgba(0,0,0,0.15);
					font-size: 14px;
					animation: slideIn 0.3s ease-out;
					white-space: pre-line;
			`;
		notification.textContent = message;
		if (!document.querySelector("#notification-style")) {
			const style = document.createElement("style");
			style.id = "notification-style";
			style.textContent = `
							@keyframes slideIn {
									from { transform: translateX(400px); opacity: 0; }
									to { transform: translateX(0); opacity: 1; }
							}
							@keyframes slideOut {
									from { transform: translateX(0); opacity: 1; }
									to { transform: translateX(400px); opacity: 0; }
							}
							.is-invalid {
									border-color: #dc3545 !important;
							}
					`;
			document.head.appendChild(style);
		}
		document.body.appendChild(notification);
		setTimeout(() => {
			notification.style.animation = "slideOut 0.3s ease-out";
			setTimeout(() => notification.remove(), 300);
		}, 3000);
	}

	// ==================== EVENT LISTENERS ====================

	document.addEventListener("DOMContentLoaded", () => {
		window.initializePage = initializePage;

		const uploadInput = document.querySelector(".account-settings-fileinput");
		if (uploadInput) {
			uploadInput.addEventListener("change", handleImageUpload);
		}

		const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
		if (resetPhotoBtn) {
			resetPhotoBtn.addEventListener("click", window.resetPhoto);
		}

		// Start page initialization
		initializePage();
	});

	// ==================== DEBUG FUNCTIONS ====================
	window.setLoggedInUser = function (email) {
		if (allStudents.find((s) => s.email === email)) {
			// NEW LOGIC: If using this function for debugging, must set current_user
			const student = allStudents.find((s) => s.email === email);
			localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(student));
			localStorage.setItem(LOGGED_IN_EMAIL_KEY, email);
			console.log("Changed user to:", email);
			initializePage();
			showNotification("Changed user to: " + email, "success");
		} else {
			console.error("Error: Student not found with email:", email);
			showNotification("Email not found: " + email, "error");
		}
	};

	window.clearAllData = function () {
		localStorage.clear();
		console.log("All localStorage cleared.");
		showNotification("All data reset.", "info");
		setTimeout(() => window.location.reload(), 1000);
	};

	console.log(
		"edit-student-profile-json.js refactored and ready (Using 'current_user').",
	);
