let fullName = "";
let email = "";
let password = "";
let role = "";
let list_user = JSON.parse(localStorage.getItem('list_user')) || { list_student: [], list_employer:[]};
let allUser = [...list_user.list_student, ...list_user.list_employer];
//Function to validate email and password format
function validate(email, password, name) {
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^.{6,}$/;
    const error_message_email = document.getElementById('error-message-email');
    const error_message_password = document.getElementById('error-message-password');
    const error_message_name = document.getElementById('error-message-name');
    let validEmail = true;
    let validPassword = true;
    let validName = true;
    let isValid = false;
    //Check if the email field is filled
    if (!email) {
        error_message_email.innerHTML = "<p>Please enter your email!</p>";
        validEmail = false;
    }
    else {
        //Check if the format is valid
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
    if (!name) {
        error_message_name.innerHTML = "<p>Please enter your name!</p>";
        validName = false;
    }
    else {
        error_message_name.innerHTML = "";
        validName = true;
    }

    if ((validEmail === validPassword && validEmail === validName && validEmail === true)) {
        isValid = true;
    }
    return isValid;
}

// Function to check if the registered user already exists
function existEmail(email) {
    if (email) {
        return checkEmail = allUser.some(user => user.email === email);
    }
}

// Function to generate an ID for Student
function getStudentID() {

   // Collect all student IDs
    let allStudents = list_user.list_student;

    if (allStudents.length === 0) {
        return "S001";
    }

   // Get the highest existing ID
    let maxID = allStudents.reduce((max, user) => {
        let num = parseInt(user.StudentID?.replace("S", "")) || 0;
        return Math.max(max, num);
    }, 0);

    let nextID = maxID + 1;

    return "S" + String(nextID).padStart(3, "0");
}

// Listen for the event to save information into localStorage after clicking submit
document.getElementById('signup-form-step1').addEventListener('submit', function (event) {
    event.preventDefault();
    fullName = document.getElementById('fullname').value;
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;

    // Validate the information format
    if (!validate(email, password, fullName)) {
        return;
    };

    if (existEmail(email)) {
        document.getElementById('error-message-email').innerHTML = "<p>Email already exist!!</p>";;
        return;
    }

    let user = ({
        StudentID : getStudentID(),
        fullName : fullName,
        email: email,
        password: password,
        role: "Student"
    });

    // Get the user list data containing both roles
    let list_user = JSON.parse(localStorage.getItem('list_user')) || {
        list_student: [],
        list_employer: []
    };

    // Push the newly registered user into the user list
    list_user.list_student.push(user);

    // Save the user into the user list (with assigned role)
    localStorage.setItem('list_user', JSON.stringify(list_user));


    // Redirect to the login page
    setTimeout(() => { window.location.href = '../../General/Login/Login.html' }, 800);

})
