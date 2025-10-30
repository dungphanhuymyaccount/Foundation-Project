// general-account-embedded.js - Version nhúng dữ liệu JSON (hoàn chỉnh cho Personal & Company Info)

// ==================== DỮ LIỆU JSON NHÚNG TRỰC TIẾP ====================
const USERS_DATA = [
	{
		Email: "nguyentuan@gmail.com",
		Password: "tuan1234",
		Role: "Student",
	},
	{
		Email: "tranminh@gmail.com",
		Password: "minh5678",
		Role: "Employer",
	},
	{
		Email: "lethao@gmail.com",
		Password: "thao2025",
		Role: "Admin",
	},
	{
		Email: "phamquang@gmail.com",
		Password: "quangabc",
		Role: "Student",
	},
	{
		Email: "hoanganh@gmail.com",
		Password: "anhpass",
		Role: "Employer",
	},
];

const EMPLOYERS_DATA = [
	{
		EmployerID: "EMP001",
		EmployerName: "Trần Quỳnh Hoa",
		CompanyName: "TechVision Co., Ltd",
		Birthday: "08/15/1985",
		Field: "Information Technology",
		Size: "200 employees",
		Address: "12 Tran Duy Hung, Hanoi, Vietnam",
		"Phone Number": "02437778888",
		Avatar: "../image/techvisionlogo.png",
	},
	{
		EmployerID: "EMP002",
		EmployerName: "Nguyễn Thị Ngọc Bích",
		CompanyName: "GreenMart Corporation",
		Birthday: "03/22/1990", // Sửa lại ngày tháng để khớp với format MM/DD/YYYY
		Field: "E-commerce & Retail",
		Size: "500 employees",
		Address: "45 Nguyen Thi Minh Khai, Ho Chi Minh City, Vietnam",
		"Phone Number": "02839256666",
		Avatar: "images/student1.jpg",
	},
	{
		EmployerID: "EMP003",
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
		EmployerID: "EMP004",
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
		EmployerID: "EMP005",
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

// Mapping Email → CompanyID
const EMAIL_TO_EMPLOYER = {
	"tranminh@gmail.com": "EMP002",
	"hoanganh@gmail.com": "EMP005",
};

// ==================== BIẾN TOÀN CỤC ====================
let currentUser = null;
let currentEmployer = null;
let originalData = {}; // Chứa cả Personal & Company Info

// ==================== HÀM CHUYỂN ĐỔI NGÀY THÁNG (FIX LỖI FORMAT) ====================
function convertToDDMMYYY(ddmmyyyy) {
	if (!ddmmyyyy) return "";
	// Chuyển đổi từ MM/DD/YYYY sang YYYY-MM-DD
	const parts = ddmmyyyy.split("/");
	if (parts.length === 3) {
		const [day, month, year] = parts;
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
	// ... (giữ nguyên code cũ)
	const user = USERS_DATA.find(
		(u) => u.Email === email && u.Role === "Employer",
	);

	if (!user) {
		console.log("Không tìm thấy user hoặc không phải Employer");
		return null;
	}

	const EmployerID = EMAIL_TO_EMPLOYER[email];

	if (!EmployerID) {
		console.log("Email chưa được map với Employer");
		return null;
	}

	const employer = EMPLOYERS_DATA.find((e) => e.EmployerID === EmployerID);

	if (!employer) {
		console.log("Không tìm thấy employer");
		return null;
	}

	console.log("Tìm thấy:", employer.EmployerName);
	return { user, employer };
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
	// Giả định Tab Company Information có ID là #account-company
	const companySection = document.querySelector("#account-company");
	if (!companySection) {
		console.warn("Không tìm thấy #account-company. Bỏ qua Company Inputs.");
		return {};
	}

	// Company Name (0), Field (1), Size (2)
	const allInputs = companySection.querySelectorAll(
		'.card-body input:not([type="file"]), .card-body select', // Bao gồm cả select nếu Size là dropdown
	);

	// Gán theo chỉ mục (index)
	return {
		companyName: allInputs[0],
		field: allInputs[1],
		size: allInputs[2],
	};
}

// ==================== KHỞI TẠO TRANG ====================
function initializePage() {
	console.log("Khởi tạo trang...");

	let loggedInEmail = localStorage.getItem("loggedInEmail");

	if (!loggedInEmail) {
		loggedInEmail = "tranminh@gmail.com";
		localStorage.setItem("loggedInEmail", loggedInEmail);
		console.log("Sử dụng email mặc định:", loggedInEmail);
	} else {
		console.log("Email đã đăng nhập:", loggedInEmail);
	}

	const result = findEmployerByEmail(loggedInEmail);

	if (result) {
		currentUser = result.user;
		currentEmployer = result.employer;

		loadPersonalProfile(); // Tải Personal Info
		loadCompanyProfile(); // Tải Company Info

		console.log("User:", currentUser);
		console.log("Employer:", currentEmployer);
	} else {
		showNotification(
			"Không tìm thấy thông tin employer cho email: " + loggedInEmail,
			"error",
		);
		console.log('Tip: Dùng setLoggedInUser("tranminh@gmail.com") để đổi user');
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

	// Kiểm tra local edits Personal
	const localPersonalData = localStorage.getItem(
		"employerPersonalProfile_" + currentUser.Email,
	);

	const personalData = localPersonalData
		? JSON.parse(localPersonalData)
		: {
				fullName: currentEmployer.EmployerName || "",
				dob: convertToDDMMYYYY(currentEmployer.Birthday) || "", // <-- FIX FORMAT DATE
				phone: currentEmployer["Phone Number"] || "",
				address: currentEmployer.Address || "",
				email: currentUser.Email || "",
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

	const inputs = getCompanyInputs();

	// Kiểm tra local edits Company
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

// ==================== LƯU PROFILE CHUNG ====================
function saveProfile() {
	console.log("Đang lưu tất cả profile...");

	// Lưu Personal Info và validate
	const isPersonalSaved = savePersonalProfile();

	// Lưu Company Info và validate
	const isCompanySaved = saveCompanyProfile();

	if (isPersonalSaved && isCompanySaved) {
		showNotification(
			"Lưu **Thông tin chung & Công ty** thành công!",
			"success",
		);
	}

	return isPersonalSaved && isCompanySaved;
}

// ==================== LƯU PERSONAL PROFILE ====================
function savePersonalProfile() {
	console.log("Đang lưu personal profile...");

	if (!validatePersonalForm()) {
		return false;
	}

	const inputs = getPersonalInputs();
	const profileImage = document.querySelector(".ui-w-80");

	// Thu thập dữ liệu
	const personalData = {
		fullName: inputs.fullName?.value.trim() || "",
		dob: inputs.dob?.value.trim() || "",
		phone: inputs.phone?.value.trim() || "",
		address: inputs.address?.value.trim() || "",
		email: inputs.email?.value.trim() || "",
		profileImage: profileImage?.src || "image/OIP.jpg",
	};

	// Lưu vào localStorage
	localStorage.setItem(
		"employerPersonalProfile_" + currentUser.Email,
		JSON.stringify(personalData),
	);

	// Cập nhật originalData
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

	// Thu thập dữ liệu công ty
	const companyData = {
		companyName: inputs.companyName?.value.trim() || "",
		field: inputs.field?.value.trim() || "",
		size: inputs.size?.value.trim() || "",
	};

	// Lưu vào localStorage
	localStorage.setItem(
		"employerCompanyProfile_" + currentUser.Email,
		JSON.stringify(companyData),
	);

	// Cập nhật originalData
	originalData = { ...originalData, ...companyData };

	console.log("Đã lưu công ty:", companyData);
	return true;
}

// ==================== VALIDATE PERSONAL FORM (Đổi tên từ validateForm) ====================
function validatePersonalForm() {
	let isValid = true;
	let errors = [];

	const inputs = getPersonalInputs();

	// Validate Full Name
	if (inputs.fullName && inputs.fullName.value.trim() === "") {
		errors.push("Vui lòng nhập tên đầy đủ");
		inputs.fullName.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.fullName) {
		inputs.fullName.classList.remove("is-invalid");
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
	} else if (inputs.email) {
		inputs.email.classList.remove("is-invalid");
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
	} else if (inputs.phone) {
		inputs.phone.classList.remove("is-invalid");
	}

	// Validate DoB
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

	const inputs = getCompanyInputs();

	// Validate Company Name
	if (inputs.companyName && inputs.companyName.value.trim() === "") {
		errors.push("Vui lòng nhập Tên Công ty");
		inputs.companyName.classList.add("is-invalid");
		isValid = false;
	} else if (inputs.companyName) {
		inputs.companyName.classList.remove("is-invalid");
	}

	// Validate Field
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

// ==================== UPLOAD ẢNH ====================
function handleImageUpload(event) {
	// ... (giữ nguyên code cũ)
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
	// ... (giữ nguyên code cũ)
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

	// Xóa invalid classes
	document.querySelectorAll(".is-invalid").forEach((el) => {
		el.classList.remove("is-invalid");
	});

	showNotification("Đã hủy thay đổi", "info");
}

// ==================== HIỂN THỊ THÔNG BÁO ====================
function showNotification(message, type = "info") {
	// ... (giữ nguyên code cũ)
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

	// Thêm animation CSS
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
document.addEventListener("DOMContentLoaded", function () {
	console.log("🎬 DOMContentLoaded - Bắt đầu khởi tạo...");

	setTimeout(() => {
		// Khởi tạo trang
		initializePage();

		// Upload ảnh
		const uploadInput = document.querySelector(".account-settings-fileinput");
		if (uploadInput) {
			uploadInput.addEventListener("change", handleImageUpload);
		}

		// Reset ảnh
		const resetPhotoBtn = document.querySelector(".btn-default.md-btn-flat");
		if (resetPhotoBtn) {
			resetPhotoBtn.addEventListener("click", resetPhoto);
		}

		// Cancel changes
		const cancelBtns = document.querySelectorAll(".btn-default");
		const cancelBtn = cancelBtns[cancelBtns.length - 1];
		if (cancelBtn) {
			cancelBtn.addEventListener("click", cancelChanges);
		}

		console.log("Hệ thống đã sẵn sàng!");
	}, 100);
});

// ==================== DEBUG FUNCTIONS ====================
// ... (giữ nguyên code cũ)
window.setLoggedInUser = setLoggedInUser;
window.clearAllData = clearAllData;

console.log("Script đã được load");
