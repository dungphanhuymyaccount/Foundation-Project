// ==================== CẤU HÌNH VÀ BIẾN TOÀN CỤC (GIỐNG STUDENT) ====================
// Key chính cho CSDL chung (list_user)
const ALL_USERS_STORAGE_KEY = "list_user";
// Key người dùng đang đăng nhập (dùng cho logic dự phòng)
const LOGGED_IN_EMAIL_KEY = "loggedInEmail";
// Key lưu đối tượng user hiện tại (nguồn dữ liệu chính)
const CURRENT_USER_STORAGE_KEY = "current_user";
const DEFAULT_AVATAR = "image/OIP.jpg";

let allEmployers = [];
let currentUser = null;
let originalData = {};

// ==================== CÁC HÀM XỬ LÝ DỮ LIỆU CHUNG (LOCAL STORAGE) ====================

/**
 * Lấy toàn bộ dữ liệu CSDL (list_user) từ Local Storage.
 */
const getDatabaseObject = () => {
	const storedData = localStorage.getItem(ALL_USERS_STORAGE_KEY);
	if (storedData) {
		try {
			return JSON.parse(storedData);
		} catch (e) {
			console.error("Lỗi phân tích CSDL Local Storage:", e);
		}
	}
	return { list_student: [], list_employer: [] };
};

/**
 * Khởi tạo CSDL: Đọc mảng employer từ Local Storage và chuẩn hóa email.
 */
function initializeDatabase() {
	const db = getDatabaseObject();
	allEmployers = db.list_employer || [];

	// Chuẩn hóa email về chữ thường
	allEmployers = allEmployers.map((employer) => ({
		...employer,
		email: employer.email ? employer.email.toLowerCase() : "",
	}));
	console.log(
		`Đã tải CSDL Employer (${allEmployers.length} mục) từ Local Storage.`,
	);
}

/**
 * Lưu toàn bộ mảng allEmployers trở lại key list_user.
 */
function saveAllEmployers() {
	const db = getDatabaseObject();
	db.list_employer = allEmployers;
	localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(db));
	console.log("Đã lưu toàn bộ CSDL Employer vào Local Storage.");
}

/**
 * Tìm employer theo Email trong mảng allEmployers (để kiểm tra trùng lặp).
 * @param {string} email - Email cần tìm (đã được chuẩn hóa chữ thường)
 * @returns {object|null} - Đối tượng sinh viên nếu tìm thấy, ngược lại là null.
 */
function findEmployerByEmail(email) {
	// BUG FIX: Đảm bảo email tìm kiếm cũng được chuẩn hóa chữ thường
	const normalizedEmail = email ? email.toLowerCase() : "";
	const employer = allEmployers.find((s) => s.email === normalizedEmail);
	return employer ? { ...employer } : null;
}

/**
 * Lấy dữ liệu người dùng hiện tại được lưu trực tiếp dưới key 'current_user'.
 * @returns {object|null} - Đối tượng người dùng nếu tồn tại và phân tích thành công.
 */
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
				`Lỗi phân tích JSON từ key "${CURRENT_USER_STORAGE_KEY}":`,
				e,
			);
			return null;
		}
	}
	console.log(
		`Không tìm thấy dữ liệu dưới key "${CURRENT_USER_STORAGE_KEY}" trong Local Storage.`,
	);
	return null;
}

// ==================== HÀM CHUYỂN ĐỔI NGÀY THÁNG (GIỐNG STUDENT) ====================
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

// ==================== LẤY FORM INPUTS (GIỮ NGUYÊN) ====================
function getPersonalInputs() {
	const generalSection = document.querySelector("#account-general");
	if (!generalSection) return {};
	const allInputs = generalSection.querySelectorAll(
		'.card-body input:not([type="file"])',
	);
	return {
		employerName: allInputs[0],
		birthday: allInputs[1],
		phoneNumber: allInputs[2],
		address: allInputs[3],
		email: allInputs[4],
	};
}

function getCompanyInputs() {
	const companySection = document.querySelector("#account-company");
	if (!companySection) return {};
	// Prefer selecting by id (added in HTML)
	return {
		companyName: document.getElementById('companyName'),
		field: document.getElementById('field'),
		size: document.getElementById('size'),
		address: document.getElementById('companyAddress'),
		introduction: document.getElementById('companyIntroduction')
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

// ==================== KHỞI TẠO TRANG (LOGIC DỰ PHÒNG HOÀN CHỈNH) ====================
function initializePage() {
	console.log("Khởi tạo trang...");

	// 1. Khởi tạo CSDL (Đọc list_user - cần thiết cho việc cập nhật và kiểm tra trùng lặp)
	initializeDatabase();

	// 2. LẤY DATA NGƯỜI DÙNG TỪ KEY "current_user" (LOGIC MỚI)
	const employerData = getCurrentUserFromLocalStorage();

	if (employerData) {
		// Dữ liệu đã được chuẩn hóa chữ thường trong getCurrentUserFromLocalStorage()
		currentUser = employerData;
		loadPersonalProfile();
		loadCompanyProfile();

		// Reset form mật khẩu
		const passInputs = getPasswordInputs();
		if (passInputs.currentPassword) passInputs.currentPassword.value = "";
		if (passInputs.newPassword) passInputs.newPassword.value = "";
		if (passInputs.repeatPassword) passInputs.repeatPassword.value = "";

		console.log("User hiện tại (từ current_user):", currentUser);

		// BUG FIX: Cần đảm bảo currentUser này tồn tại trong allStudents để có thể Save
		const foundInDB = findEmployerByEmail(currentUser.email);
		if (!foundInDB) {
			// Trường hợp user đang đăng nhập nhưng không có trong list_user, cần xử lý để Save
			// Nếu bạn muốn Save được, bạn phải thêm user này vào allStudents
			allEmployers.push(currentUser);
			saveAllEmployers();
			console.warn(
				"Cảnh báo: Đã thêm currentUser vào allEmployers để đảm bảo chức năng Save.",
			);
		}
	} else {
		// Trường hợp không tìm thấy key "current_user"
		showNotification(
			"Không tìm thấy dữ liệu người dùng đang đăng nhập (key 'current_user' trống/lỗi). Vui lòng đăng nhập lại.",
			"error",
		);
		// Xóa loggedInEmail/current_user để tránh lỗi lặp nếu có
		localStorage.removeItem(LOGGED_IN_EMAIL_KEY);
		localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
	}
}

// ==================== LOAD PROFILE ====================
function loadPersonalProfile() {
	if (!currentUser) {
		console.error("Không có dữ liệu currentUser");
		return;
	}
	console.log("Đang load personal profile...");
	const avatar = document.querySelector(".ui-w-80");
	const inputs = getPersonalInputs();

	const personalData = {
		employerName: currentUser.employerName || "", // Key EmployerName
		birthday: convertToYYYYMMDD(currentUser.birthday) || "",
		phoneNumber: currentUser.phoneNumber || "",
		address: currentUser.address || "",
		email: currentUser.email || "", // Key Email
		companyName: currentUser.companyName || "",
		avatar: currentUser.avatar || DEFAULT_AVATAR,
	};

	if (inputs.employerName) inputs.employerName.value = personalData.employerName;
	if (inputs.birthday) inputs.birthday.value = personalData.birthday;
	if (inputs.phoneNumber) inputs.phoneNumber.value = personalData.phoneNumber;
	if (inputs.address) inputs.address.value = personalData.address;
	if (inputs.email) inputs.email.value = personalData.email;
	if (inputs.companyName) inputs.companyName.value = personalData.companyName;
	if (avatar) avatar.src = personalData.avatar;

	// Lưu bản gốc của dữ liệu (quan trọng để so sánh thay đổi email)
	originalData = { ...personalData };

	// Xóa các thông báo lỗi cũ
	document
		.querySelectorAll(".is-invalid")
		.forEach((el) => el.classList.remove("is-invalid"));

	console.log("Đã load personal profile:", personalData);
	showNotification(
		"Đã load thông tin cá nhân: " + personalData.employerName,
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
		introduction: currentUser.introduction || currentUser.CompanyIntroduction || ""
	};

	if (inputs.companyName) inputs.companyName.value = companyData.companyName;
	if (inputs.field) inputs.field.value = companyData.field;
	if (inputs.size) inputs.size.value = companyData.size;
	if (inputs.address) inputs.address.value = companyData.address;
	if (inputs.introduction) inputs.introduction.value = companyData.introduction;

	originalData = { ...originalData, ...companyData };
}

// ==================== LƯU PROFILE CHUNG ====================
window.saveProfile = function () {
	if (!currentUser) {
		showNotification("Lỗi: Không có người dùng đang đăng nhập.", "error");
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

	if (isPersonalSaved || isCompanySaved) {
		if (isPasswordChangeAttempted) {
			if (isPasswordSaved) {
				// Đã đổi mật khẩu thành công (thông báo đã có trong savePassword)
			} else {
				showNotification(
					"Lưu thông tin cá nhân thành công! (Đổi mật khẩu thất bại)",
				);
			}
		} else {
			showNotification("Lưu thông tin cá nhân thành công!", "success");
		}
	}
	return isPersonalSaved && isCompanySaved && isPasswordSaved;
};

// ==================== LƯU PERSONAL PROFILE ====================
function savePersonalProfile() {
	if (!validatePersonalForm()) return false;
	const inputs = getPersonalInputs();
	const avatar = document.querySelector(".ui-w-80");

	const newPersonalData = {
		employerName: inputs.employerName?.value.trim() || "",
		birthday: convertToMMDDYYYY(inputs.birthday?.value.trim()) || "",
		phoneNumber: inputs.phoneNumber?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
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
	}
}

// ==================== LƯU COMPANY PROFILE ====================
function saveCompanyProfile() {
	if (!validateCompanyForm()) return false;
	const inputs = getCompanyInputs();

	const newCompanyData = {
		companyName: inputs.companyName?.value.trim() || "",
		field: inputs.field?.value.trim() || "",
		size: inputs.size?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
		introduction: inputs.introduction?.value.trim() || ""
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
			"Lỗi: Không tìm thấy Employer trong CSDL để cập nhật Company Info.",
			"error",
		);
		return false;
	}
}

// ==================== LƯU PASSWORD ====================
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
		showNotification("Đã cập nhật mật khẩu thành công!", "success");
		inputs.currentPassword.value = "";
		inputs.newPassword.value = "";
		inputs.repeatPassword.value = "";
		Object.values(inputs).forEach(
			(input) => input && input.classList.remove("is-invalid"),
		);
		return true;
	} else {
		showNotification("Lỗi: Không tìm thấy người dùng trong CSDL.", "error");
		return false;
	}
}

// ==================== VALIDATE FORMS (CƠ BẢN) ====================
function validatePersonalForm() {
	let isValid = true;
	let errors = [];
	const inputs = getPersonalInputs();
	const errorFullName = document.getElementById("error-full-name");
	const errorPhone = document.getElementById("error-phone");
	const errorDob = document.getElementById("error-dob");

	// Xóa trạng thái lỗi cũ
	Object.values(inputs).forEach(
		(input) => input && input.classList.remove("is-invalid"),
	);

	if (inputs.employerName && inputs.employerName.value.trim() === "") {
		errorFullName.innerHTML = "<p>Vui lòng nhập họ và tên.</p>";
		inputs.employerName.classList.add("is-invalid");
		isValid = false;
	} else {
		errorFullName.innerHTML = "";
	}

	if (
		inputs.phoneNumber &&
		inputs.phoneNumber.value.trim() !== "" &&
		inputs.phoneNumber.value.trim().length < 10
	) {
		errorPhone.innerHTML = "<p>Số điện thoại phải có ít nhất 10 chữ số.</p>";
		inputs.phoneNumber.classList.add("is-invalid");
		isValid = false;
	} else {
		errorPhone.innerHTML = "";
	}

	if (inputs.birthday && inputs.birthday.value !== "") {
		const birthday = new Date(inputs.birthday.value);
		const today = new Date();
		if (birthday.getTime() > today.getTime()) {
			errorDob.innerHTML = "<p>Ngày sinh không được trong tương lai.</p>";
			inputs.birthday.classList.add("is-invalid");
			isValid = false;
		} else {
			errorDob.innerHTML = "";
		}
	}

	if (!isValid) {
		showNotification("Lỗi Thông Tin Cá Nhân:\n" + errors.join("\n"), "error");
	}

	return isValid;
}

function validateCompanyForm() {
	let isValid = true;
	// *LƯU Ý: THÊM LOGIC VALIDATE THỰC TẾ CỦA BẠN VÀO ĐÂY*
	if (!isValid) {
		showNotification(
			"Lỗi Company Info. Vui lòng kiểm tra các trường đã tô đỏ.",
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
		errors.push("Lỗi: Không tìm thấy thông tin người dùng.");
		isValid = false;
		showNotification("Lỗi nghiêm trọng: Không có currentUser", "error");
		return false;
	}

	if (currentPass === "") {
		errorCurrentPassword.innerHTML = "<p>Vui lòng nhập mật khẩu hiện tại.</p>";
		inputs.currentPassword?.classList.add("is-invalid");
		isValid = false;
	} else if (currentPass !== currentUser.password) {
		errorCurrentPassword.innerHTML = "<p>Mật khẩu hiện tại không đúng.</p>";
		inputs.currentPassword?.classList.add("is-invalid");
		isValid = false;
	} else {
		errorCurrentPassword.innerHTML = "";
	}

	if (newPass === "") {
		errorNewPassword.innerHTML = "<p>Vui lòng nhập mật khẩu mới.</p>";
		inputs.newPassword?.classList.add("is-invalid");
		isValid = false;
	} else if (newPass.length < 6) {
		errorNewPassword.innerHTML = "<p>Mật khẩu mới phải có ít nhất 6 kí tự.</p>";
		inputs.newPassword?.classList.add("is-invalid");
		isValid = false;
	} else if (newPass === currentUser.password) {
		errorNewPassword.innerHTML =
			"<p>Mật khẩu mới không được trùng mật khẩu cũ.</p>";
		inputs.newPassword?.classList.add("is-invalid");
		isValid = false;
	} else {
		errorNewPassword.innerHTML = "";
	}

	if (repeatPass === "") {
		errorRepeatPassword.innerHTML = "<p>Vui lòng nhập lại mật khẩu mới.</p>";
		inputs.repeatPassword?.classList.add("is-invalid");
		isValid = false;
	} else if (newPass !== repeatPass) {
		errorRepeatPassword.innerHTML = "<p>Mật khẩu nhập lại không khớp.</p>";
		inputs.repeatPassword?.classList.add("is-invalid");
		isValid = false;
	} else {
		errorRepeatPassword.innerHTML = "";
	}

	if (!isValid) {
		showNotification("Lỗi Đổi Mật Khẩu:\n" + errors.join("\n"), "error");
	}
	return isValid;
}

// ==================== UI VÀ EVENT LISTENERS ====================
function handleImageUpload(event) {
	const file = event.target.files[0];
	if (!file) return;
	const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
	if (!allowedTypes.includes(file.type)) {
		showNotification("Chỉ chấp nhận JPG, PNG hoặc GIF!", "error");
		return;
	}
	const maxSize = 800 * 1024;
	if (file.size > maxSize) {
		showNotification("Kích thước file tối đa 800KB!", "error");
		return;
	}
	const reader = new FileReader();
	reader.onload = function (e) {
		const avatar = document.querySelector(".ui-w-80");
		if (avatar) {
			avatar.src = e.target.result;
			showNotification("Đã tải ảnh lên. Nhấn Save để lưu.", "info");
		}
	};
	reader.readAsDataURL(file);
}

window.resetPhoto = function () {
	const avatar = document.querySelector(".ui-w-80");
	const uploadInput = document.querySelector(".account-settings-fileinput");
	if (avatar) {
		avatar.src = currentUser?.Avatar || DEFAULT_AVATAR; // Dùng optional chaining
	}
	if (uploadInput) {
		uploadInput.value = "";
	}
	showNotification("Đã reset ảnh", "info");
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

// ==================== EVENT LISTENERS (GIỐNG STUDENT) ====================
document.addEventListener("DOMContentLoaded", () => {
	// Gán các hàm vào window
	window.handleImageUpload = handleImageUpload;
	window.resetPhoto = resetPhoto;
	window.saveProfile = saveProfile;

	initializePage();

	const uploadInput = document.querySelector(".account-settings-fileinput");
	if (uploadInput) {
		uploadInput.addEventListener("change", handleImageUpload);
	}

	const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
	if (resetPhotoBtn) {
		resetPhotoBtn.addEventListener("click", resetPhoto);
	}
});

// ==================== DEBUG FUNCTIONS (GIỮ NGUYÊN) ====================
window.clearAllData = function () {
	localStorage.clear();
	showNotification("Đã reset tất cả dữ liệu.", "info");
	setTimeout(() => window.location.reload(), 1000);
};

console.log(
	"edit_employer_profile_json.js đã được đồng bộ hóa hoàn toàn và sẵn sàng.",
);
