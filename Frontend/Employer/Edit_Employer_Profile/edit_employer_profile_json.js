// ==================== DỮ LIỆU NGƯỜI DÙNG (GIẢ LẬP CSDL) ====================
const EMPLOYERS_DATA = [
	{
		Email: "tranhoa@gmail.com",
		Password: "tuan1234",
		EmployerName: "Trần Quỳnh Hoa",
		CompanyName: "TechVision Co., Ltd",
		Birthday: "08/15/1985", // MM/DD/YYYY
		Field: "Information Technology",
		Size: "200 employees",
		Address: "12 Tran Duy Hung, Hanoi, Vietnam",
		"Phone Number": "02437778888",
		Avatar: "../image/techvisionlogo.png",
	},
	{
		Email: "ngocbich@gmail.com",
		Password: "minh5678",
		EmployerName: "Nguyễn Thị Ngọc Bích",
		CompanyName: "GreenMart Corporation",
		Birthday: "03/22/1990", // MM/DD/YYYY
		Field: "E-commerce & Retail",
		Size: "500 employees",
		Address: "45 Nguyen Thi Minh Khai, Ho Chi Minh City, Vietnam",
		"Phone Number": "02839256666",
		Avatar: "images/student1.jpg",
	},
	{
		Email: "phamvuong@gmail.com",
		Password: "thao2025",
		EmployerName: "Phạm Nhật Vượng",
		CompanyName: "EduNext Academy",
		Birthday: "04/05/1975",
		Field: "Education & Training",
		Size: "100 employees",
		Address: "27 Le Thanh Tong, Da Nang, Vietnam",
		"Phone Number": "02363888888",
		Avatar: "images/student1.jpg",
	},
	{
		Email: "buituan@gmail.com",
		Password: "quangabc",
		EmployerName: "Bùi Anh Tuấn",
		CompanyName: "FinNova Group",
		Birthday: "11/30/1982",
		Field: "Finance & Banking",
		Size: "350 employees",
		Address: "90 Hai Ba Trung, Hanoi, Vietnam",
		"Phone Number": "02422223333",
		Avatar: "images/student1.jpg",
	},
	{
		Email: "caothang@gmail.com",
		Password: "anhpass",
		EmployerName: "Ông Cao Thắng",
		CompanyName: "Meditech Vietnam",
		Birthday: "06/18/1978",
		Field: "Healthcare & Biotechnology",
		Size: "150 employees",
		Address: "102 Phan Chu Trinh, Ho Chi Minh City, Vietnam",
		"Phone Number": "02839393399",
		Avatar: "images/student1.jpg",
	},
];

// ==================== BIẾN TOÀN CỤC ====================
let currentUser = null; // Sẽ chứa thông tin user (gồm cả Password)
let currentEmployer = null; // Sẽ chứa thông tin employer
let originalData = {}; // Chứa cả Personal & Company Info

// ==================== HÀM CHUYỂN ĐỔI NGÀY THÁNG (FIX LỖI FORMAT) ====================
function convertToDDMMYYY(ddmmyyyy) {
	if (!ddmmyyyy) return "";
	// Dữ liệu gốc là MM/DD/YYYY, chuyển sang YYYY-MM-DD
	const parts = ddmmyyyy.split("/");
	if (parts.length === 3) {
		// SỬA LỖI 5: Dữ liệu là MM/DD/YYYY nên thứ tự là month, day, year
		const [month, day, year] = parts;
		// Đảm bảo month và day có 2 chữ số
		const formattedMonth = month.padStart(2, "0");
		const formattedDay = day.padStart(2, "0");
		return `${year}-${formattedMonth}-${formattedDay}`;
	}
	return ddmmyyyy;
}

// ==================== TÌM EMPLOYER THEO EMAIL ====================
function findEmployerByEmail(email) {
	console.log("Tìm kiếm employer cho email:", email);
	// SỬA LỖI 1 & 3: Tìm thẳng trong EMPLOYERS_DATA
	const employer = EMPLOYERS_DATA.find((e) => e.Email === email);

	if (!employer) {
		console.log("Không tìm thấy employer");
		return null;
	}

	console.log("Tìm thấy:", employer.EmployerName);
	// Trả về đối tượng tương thích với code cũ
	return { user: { ...employer }, employer: employer };
}

// ==================== LẤY FORM INPUTS (PERSONAL / GENERAL) ====================
function getPersonalInputs() {
	const generalSection = document.querySelector("#account-general");
	if (!generalSection) {
		console.error("Không tìm thấy #account-general");
		return {};
	}
	// Full Name (0), DoB (1), Phonenumber (2), Personal Address (3), E-mail (4)
	const allInputs = generalSection.querySelectorAll(
		'.card-body input:not([type="file"])',
	);
	return {
		fullName: allInputs[0], // 1. Full Name
		dob: allInputs[1], // 2. Birthday
		phone: allInputs[2], // 3. Phonenumber
		address: allInputs[3], // 4. Personal Address
		email: allInputs[4], // 5. E-mail
	};
}

// ==================== LẤY FORM INPUTS (COMPANY) ====================
function getCompanyInputs() {
	const companySection = document.querySelector("#account-company");
	if (!companySection) {
		console.error("Không tìm thấy #account-company.");
		return {};
	}
	// Code này đúng, vì HTML đã được sửa để khớp
	// Company Name (0), Field (1), Size (2)
	const allInputs = companySection.querySelectorAll(
		'.card-body input:not([type="file"]), .card-body select',
	);
	return {
		companyName: allInputs[0],
		field: allInputs[1],
		size: allInputs[2],
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
		// SỬA LỖI 4: Dùng email có tồn tại trong EMPLOYERS_DATA
		loggedInEmail = "tranhoa@gmail.com";
		localStorage.setItem("loggedInEmail", loggedInEmail);
		console.log("Sử dụng email mặc định:", loggedInEmail);
	} else {
		console.log("Email đã đăng nhập:", loggedInEmail);
	}

	const result = findEmployerByEmail(loggedInEmail);

	if (result) {
		currentUser = result.user; // Chứa cả password
		currentEmployer = result.employer; // Chứa info

		loadPersonalProfile(); // Tải Personal Info
		loadCompanyProfile(); // Tải Company Info

		console.log("User (chứa pass):", currentUser);
		console.log("Employer (chứa info):", currentEmployer);
	} else {
		showNotification(
			"Không tìm thấy thông tin employer cho email: " + loggedInEmail,
			"error",
		);
	}
}

// ==================== LOAD PERSONAL PROFILE ====================
function loadPersonalProfile() {
	if (!currentEmployer) {
		console.error("Không có dữ liệu employer");
		return;
	}
	console.log("Đang load personal profile...");
	const profileImage = document.querySelector(".ui-w-80");
	const inputs = getPersonalInputs();

	const localPersonalData = localStorage.getItem(
		"employerPersonalProfile_" + currentUser.Email,
	);

	const personalData = localPersonalData
		? JSON.parse(localPersonalData)
		: {
				fullName: currentEmployer.EmployerName || "",
				dob: convertToDDMMYYY(currentEmployer.Birthday) || "", // <-- Đã sửa hàm convert
				phone: currentEmployer["Phone Number"] || "",
				address: currentEmployer.Address || "",
				email: currentEmployer.Email || "", // Lấy email từ currentEmployer
				profileImage: currentEmployer.Avatar || "image/OIP.jpg",
		  };

	// Điền dữ liệu vào form
	if (inputs.fullName) inputs.fullName.value = personalData.fullName;
	if (inputs.dob) inputs.dob.value = personalData.dob;
	if (inputs.phone) inputs.phone.value = personalData.phone;
	if (inputs.address) inputs.address.value = personalData.address;
	if (inputs.email) inputs.email.value = personalData.email;
	if (profileImage) profileImage.src = personalData.profileImage;

	// Lưu bản sao vào originalData
	originalData = { ...originalData, ...personalData };

	console.log("Đã load personal profile:", personalData);
	showNotification(
		"Đã load thông tin cá nhân: " + personalData.fullName,
		"success",
	);
}

// ==================== LOAD COMPANY PROFILE ====================
function loadCompanyProfile() {
	if (!currentEmployer) {
		console.error("Không có dữ liệu employer");
		return;
	}
	console.log("Đang load company profile...");
	const inputs = getCompanyInputs(); // Sẽ chạy đúng vì HTML đã khớp

	const localCompanyData = localStorage.getItem(
		"employerCompanyProfile_" + currentUser.Email,
	);
	const companyData = localCompanyData
		? JSON.parse(localCompanyData)
		: {
				companyName: currentEmployer.CompanyName || "",
				field: currentEmployer.Field || "",
				size: currentEmployer.Size || "",
		  };

	// Điền dữ liệu vào form Company
	if (inputs.companyName) inputs.companyName.value = companyData.companyName;
	if (inputs.field) inputs.field.value = companyData.field;
	if (inputs.size) inputs.size.value = companyData.size;

	// Lưu bản sao vào originalData
	originalData = { ...originalData, ...companyData };
	console.log("Đã load company profile:", companyData);
}

// ==================== LƯU PROFILE CHUNG (CẬP NHẬT) ====================
function saveProfile() {
	console.log("Đang lưu tất cả thay đổi...");

	// 1. Luôn lưu Personal & Company
	const isPersonalSaved = savePersonalProfile();
	const isCompanySaved = saveCompanyProfile();

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
	if (isPersonalSaved && isCompanySaved && isPasswordSaved) {
		if (!isPasswordChangeAttempted) {
			showNotification(
				"Lưu **Thông tin chung & Công ty** thành công!",
				"success",
			);
		}
		// Nếu đổi cả mật khẩu, hàm savePassword() đã tự thông báo rồi.
	} else if (isPersonalSaved && isCompanySaved && !isPasswordSaved) {
		showNotification(
			"Lưu Thông tin chung & Công ty thành công! (Đổi mật khẩu thất bại)",
			"info",
		);
	}
	return isPersonalSaved && isCompanySaved && isPasswordSaved;
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
		profileImage: profileImage?.src || "image/OIP.jpg",
	};
	localStorage.setItem(
		"employerPersonalProfile_" + currentUser.Email,
		JSON.stringify(personalData),
	);
	originalData = { ...originalData, ...personalData };
	console.log("Đã lưu personal:", personalData);
	return true;
}

// ==================== LƯU COMPANY PROFILE ====================
function saveCompanyProfile() {
	console.log("Đang lưu company profile...");
	if (!validateCompanyForm()) {
		return false;
	}
	const inputs = getCompanyInputs();
	const companyData = {
		companyName: inputs.companyName?.value.trim() || "",
		field: inputs.field?.value.trim() || "",
		size: inputs.size?.value.trim() || "",
	};
	localStorage.setItem(
		"employerCompanyProfile_" + currentUser.Email,
		JSON.stringify(companyData),
	);
	originalData = { ...originalData, ...companyData };
	console.log("Đã lưu công ty:", companyData);
	return true;
}

// ==================== LƯU PASSWORD ====================
function savePassword() {
	console.log("Đang lưu mật khẩu...");

	if (!validatePasswordForm()) {
		return false;
	}

	const inputs = getPasswordInputs();
	const newPassword = inputs.newPassword.value.trim();

	// SỬA LỖI 1: Cập nhật EMPLOYERS_DATA
	const userInData = EMPLOYERS_DATA.find((u) => u.Email === currentUser.Email);

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

	if (inputs.fullName && inputs.fullName.value.trim() === "") {
		errors.push("Vui lòng nhập tên đầy đủ");
		inputs.fullName.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.fullName) {
		inputs.fullName.classList.remove("is-invalid");
	}

	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (inputs.email && inputs.email.value.trim() === "") {
		errors.push("Vui lòng nhập email");
		inputs.email.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.email && !emailPattern.test(inputs.email.value.trim())) {
		errors.push("Email không hợp lệ");
		inputs.email.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.email) {
		inputs.email.classList.remove("is-invalid");
	}

	if (
		inputs.phone &&
		inputs.phone.value.trim() !== "" &&
		inputs.phone.value.trim().length < 10
	) {
		errors.push("Số điện thoại phải có ít nhất 10 chữ số");
		inputs.phone.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.phone) {
		inputs.phone.classList.remove("is-invalid");
	}

	if (inputs.dob && inputs.dob.value !== "") {
		const dob = new Date(inputs.dob.value);
		const today = new Date();
		const age = today.getFullYear() - dob.getFullYear();
		if (age < 18) {
			errors.push("Phải từ 18 tuổi trở lên");
			inputs.dob.classList.add("is-invalid");
			isValid = false;
		} else {
			inputs.dob.classList.remove("is-invalid");
		}
	}

	if (!isValid) {
		showNotification("Lỗi Personal Info:\n" + errors.join("\n"), "error");
	}
	return isValid;
}

// ==================== VALIDATE COMPANY FORM ====================
function validateCompanyForm() {
	let isValid = true;
	let errors = [];
	const inputs = getCompanyInputs(); // Sẽ chạy đúng

	if (inputs.companyName && inputs.companyName.value.trim() === "") {
		errors.push("Vui lòng nhập Tên Công ty");
		inputs.companyName.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.companyName) {
		inputs.companyName.classList.remove("is-invalid");
	}

	if (inputs.field && inputs.field.value.trim() === "") {
		errors.push("Vui lòng nhập Lĩnh vực hoạt động");
		inputs.field.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.field) {
		inputs.field.classList.remove("is-invalid");
	}

	if (!isValid) {
		showNotification("Lỗi Company Info:\n" + errors.join("\n"), "error");
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

	const currentPass = inputs.currentPassword.value.trim();
	const newPass = inputs.newPassword.value.trim();
	const repeatPass = inputs.repeatPassword.value.trim();

	if (!currentUser) {
		errors.push("Lỗi: Không tìm thấy thông tin người dùng.");
		isValid = false;
		showNotification("Lỗi nghiêm trọng: Không có currentUser", "error");
		return false;
	}

	// SỬA LỖI 1: Check password từ currentUser
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

// ==================== HỦY THAY ĐỔI (CẬP NHẬT) ====================
function cancelChanges() {
	console.log("Hủy thay đổi");

	// Khôi phục Personal Info
	const personalInputs = getPersonalInputs();
	const profileImage = document.querySelector(".ui-w-80");
	if (personalInputs.fullName)
		personalInputs.fullName.value = originalData.fullName || "";
	if (personalInputs.dob) personalInputs.dob.value = originalData.dob || "";
	if (personalInputs.phone)
		personalInputs.phone.value = originalData.phone || "";
	if (personalInputs.address)
		personalInputs.address.value = originalData.address || "";
	if (personalInputs.email)
		personalInputs.email.value = originalData.email || "";
	if (profileImage)
		profileImage.src = originalData.profileImage || "image/OIP.jpg";

	// Khôi phục Company Info
	const companyInputs = getCompanyInputs();
	if (companyInputs.companyName)
		companyInputs.companyName.value = originalData.companyName || "";
	if (companyInputs.field) companyInputs.field.value = originalData.field || "";
	if (companyInputs.size) companyInputs.size.value = originalData.size || "";

	// Khôi phục các trường mật khẩu
	const passInputs = getPasswordInputs();
	if (passInputs.currentPassword) passInputs.currentPassword.value = "";
	if (passInputs.newPassword) passInputs.newPassword.value = "";
	if (passInputs.repeatPassword) passInputs.repeatPassword.value = "";

	document.querySelectorAll(".is-invalid").forEach((el) => {
		el.classList.remove("is-invalid");
	});
	showNotification("Đã hủy thay đổi", "info");
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

// ==================== EVENT LISTENERS (ĐÃ SỬA LỖI) ====================

// VÌ SCRIPT NÀY ĐƯỢC TẢI Ở CUỐI <body>, DOM ĐÃ SẴN SÀNG.
// KHÔNG CẦN DÙNG 'DOMContentLoaded' HAY 'setTimeout' NỮA.
console.log("🎬 Script loaded, DOM is ready. Bắt đầu khởi tạo...");

// 1. Khởi tạo trang
initializePage();

// 2. Gán sự kiện Upload ảnh
const uploadInput = document.querySelector(".account-settings-fileinput");
if (uploadInput) {
	uploadInput.addEventListener("change", handleImageUpload);
}

// 3. Gán sự kiện Reset ảnh
const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
if (resetPhotoBtn) {
	resetPhotoBtn.addEventListener("click", resetPhoto);
}

// 4. Gán sự kiện Cancel changes
// Nút cancel cuối cùng trong .text-right.mt-3
const formCancelBtn = document.querySelector(".text-right .btn-default");
if (formCancelBtn) {
	formCancelBtn.addEventListener("click", cancelChanges);
}

console.log("Hệ thống đã sẵn sàng!");

// ==================== DEBUG FUNCTIONS ====================
// (để trống hoặc thêm các hàm debug nếu cần)
// window.setLoggedInUser = function(email) { ... }
// window.clearAllData = function() { ... }

console.log("Script đã được load");
