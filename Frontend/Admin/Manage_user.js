function showSection(section) {
    //ẩn nội dung của tất cả section
    const sectionItem = document.querySelectorAll('.content-section');
    sectionItem.forEach(s => s.classList.add("hidden"))

    //hiện  được bấm
    const targetItem =document.getElementById(section)
    if(targetItem) {targetItem.classList.remove("hidden")};
    window.addEventListener('DOMContentLoaded',() => showSection('createEmployer'))
}

//hàm kiểm tra định dạng email password
function validate(email, password, companyName) {
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^.{6,}$/;
    const error_message_email = document.getElementById('error-message-email');
    const error_message_password = document.getElementById('error-message-password');
    const error_message_name = document.getElementById('error-message-name');
    let validEmail = true;
    let validPassword = true;
    let validName = true;
    let isValid = false;
    //kiểm tra xem điền email chưa
    if (!email) {
        error_message_email.innerHTML = "<p>Please enter your email!</p>";
        validEmail = false;
    }
    else {
        //kiểm tra đúng định dạng không
        if (!email_pattern.test(email)) {
            error_message_email.innerHTML = "<p>Incorrect format. Please enter again!</p>";
            validEmail = false;
        }
        else {
            error_message_email.innerHTML = "";
            validEmail = true;
        }

    }

    //kiểm tra đã điền mật khẩu chưa
    if (!password) {
        error_message_password.innerHTML = "<p>Please enter your password!</p>";
        validPassword = false;
    }
    else {
        error_message_password.innerHTML = "";
        validPassword = true;
    }

    //kiểm tra đúng định dạng chưa
    if (!password_pattern.test(password)) {
        error_message_password.innerHTML = "<p>Your password must contain at least 6 characters!</p>";
        validPassword = false;
    }
    else {
        error_message_password.innerHTML = "";
        validPassword = true;
    }

    //kiểm tra định dạng full name
    if (!companyName) {
        error_message_name.innerHTML = "<p>Please enter your name!</p>";
        validName = false;
    }
    else {
        error_message_name.innerHTML = "";
        validName = true;
    }

    if ((validEmail &&validName && validPassword)) {
        isValid = true;
    }
    return isValid;
}

document.getElementById("employerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const employerName = document.getElementById("employer-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone-number").value.trim();
    const address = document.getElementById("address").value.trim();
    if (!validate(email, password, employerName)) {
        return;
    }
})