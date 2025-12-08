let currentEmail = "";
let currentPassword = "";
let errorMessage = document.getElementById('error-message');

//hàm ẩn/hiện password
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const passwordEye = document.getElementById('toggle-password');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordEye.innerHTML = '<ion-icon name="eye-off-outline"></ion-icon>';
    } else {
        passwordInput.type = "password";
        passwordEye.innerHTML = '<ion-icon name="eye-outline"></ion-icon>';
    }
}

//kiểm tra xem tài khoản có trong bộ nhớ không không
function validateInfo(validUser) {
    let valid = false;
    if (!validUser) {
        errorMessage.innerHTML = "<p> Your account or password is incorrect </p> ";
        valid = false;
    }
    else {
        errorMessage.innerHTML = "";
        valid = true;
    }
    return valid;
}

//lắng nghe sự kiện submit từ người dùng
document.getElementById('login-box').addEventListener('submit', function (e) {
    e.preventDefault();
    currentEmail = document.getElementById('email').value;
    currentPassword = document.getElementById('password').value;

    //lấy dữ liệu từ trong local và kiểm tra xem người dùng bằng email
    let list_user = JSON.parse(localStorage.getItem('list_user') || { list_student: [], list_employer: [] });
    let allUser = [...list_user.list_student, ...list_user.list_employer];
    let validUser = allUser.find(user => (user.email === currentEmail) && (user.password === currentPassword));
    console.log(validUser);
    if (!validateInfo(validUser)) {
        return;
    }
    else {

        //lưu người dùng tìm được vào 1 biến khác
        localStorage.setItem('current_user', JSON.stringify(validUser));
        if (validUser.role === "Student") {
            window.location.href = '../../Student/Homepage/index.html';
        }
        if (validUser.role === "Employer") {
            window.location.href = "../../Employer/HomePage_Employee/Homepage_Screen1.html";
        }
    }
})