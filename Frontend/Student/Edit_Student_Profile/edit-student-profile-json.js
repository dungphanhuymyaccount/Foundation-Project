// ==================== CẤU HÌNH VÀ BIẾN TOÀN CỤC ====================
const ALL_STUDENTS_STORAGE_KEY = "list_user";
const LOGGED_IN_EMAIL_KEY = "loggedInEmail"; // Vẫn giữ, nhưng ít quan trọng hơn
const CURRENT_USER_STORAGE_KEY = "current_user"; // Key mới được sử dụng
const DEFAULT_AVATAR = "image/OIP.jpg";

let allStudents = [];
let currentUser = null;
let originalData = {}; // Dữ liệu ban đầu để kiểm tra sự thay đổi (ví dụ: thay đổi email)

// ==================== CÁC HÀM XỬ LÝ DỮ LIỆU CHUNG (LOCAL STORAGE) ====================

/**
 * Lấy toàn bộ dữ liệu CSDL từ Local Storage, bao gồm cả list_student.
 * @returns {object} - Đối tượng chứa list_student và list_employer.
 */
const getDatabaseObject = () => {
	const storedData = localStorage.getItem(ALL_STUDENTS_STORAGE_KEY);
	if (storedData) {
		try {
			return JSON.parse(storedData);
		} catch (e) {
			console.error("Lỗi phân tích CSDL Local Storage:", e);
		}
	}
	// Trả về cấu trúc mặc định nếu không có hoặc lỗi
	return { list_student: [], list_employer: [] };
};

/**
 * Khởi tạo CSDL: Đọc mảng sinh viên từ Local Storage.
 * BUG FIX: Đảm bảo email trong CSDL được chuyển sang chữ thường khi tải lần đầu
 */
function initializeDatabase() {
	const db = getDatabaseObject();
	allStudents = db.list_student || [];
	allStudents = allStudents.map((student) => ({
		...student,
		email: student.email ? student.email.toLowerCase() : "",
	}));
	console.log(
		`Đã tải CSDL sinh viên (${allStudents.length} mục) từ Local Storage.`,
	);
}

/**
 * Lưu toàn bộ mảng allStudents vào Local Storage (trong trường list_student).
 */
function saveAllStudents() {
	const db = getDatabaseObject();
	// Cập nhật list_student
	db.list_student = allStudents;
	localStorage.setItem(ALL_STUDENTS_STORAGE_KEY, JSON.stringify(db));
	console.log("Đã lưu toàn bộ CSDL sinh viên vào Local Storage.");
}

/**
 * Tìm student theo Email trong mảng allStudents (để kiểm tra trùng lặp).
 * @param {string} email - Email cần tìm (đã được chuẩn hóa chữ thường)
 * @returns {object|null} - Đối tượng sinh viên nếu tìm thấy, ngược lại là null.
 */
const findStudentByEmail = (email) => {
	// BUG FIX: Đảm bảo email tìm kiếm cũng được chuẩn hóa chữ thường
	const normalizedEmail = email ? email.toLowerCase() : "";
	const student = allStudents.find((s) => s.email === normalizedEmail);
	return student ? { ...student } : null;
};

// ==================== HÀM LẤY CURRENT_USER (LOGIC MỚI) ====================

/**
 * Lấy dữ liệu người dùng hiện tại được lưu trực tiếp dưới key 'current_user'.
 * @returns {object|null} - Đối tượng người dùng nếu tồn tại và phân tích thành công.
 */
function getCurrentUserFromLocalStorage() {
	const storedData = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

	if (storedData) {
		try {
			const userData = JSON.parse(storedData);

			// Xử lý trường hợp dữ liệu được lưu dưới dạng mảng (như trong ảnh chụp)
			const finalUserData = Array.isArray(userData) ? userData[0] : userData;

			if (finalUserData && finalUserData.email) {
				// BUG FIX: Chuẩn hóa email thành chữ thường ngay sau khi đọc
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

// ==================== HÀM CHUYỂN ĐỔI NGÀY THÁNG ====================

/**
 * Chuyển đổi định dạng MM/DD/YYYY (từ CSDL) sang YYYY-MM-DD (cho input type="date")
 * @param {string} dateString - Ngày tháng ở định dạng MM/DD/YYYY
 * @returns {string} - Ngày tháng ở định dạng YYYY-MM-DD
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
 * Chuyển đổi định dạng YYYY-MM-DD (từ input type="date") sang MM/DD/YYYY (cho CSDL)
 * @param {string} dateString - Ngày tháng ở định dạng YYYY-MM-DD
 * @returns {string} - Ngày tháng ở định dạng MM/DD/YYYY
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

// ==================== LẤY FORM INPUTS ====================
// (Giữ nguyên)
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

// ==================== KHỞI TẠO TRANG CHÍNH (LOGIC MỚI) ====================
function initializePage() {
	console.log("Khởi tạo trang...");

	// 1. Khởi tạo CSDL (Đọc list_user - cần thiết cho việc cập nhật và kiểm tra trùng lặp)
	initializeDatabase();

	// 2. LẤY DATA NGƯỜI DÙNG TỪ KEY "current_user" (LOGIC MỚI)
	const studentData = getCurrentUserFromLocalStorage();

	if (studentData) {
		// Dữ liệu đã được chuẩn hóa chữ thường trong getCurrentUserFromLocalStorage()
		currentUser = studentData;
		loadPersonalProfile();

		// Reset form mật khẩu
		const passInputs = getPasswordInputs();
		if (passInputs.currentPassword) passInputs.currentPassword.value = "";
		if (passInputs.newPassword) passInputs.newPassword.value = "";
		if (passInputs.repeatPassword) passInputs.repeatPassword.value = "";

		console.log("User hiện tại (từ current_user):", currentUser);

		// BUG FIX: Cần đảm bảo currentUser này tồn tại trong allStudents để có thể Save
		const foundInDB = findStudentByEmail(currentUser.email);
		if (!foundInDB) {
			// Trường hợp user đang đăng nhập nhưng không có trong list_user, cần xử lý để Save
			// Nếu bạn muốn Save được, bạn phải thêm user này vào allStudents
			allStudents.push(currentUser);
			saveAllStudents();
			console.warn(
				"Cảnh báo: Đã thêm currentUser vào allStudents để đảm bảo chức năng Save.",
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

// ==================== LOAD PERSONAL PROFILE ====================
// (Giữ nguyên)
function loadPersonalProfile() {
	if (!currentUser) {
		console.error("Không có dữ liệu currentUser");
		return;
	}
	console.log("Đang load personal profile...");
	const avatar = document.querySelector(".ui-w-80");
	const inputs = getPersonalInputs();

	// Chuẩn bị dữ liệu cho form (sử dụng key chữ thường thống nhất)
	const personalData = {
		fullName: currentUser.fullName || "",
		// Chuyển đổi MM/DD/YYYY sang YYYY-MM-DD
		birthday: convertToYYYYMMDD(currentUser.birthday) || "",
		phoneNumber: currentUser.phoneNumber || "",
		address: currentUser.address || "",
		email: currentUser.email || "",
		university: currentUser.university || "",
		avatar: currentUser.avatar || DEFAULT_AVATAR,
	};

	// Điền dữ liệu vào form
	if (inputs.fullName) inputs.fullName.value = personalData.fullName;
	if (inputs.birthday) inputs.birthday.value = personalData.birthday;
	if (inputs.phoneNumber) inputs.phoneNumber.value = personalData.phoneNumber;
	if (inputs.address) inputs.address.value = personalData.address;
	if (inputs.email) inputs.email.value = personalData.email;
	if (inputs.university) inputs.university.value = personalData.university;
	if (avatar) avatar.src = personalData.avatar;

	// Lưu bản gốc của dữ liệu (quan trọng để so sánh thay đổi email)
	originalData = { ...personalData };

	// Xóa các thông báo lỗi cũ
	document
		.querySelectorAll(".is-invalid")
		.forEach((el) => el.classList.remove("is-invalid"));

	console.log("Đã load personal profile:", personalData);
	showNotification(
		"Đã load thông tin cá nhân: " + personalData.fullName,
		"success",
	);
}

// ==================== LƯU PROFILE CHUNG ====================
// (Giữ nguyên)
window.saveProfile = function () {
	if (!currentUser) {
		showNotification("Lỗi: Không có người dùng đang đăng nhập.", "error");
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
		console.log("Phát hiện nỗ lực thay đổi mật khẩu...");
		isPasswordSaved = savePassword();
	}

	if (isPersonalSaved) {
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

	return isPersonalSaved && isPasswordSaved;
};

// ==================== LƯU PERSONAL PROFILE ====================
function savePersonalProfile() {
	console.log("Đang lưu personal profile...");
	if (!validatePersonalForm()) {
		return false;
	}
	const inputs = getPersonalInputs();
	const avatar = document.querySelector(".ui-w-80");

	// Chuẩn bị dữ liệu mới, sử dụng key giống trong CSDL
	const newPersonalData = {
		fullName: inputs.fullName?.value.trim() || "",
		birthday: convertToMMDDYYYY(inputs.birthday?.value.trim()) || "",
		phoneNumber: inputs.phoneNumber?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
		// BUG FIX: Email mới luôn được chuyển về chữ thường trước khi lưu
		email: inputs.email?.value.trim().toLowerCase() || "",
		university: inputs.university?.value.trim() || "",
		avatar: avatar?.src || DEFAULT_AVATAR,
	};

	// 1. Tìm index của người dùng trong CSDL (list_user)
	const userIndex = allStudents.findIndex((s) => s.email === currentUser.email);

	if (userIndex !== -1) {
		// 2. Cập nhật các trường trong CSDL (list_user)
		allStudents[userIndex] = {
			...allStudents[userIndex],
			...newPersonalData,
		};

		// 3. Cập nhật biến currentUser
		currentUser = { ...allStudents[userIndex] };

		// CẬP NHẬT KEY "current_user" TRONG LOCAL STORAGE (LOGIC MỚI)
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));

		// 4. Lưu toàn bộ CSDL vào Local Storage
		saveAllStudents();

		// 5. Cập nhật lại email đăng nhập nếu email bị thay đổi
		if (originalData.email !== newPersonalData.email) {
			// Email mới (đã là chữ thường) được lưu vào LOGGED_IN_EMAIL_KEY
			localStorage.setItem(LOGGED_IN_EMAIL_KEY, newPersonalData.email);
			showNotification(
				`Email đã thay đổi từ ${originalData.email} sang ${newPersonalData.email}. Trang sẽ tải lại.`,
				"info",
			);
			// Tải lại trang sau 500ms để áp dụng email mới
			setTimeout(initializePage, 500);
		}

		console.log("Đã lưu personal:", newPersonalData);
		return true;
	} else {
		showNotification(
			"Lỗi: Không tìm thấy người dùng trong CSDL để cập nhật. Hãy kiểm tra key 'current_user' có trong list_user không.",
			"error",
		);
		return false;
	}
}

// ==================== LƯU PASSWORD ====================
function savePassword() {
	console.log("Đang lưu mật khẩu...");

	if (!validatePasswordForm()) {
		return false;
	}

	const inputs = getPasswordInputs();
	const newPassword = inputs.newPassword.value.trim();

	// Tìm index của người dùng trong CSDL
	const userIndex = allStudents.findIndex((s) => s.email === currentUser.email);

	if (userIndex !== -1) {
		// Cập nhật "database" - Dùng key 'password'
		allStudents[userIndex].password = newPassword;
		// Cập nhật biến session - Dùng key 'password'
		currentUser.password = newPassword;

		// CẬP NHẬT KEY "current_user" TRONG LOCAL STORAGE (LOGIC MỚI)
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));

		// Lưu toàn bộ CSDL vào Local Storage
		saveAllStudents();

		console.log("Đã cập nhật mật khẩu cho:", currentUser.email);
		showNotification("Đổi mật khẩu thành công!", "success");

		// Xóa input sau khi thành công
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

// ==================== VALIDATE PERSONAL FORM ====================
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

	if (inputs.fullName && inputs.fullName.value.trim() === "") {
		errorFullName.innerHTML = "<p>Vui lòng nhập họ và tên.</p>";
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
		errorPhone.innerHTML = "<p>Số điện thoại phải có ít nhất 10 chữ số.</p>";
		inputs.phoneNumber.classList.add("is-invalid");
		isValid = false;
	} else {
		errorPhone.innerHTML = "";
	}

	if (inputs.birthday && inputs.birthday.value !== "") {
		const dob = new Date(inputs.birthday.value);
		const today = new Date();
		if (dob.getTime() > today.getTime()) {
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

// ==================== VALIDATE PASSWORD FORM ====================
// (Giữ nguyên)
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

// ==================== UPLOAD VÀ RESET ẢNH ====================
// (Giữ nguyên)
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

// ==================== HIỂN THỊ THÔNG BÁO ====================
// (Giữ nguyên)
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

	// Bắt đầu khởi tạo trang
	initializePage();
});

// ==================== DEBUG FUNCTIONS ====================
window.setLoggedInUser = function (email) {
	if (allStudents.find((s) => s.email === email)) {
		// LOGIC MỚI: Nếu bạn dùng hàm này để debug, bạn phải set current_user
		const student = allStudents.find((s) => s.email === email);
		localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(student));
		localStorage.setItem(LOGGED_IN_EMAIL_KEY, email); // Vẫn set loggedInEmail cho đồng bộ
		console.log("Đã đổi user thành:", email);
		initializePage();
		showNotification("Đã đổi user thành: " + email, "success");
	} else {
		console.error("Lỗi: Không tìm thấy student với email:", email);
		showNotification("Không tìm thấy email: " + email, "error");
	}
};

window.clearAllData = function () {
	localStorage.clear();
	console.log("Đã xóa tất cả localStorage.");
	showNotification("Đã reset tất cả dữ liệu.", "info");
	setTimeout(() => window.location.reload(), 1000);
};

console.log(
	"edit-student-profile-json.js đã được refactor và sẵn sàng (Sử dụng 'current_user').",
);
