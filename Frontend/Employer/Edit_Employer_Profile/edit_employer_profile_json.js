// ==================== CONFIGURATION AND GLOBAL VARIABLES====================
// Main key for general database (list_user)
const ALL_USERS_STORAGE_KEY = "list_user";
// Logged-in user key (used for fallback logic)
const LOGGED_IN_EMAIL_KEY = "loggedInEmail";
// Key to store current user object (primary data source)
const CURRENT_USER_STORAGE_KEY = "current_user";
const DEFAULT_AVATAR = "image/OIP.jpg";

let allEmployers = [];
let currentUser = null;
let originalData = {};

// ==================== COMMON DATA HANDLING FUNCTIONS (LOCAL STORAGE) ====================


//Get entire database object (list_user) from Local Storage.

const getDatabaseObject = () => {
	const storedData = localStorage.getItem(ALL_USERS_STORAGE_KEY);
	if (storedData) {
		try {
			return JSON.parse(storedData);
		} catch (e) {
			console.error("Error parsing Local Storage DB:", e);
		}
	}
	return { list_student: [], list_employer: [] };
};

//Initialize Database: Read employer array from Local Storage and normalize emails.

function initializeDatabase() {
	const db = getDatabaseObject();
	allEmployers = db.list_employer || [];

	// Normalize email to lowercase
	allEmployers = allEmployers.map((employer) => ({
		...employer,
		email: employer.email ? employer.email.toLowerCase() : "",
	}));
	console.log(
		`Loaded Employer DB (${allEmployers.length} items) from Local Storage.`,
	);
}


//Save the entire allEmployers array back to the list_user key.

function saveAllEmployers() {
	const db = getDatabaseObject();
	db.list_employer = allEmployers;
	localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(db));
	console.log("Saved entire Employer DB to Local Storage.");
}


//Find employer by Email in the allEmployers array (to check for duplicates).

function findEmployerByEmail(email) {
	// Ensure the search email is also normalized to lowercase
	const normalizedEmail = email ? email.toLowerCase() : "";
	const employer = allEmployers.find((s) => s.email === normalizedEmail);
	return employer ? { ...employer } : null;
}

//Get current user data stored directly under the 'current_user' key.

function getCurrentUserFromLocalStorage() {
	const storedData = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
	if (storedData) {
		try {
			const userData = JSON.parse(storedData);
			const finalUserData = Array.isArray(userData) ? userData[0] : userData;

			if (finalUserData && finalUserData.email) {
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

// ==================== DATE CONVERSION FUNCTIONS (SAME AS STUDENT) ====================
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
	const allInputs = generalSection.querySelectorAll(
		'.card-body input:not([type="file"])',
	);
	return {
		employerName: allInputs[0],
		birthday: allInputs[1],
		phoneNumber: allInputs[2],
		personalAddress: allInputs[3],
		email: allInputs[4],
	};
}

function getCompanyInputs() {
	const companySection = document.querySelector("#account-company");
	if (!companySection) return {};
	return {
		companyName: document.getElementById("companyName"),
		field: document.getElementById("field"),
		size: document.getElementById("size"),
		address: document.getElementById("companyAddress"),
		introduction: document.getElementById("companyIntroduction"),
	};
}

function getPasswordInputs() {
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
}

// ==================== PAGE INITIALIZATION ====================
function initializePage() {
	console.log("Initializing page...");

	//Initialize DB (Read list_user - required for updates and duplicate checks)
	initializeDatabase();

	//GET USER DATA FROM "current_user" KEY (NEW LOGIC)
	const employerData = getCurrentUserFromLocalStorage();

	if (employerData) {
		//Data has been normalized to lowercase in getCurrentUserFromLocalStorage()
		currentUser = employerData;
		loadPersonalProfile();
		loadCompanyProfile();

		//Reset password form
		const passInputs = getPasswordInputs();
		if (passInputs.currentPassword) passInputs.currentPassword.value = "";
		if (passInputs.newPassword) passInputs.newPassword.value = "";
		if (passInputs.repeatPassword) passInputs.repeatPassword.value = "";

		console.log("Current user (from current_user):", currentUser);

		// Ensure this currentUser exists in allEmployers to enable Saving
		const foundInDB = findEmployerByEmail(currentUser.email);
		if (!foundInDB) {
			// Case where user is logged in but not in list_user, add them to allow Saving
			allEmployers.push(currentUser);
			saveAllEmployers();
			console.warn(
				"Warning: You have no right to edit profile. Contact admin!!!.",
			);
		}
	} else {
		// Case where "current_user" key is not found
		showNotification(
			"Logged-in not found. Please log in again.",
			"error",
		);
		localStorage.removeItem(LOGGED_IN_EMAIL_KEY);
		localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
	}
}

// ==================== LOAD PROFILE ====================
function loadPersonalProfile() {
	if (!currentUser) {
		console.error("No currentUser data available");
		return;
	}
	console.log("Loading personal profile...");
	const avatar = document.querySelector(".ui-w-80");
	const inputs = getPersonalInputs();

	const personalData = {
		employerName: currentUser.employerName || "",
		birthday: convertToYYYYMMDD(currentUser.birthday) || "",
		phoneNumber: currentUser.phoneNumber || "",
		personalAddress: currentUser.personalAddress || "",
		email: currentUser.email || "",
		companyName: currentUser.companyName || "",
		avatar: currentUser.avatar || DEFAULT_AVATAR,
	};

	if (inputs.employerName)
		inputs.employerName.value = personalData.employerName;
	if (inputs.birthday) inputs.birthday.value = personalData.birthday;
	if (inputs.phoneNumber) inputs.phoneNumber.value = personalData.phoneNumber;
	if (inputs.personalAddress) inputs.personalAddress.value = personalData.personalAddress;
	if (inputs.email) inputs.email.value = personalData.email;
	if (inputs.companyName) inputs.companyName.value = personalData.companyName;
	if (avatar) avatar.src = personalData.avatar;

	// Save original data (important for comparing email changes)
	originalData = { ...personalData };

	document
		.querySelectorAll(".is-invalid")
		.forEach((el) => el.classList.remove("is-invalid"));

	console.log("Personal profile loaded:", personalData);
	showNotification(
		"Personal info loaded: " + personalData.employerName,
		"success",
	);
}

function loadCompanyProfile() {
	if (!currentUser) return;
	const inputs = getCompanyInputs();

	const companyData = {
		companyName: currentUser.companyName || "",
		field: currentUser.field || "",
		size: currentUser.size || "",
		address: currentUser.address || currentUser.Address || "",
		introduction:
			currentUser.introduction || currentUser.CompanyIntroduction || "",
	};

	if (inputs.companyName) inputs.companyName.value = companyData.companyName;
	if (inputs.field) inputs.field.value = companyData.field;
	if (inputs.size) inputs.size.value = companyData.size;
	if (inputs.address) inputs.address.value = companyData.address;
	if (inputs.introduction) inputs.introduction.value = companyData.introduction;

	originalData = { ...originalData, ...companyData };
}

// ==================== GENERAL SAVE PROFILE ====================
window.saveProfile = function () {
	if (!currentUser) {
		showNotification("Error: No logged-in user found.", "error");
		return false;
	}
	const isPersonalSaved = savePersonalProfile();
	const isCompanySaved = saveCompanyProfile();
	const passInputs = getPasswordInputs();

	const isPasswordChangeAttempted =
		passInputs.currentPassword.value.trim() !== "" ||
		passInputs.newPassword.value.trim() !== "" ||
		passInputs.repeatPassword.value.trim() !== "";
	let isPasswordSaved = true;	
	if (isPasswordChangeAttempted) {
		isPasswordSaved = savePassword();
	}

	if (isPersonalSaved && isCompanySaved) {
		if (isPasswordChangeAttempted) {
			if (isPasswordSaved) {
				//Password changed successfully (notification already handled in savePassword)
			} else {
				showNotification(
					"Personal info saved successfully! (Password change failed)"," warning"
				);
			}
		}
	else {
			showNotification("Personal info and new password saved successfully!", "success");
		}
	}
	return isPersonalSaved && isCompanySaved && isPasswordSaved;
};

// ==================== SAVE PERSONAL PROFILE ====================
function savePersonalProfile() {
	if (!validatePersonalForm())
		{ return false; }
	const inputs = getPersonalInputs();
	const avatar = document.querySelector(".ui-w-80");

	const newPersonalData = {
		employerName: inputs.employerName?.value.trim() || "",
		birthday: convertToMMDDYYYY(inputs.birthday?.value.trim()) || "",
		phoneNumber: inputs.phoneNumber?.value.trim() || "",
		personalAddress: inputs.personalAddress?.value.trim() || "",
		email: inputs.email?.value.trim().toLowerCase() || "",
		avatar: avatar?.src || DEFAULT_AVATAR,
	};
	const userIndex = allEmployers.findIndex(
		(e) => e.Email === currentUser.Email,
	);

	if (userIndex !== -1) {
		allEmployers[userIndex] = {
			...allEmployers[userIndex],
			...newPersonalData,
		};
		currentUser = { ...allEmployers[userIndex] };
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
		saveAllEmployers();
			return true;
		} else {
			showNotification(
				"Error: User not found in database while saving personal info.",
				"error",
			);
			return false;
	}
}

// ==================== SAVE COMPANY PROFILE ====================
function saveCompanyProfile() {
	if (!validateCompanyForm()) return false;
	const inputs = getCompanyInputs();

	const newCompanyData = {
		companyName: inputs.companyName?.value.trim() || "",
		field: inputs.field?.value.trim() || "",
		size: inputs.size?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
		introduction: inputs.introduction?.value.trim() || "",
	};
	const userIndex = allEmployers.findIndex(
		(e) => e.Email === currentUser.Email,
	);

	if (userIndex !== -1) {
		allEmployers[userIndex] = { ...allEmployers[userIndex], ...newCompanyData };
		currentUser = { ...allEmployers[userIndex] };
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
		saveAllEmployers();
		return true;
	} else {
		showNotification(
			"Error: Employer not found in DB to update Company Info.",
			"error",
		);
		return false;
	}
}

// ==================== SAVE PASSWORD ====================
function savePassword() {
	if (!validatePasswordForm()) return false;
	const inputs = getPasswordInputs();
	const newPassword = inputs.newPassword.value.trim();
	const userIndex = allEmployers.findIndex(
		(e) => e.Email === currentUser.Email,
	);

	if (userIndex !== -1) {
		allEmployers[userIndex].password = newPassword;
		currentUser.password = newPassword;
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
		saveAllEmployers();
		showNotification("Password updated successfully!", "success");
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

// ==================== FORM VALIDATION ====================
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

	if (inputs.employerName && inputs.employerName.value.trim() === "") {
		errorFullName.innerHTML = "<p>Please enter full name.</p>";
		inputs.employerName.classList.add("is-invalid");
		errors.push("Full name is required.");
		isValid = false;
	} else {
		errorFullName.innerHTML = "";
	}

	const phoneVal = inputs.phoneNumber ? inputs.phoneNumber.value.trim() : "";

	if (inputs.phoneNumber && inputs.phoneNumber.value.trim() !== "" && phoneVal.length < 10) {
		errorPhone.innerHTML = "<p>Phone number must have at least 10 digits.</p>";
		inputs.phoneNumber.classList.add("is-invalid");
		errors.push("Phone number must have at least 10 digits.");
		isValid = false;
	} else {
		errorPhone.innerHTML = "";
	}

	if (inputs.birthday && inputs.birthday.value !== "") {
		const birthday = new Date(inputs.birthday.value);
		const today = new Date();
		if (birthday.getTime() > today.getTime()) {
			errorDob.innerHTML = "<p>Birthday cannot be in the future.</p>";
			inputs.birthday.classList.add("is-invalid");
			errors.push("Birthday cannot be in the future.");
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

function validateCompanyForm() {
	let isValid = true;
	if (!isValid) {
		showNotification(
			"Company Info error. Please check highlighted fields.",
			"error",
		);
	}
	return isValid;
}

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

// ==================== UI AND EVENT LISTENERS ====================
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

function showNotification(message, type = "info") {
	const notification = document.createElement("div");
	const bgColor =
		type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8";
	notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        min-width: 300px; max-width: 400px; padding: 15px 20px;
        background: ${bgColor}; color: white; border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px;
        animation: slideIn 0.3s ease-out; white-space: pre-line;
    `;
	notification.textContent = message;

	if (!document.querySelector("#notification-style")) {
		const style = document.createElement("style");
		style.id = "notification-style";
		style.textContent = `
            @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
            .is-invalid { border-color: #dc3545 !important; }
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
	// Assign functions to window
	window.initializePage = initializePage;

	const uploadInput = document.querySelector(".account-settings-fileinput");
	if (uploadInput) {
		uploadInput.addEventListener("change", handleImageUpload);
	}

	const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
	if (resetPhotoBtn) {
		resetPhotoBtn.addEventListener("click", resetPhoto);
	}
	initializePage();
});

// ==================== DEBUG FUNCTIONS ====================
window.clearAllData = function () {
	localStorage.clear();
	showNotification("All data reset.", "info");
	setTimeout(() => window.location.reload(), 1000);
};

console.log("edit_employer_profile_json.js is fully synchronized and ready.");
