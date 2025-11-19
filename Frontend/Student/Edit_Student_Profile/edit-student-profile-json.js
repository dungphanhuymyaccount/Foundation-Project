// ==================== DỮ LIỆU NGƯỜI DÙNG (GIẢ LẬP CSDL) ====================
const STUDENTS_DATA = [
	{
		Email: "vantuan@gmail.com",
		Password: "tuan1234",
		StudentName: "Nguyễn Văn Tuấn",
		Birthday: "10/20/2002", // MM/DD/YYYY
		"Phone Number": "0987654321",
		Address: "123 Đường Cầu Giấy, Hà Nội",
		University: "Đại học FPT",
		Avatar: "images/student1.jpg",
	},
	{
		Email: "minhanh@gmail.com",
		Password: "anh5678",
		StudentName: "Trần Thị Minh Anh",
		Birthday: "05/15/2001", // MM/DD/YYYY
		"Phone Number": "0123456789",
		Address: "456 Đường Lê Lợi, TP. HCM",
		University: "Đại học RMIT",
		Avatar: "images/student2.jpg",
	},
];

// ==================== BIẾN TOÀN CỤC ====================
let currentUser = null; // Sẽ chứa thông tin user (gồm cả Password)
let currentStudent = null; // Sẽ chứa thông tin student
let originalData = {}; // Chứa cả Personal Info

// ==================== HÀM CHUYỂN ĐỔI NGÀY THÁNG (FIX LỖI FORMAT) ====================
function convertToDDMMYYY(ddmmyyyy) {
	if (!ddmmyyyy) return "";
	// Dữ liệu gốc là MM/DD/YYYY, chuyển sang YYYY-MM-DD
	const parts = ddmmyyyy.split("/");
	if (parts.length === 3) {
		const [month, day, year] = parts;
		// Đảm bảo month và day có 2 chữ số
		const formattedMonth = month.padStart(2, "0");
		const formattedDay = day.padStart(2, "0");
		return `${year}-${formattedMonth}-${formattedDay}`;
	}
	return ddmmyyyy;
}

// ==================== TÌM STUDENT THEO EMAIL ====================
function findStudentByEmail(email) {
	console.log("Tìm kiếm student cho email:", email);
	// Tìm thẳng trong STUDENTS_DATA
	const student = STUDENTS_DATA.find((s) => s.Email === email);

	if (!student) {
		console.log("Không tìm thấy student");
		return null;
	}

	console.log("Tìm thấy:", student.StudentName);
	// Trả về đối tượng tương thích
	return { user: { ...student }, student: student };
}

// ==================== LẤY FORM INPUTS (PERSONAL / GENERAL) ====================
function getPersonalInputs() {
	const generalSection = document.querySelector("#account-general");
	if (!generalSection) {
		console.error("Không tìm thấy #account-general");
		return {};
	}
	// Lấy tất cả input trong tab General
	const allInputs = generalSection.querySelectorAll(
		'.card-body input:not([type="file"])',
	);

	if (allInputs.length < 6) {
		console.error("Cấu trúc HTML không khớp, không đủ 6 input.");
		return {};
	}

	return {
		fullName: allInputs[0], // 1. Full Name
		dob: allInputs[1], // 2. Birthday
		phone: allInputs[2], // 3. Phonenumber
		address: allInputs[3], // 4. Personal Address
		email: allInputs[4], // 5. E-mail
		university: allInputs[5], // 6. University
	};
}

// ==================== LẤY FORM INPUTS (PASSWORD) ====================
function getPasswordInputs() {
	const passwordSection = document.querySelector("#account-change-password");
	if (!passwordSection) {
		console.error("Không tìm thấy #account-change-password");
		return {};
	}
	// Lấy theo thứ tự: Current (0), New (1), Repeat (2)
	const allInputs = passwordSection.querySelectorAll(
		".card-body input[type='password']",
	);
	return {
		currentPassword: allInputs[0],
		newPassword: allInputs[1],
		repeatPassword: allInputs[2],
	};
}

// ==================== KHỞI TẠO TRANG ====================
function initializePage() {
	console.log("Khởi tạo trang...");
	let loggedInEmail = localStorage.getItem("loggedInEmail");

	if (!loggedInEmail) {
		// Dùng email student mặc định
		loggedInEmail = "vantuan@gmail.com";
		localStorage.setItem("loggedInEmail", loggedInEmail);
		console.log("Sử dụng email mặc định:", loggedInEmail);
	} else {
		console.log("Email đã đăng nhập:", loggedInEmail);
	}

	const result = findStudentByEmail(loggedInEmail);

	if (result) {
		currentUser = result.user; // Chứa cả password
		currentStudent = result.student; // Chứa info

		loadPersonalProfile(); // Tải Personal Info

		console.log("User (chứa pass):", currentUser);
		console.log("Student (chứa info):", currentStudent);
	} else {
		showNotification(
			"Không tìm thấy thông tin student cho email: " + loggedInEmail,
			"error",
		);
		console.log(
			'Tip: Dùng setLoggedInUser("vantuan@gmail.com") trong Console để đổi user',
		);
	}
}

// ==================== LOAD PERSONAL PROFILE ====================
function loadPersonalProfile() {
	if (!currentStudent) {
		console.error("Không có dữ liệu student");
		return;
	}
	console.log("Đang load personal profile...");
	const profileImage = document.querySelector(".ui-w-80");
	const inputs = getPersonalInputs();

	// Kiểm tra local edits
	const localPersonalData = localStorage.getItem(
		"studentPersonalProfile_" + currentUser.Email,
	);

	const personalData = localPersonalData
		? JSON.parse(localPersonalData)
		: {
				fullName: currentStudent.StudentName || "",
				dob: convertToDDMMYYY(currentStudent.Birthday) || "", // Fix format date
				phone: currentStudent["Phone Number"] || "",
				address: currentStudent.Address || "",
				email: currentStudent.Email || "",
				university: currentStudent.University || "", // Thêm University
				profileImage: currentStudent.Avatar || "image/OIP.jpg",
		  };

	// Điền dữ liệu vào form
	if (inputs.fullName) inputs.fullName.value = personalData.fullName;
	if (inputs.dob) inputs.dob.value = personalData.dob;
	if (inputs.phone) inputs.phone.value = personalData.phone;
	if (inputs.address) inputs.address.value = personalData.address;
	if (inputs.email) inputs.email.value = personalData.email;
	if (inputs.university) inputs.university.value = personalData.university; // Thêm University
	if (profileImage) profileImage.src = personalData.profileImage;

	// Lưu bản sao vào originalData
	originalData = { ...originalData, ...personalData };

	// Xóa các viền đỏ (nếu có)
	document
		.querySelectorAll(".is-invalid")
		.forEach((el) => el.classList.remove("is-invalid"));

	console.log("Đã load personal profile:", personalData);
	showNotification(
		"Đã load thông tin cá nhân: " + personalData.fullName,
		"success",
	);
}

// ==================== LƯU PROFILE CHUNG (CẬP NHẬT) ====================
function saveProfile() {
	console.log("Đang lưu tất cả thay đổi...");

	// 1. Luôn lưu Personal
	const isPersonalSaved = savePersonalProfile();

	// 2. Kiểm tra xem có cần lưu mật khẩu không
	const passInputs = getPasswordInputs();
	const isPasswordChangeAttempted =
		passInputs.currentPassword.value.trim() !== "" ||
		passInputs.newPassword.value.trim() !== "" ||
		passInputs.repeatPassword.value.trim() !== "";

	let isPasswordSaved = true; // Mặc định là true nếu không cố gắng đổi

	if (isPasswordChangeAttempted) {
		console.log("Phát hiện nỗ lực thay đổi mật khẩu...");
		isPasswordSaved = savePassword(); // Hàm này sẽ tự validate và thông báo
	}

	// 3. Thông báo tổng
	if (isPersonalSaved && isPasswordSaved) {
		if (isPasswordChangeAttempted) {
			// savePassword() đã thông báo
		} else {
			// Chỉ lưu thông tin chung
			showNotification("Lưu thông tin cá nhân thành công!", "success");
		}
	} else if (isPersonalSaved && !isPasswordSaved) {
		showNotification(
			"Lưu thông tin cá nhân thành công! (Đổi mật khẩu thất bại)",
			"info",
		);
	}
	// Nếu isPersonalSaved = false, hàm validatePersonalForm đã báo lỗi

	return isPersonalSaved && isPasswordSaved;
}

// ==================== LƯU PERSONAL PROFILE ====================
function savePersonalProfile() {
	console.log("Đang lưu personal profile...");
	if (!validatePersonalForm()) {
		return false;
	}
	const inputs = getPersonalInputs();
	const profileImage = document.querySelector(".ui-w-80");

	const personalData = {
		fullName: inputs.fullName?.value.trim() || "",
		dob: inputs.dob?.value.trim() || "",
		phone: inputs.phone?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
		email: inputs.email?.value.trim() || "",
		university: inputs.university?.value.trim() || "", // Thêm University
		profileImage: profileImage?.src || "image/OIP.jpg",
	};

	// Lưu vào localStorage
	localStorage.setItem(
		"studentPersonalProfile_" + currentUser.Email,
		JSON.stringify(personalData),
	);

	// Cập nhật originalData
	originalData = { ...originalData, ...personalData };

	console.log("Đã lưu personal:", personalData);
	return true;
}

// ==================== LƯU PASSWORD ====================
function savePassword() {
	console.log("Đang lưu mật khẩu...");

	if (!validatePasswordForm()) {
		return false; // Dừng lại nếu validation thất bại
	}

	const inputs = getPasswordInputs();
	const newPassword = inputs.newPassword.value.trim();

	// Cập nhật STUDENTS_DATA
	const userInData = STUDENTS_DATA.find((s) => s.Email === currentUser.Email);

	if (userInData) {
		// Cập nhật "database"
		userInData.Password = newPassword;
		// Cập nhật biến session
		currentUser.Password = newPassword;

		console.log("Đã cập nhật mật khẩu cho:", currentUser.Email);
		showNotification("Đổi mật khẩu thành công!", "success");

		// Xóa trắng các ô input
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

	// Xóa lỗi cũ
	Object.values(inputs).forEach(
		(input) => input && input.classList.remove("is-invalid"),
	);

	// Validate Full Name
	if (inputs.fullName && inputs.fullName.value.trim() === "") {
		errors.push("Vui lòng nhập tên đầy đủ");
		inputs.fullName.classList.add("is-invalid");
		isValid = false;
	}

	// Validate Email
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (inputs.email && inputs.email.value.trim() === "") {
		errors.push("Vui lòng nhập email");
		inputs.email.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.email && !emailPattern.test(inputs.email.value.trim())) {
		errors.push("Email không hợp lệ");
		inputs.email.classList.add("is-invalid");
		isValid = false;
	}

	// Validate Phone
	if (
		inputs.phone &&
		inputs.phone.value.trim() !== "" &&
		inputs.phone.value.trim().length < 10
	) {
		errors.push("Số điện thoại phải có ít nhất 10 chữ số");
		inputs.phone.classList.add("is-invalid");
		isValid = false;
	}

	// Validate DoB
	if (inputs.dob && inputs.dob.value !== "") {
		const dob = new Date(inputs.dob.value);
		const today = new Date();
		if (dob > today) {
			errors.push("Ngày sinh không thể ở tương lai");
			inputs.dob.classList.add("is-invalid");
			isValid = false;
		}
	}

	// Validate University
	if (inputs.university && inputs.university.value.trim() === "") {
		errors.push("Vui lòng nhập trường đại học");
		inputs.university.classList.add("is-invalid");
		isValid = false;
	}

	if (!isValid) {
		showNotification("Lỗi Thông Tin Cá Nhân:\n" + errors.join("\n"), "error");
	}

	return isValid;
}

// ==================== VALIDATE PASSWORD FORM ====================
function validatePasswordForm() {
	let isValid = true;
	let errors = [];
	const inputs = getPasswordInputs();

	// Xóa các lỗi cũ
	Object.values(inputs).forEach(
		(input) => input && input.classList.remove("is-invalid"),
	);

	const currentPass = inputs.currentPassword.value.trim();
	const newPass = inputs.newPassword.value.trim();
	const repeatPass = inputs.repeatPassword.value.trim();

	if (!currentUser) {
		errors.push("Lỗi: Không tìm thấy thông tin người dùng.");
		isValid = false;
		showNotification("Lỗi nghiêm trọng: Không có currentUser", "error");
		return false;
	}

	// Check password từ currentUser
	if (currentPass === "") {
		errors.push("Vui lòng nhập mật khẩu hiện tại.");
		inputs.currentPassword.classList.add("is-invalid");
		isValid = false;
	} else if (currentPass !== currentUser.Password) {
		errors.push("Mật khẩu hiện tại không đúng.");
		inputs.currentPassword.classList.add("is-invalid");
		isValid = false;
	}

	if (newPass === "") {
		errors.push("Vui lòng nhập mật khẩu mới.");
		inputs.newPassword.classList.add("is-invalid");
		isValid = false;
	} else if (newPass.length < 6) {
		errors.push("Mật khẩu mới phải có ít nhất 6 ký tự.");
		inputs.newPassword.classList.add("is-invalid");
		isValid = false;
	} else if (newPass === currentPass) {
		errors.push("Mật khẩu mới phải khác mật khẩu cũ.");
		inputs.newPassword.classList.add("is-invalid");
		isValid = false;
	}

	if (repeatPass === "") {
		errors.push("Vui lòng nhập lại mật khẩu mới.");
		inputs.repeatPassword.classList.add("is-invalid");
		isValid = false;
	} else if (newPass !== repeatPass) {
		errors.push("Mật khẩu lặp lại không khớp.");
		inputs.repeatPassword.classList.add("is-invalid");
		isValid = false;
	}

	if (!isValid) {
		showNotification("Lỗi Đổi Mật Khẩu:\n" + errors.join("\n"), "error");
	}
	return isValid;
}

// ==================== UPLOAD ẢNH ====================
function handleImageUpload(event) {
	const file = event.target.files[0];
	if (!file) return;
	console.log("Upload ảnh:", file.name, file.size + " bytes");
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
		const profileImage = document.querySelector(".ui-w-80");
		if (profileImage) {
			profileImage.src = e.target.result;
			console.log("Đã load ảnh");
			showNotification("Đã tải ảnh lên. Nhấn Save để lưu.", "info");
		}
	};
	reader.readAsDataURL(file);
}

// ==================== RESET ẢNH ====================
function resetPhoto() {
	const profileImage = document.querySelector(".ui-w-80");
	const uploadInput = document.querySelector(".account-settings-fileinput");
	if (profileImage) {
		profileImage.src = originalData.profileImage || "image/OIP.jpg";
	}
	if (uploadInput) {
		uploadInput.value = "";
	}
	console.log("Reset ảnh");
	showNotification("Đã reset ảnh", "info");
}

// ==================== HIỂN THỊ THÔNG BÁO ====================
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
// Gán sự kiện (File HTML không tự gán các sự kiện này)

// 1. Gán sự kiện Upload ảnh
const uploadInput = document.querySelector(".account-settings-fileinput");
if (uploadInput) {
	uploadInput.addEventListener("change", handleImageUpload);
}

// 2. Gán sự kiện Reset ảnh
const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
if (resetPhotoBtn) {
	resetPhotoBtn.addEventListener("click", resetPhoto);
}

// (LƯU Ý: Nút Save và Cancel đã được gán 'onclick' trực tiếp trong HTML,
// nên chúng ta không cần gán lại ở đây)

console.log("edit-student-profile-json.js đã được load và sẵn sàng.");

// ==================== DEBUG FUNCTIONS ====================
// Thêm hàm debug vào window để có thể gọi từ Console
window.setLoggedInUser = function (email) {
	if (STUDENTS_DATA.find((s) => s.Email === email)) {
		localStorage.setItem("loggedInEmail", email);
		console.log("Đã đổi user thành:", email);
		initializePage(); // Tải lại trang với user mới
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
	// Tải lại trang với email mặc định
	setTimeout(() => window.location.reload(), 1000);
};
