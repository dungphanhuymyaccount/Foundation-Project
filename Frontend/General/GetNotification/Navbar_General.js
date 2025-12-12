document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const body = document.body;

    // Define Navbar for Student and Employer
    const studentNavbar = `
        <header>
            <div class="logo">
                <h2><a href="../../Student/HomePage/index.html" style="text-decoration: none; color: #fff;">Work Hub</a></h2>
            </div>
            <nav class="navi">
                <ul>
                    <li><a href="../../Student/HomePage/index.html" class="menu_btn">Find Job</a></li>
                    <li><a href="../../Student/MyCV/myCV.html" class="menu_btn"><ion-icon name="reader-outline"></ion-icon> My CV</a></li>
                    <li><a href="../../General/GetNotification/GetNotification.html" class="menu_btn"><ion-icon class="icon" name="notifications-outline"></ion-icon> Notification</a></li>
                    <li>
                        <a href="#" class="menu_btn" id="current-user"><ion-icon class="icon" name="person-circle-outline"></ion-icon>Account</a>
                        <ul class="submenu">
                            <li class="account-name-and-email" id="current-user-name"></li><hr>
                            <li><a href="../../Student/Edit_Student_Profile/Edit_Student_Profile.html" class="submenu1"><ion-icon class="icon" name="person-outline"></ion-icon>Edit profile</a></li>
                            <li><a href="#" id="log-out" class="submenu2"><ion-icon class="icon" name="log-out-outline"></ion-icon>Log out</a></li>
                            <li><a href="../help/help.html"  target="_blank" class="submenu3">User Guild</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>`;

    const employerNavbar = `
        <header>
            <div class="logo">
                <h2><a href="../../Employer/HomePage_Employee/Homepage_Screen1.html" style="text-decoration: none; color: #fff;">Work Hub</a></h2>
            </div>
            <nav class="navi">
                <ul>
                    <li><a href="../../Employer/Manage_Job/ManagaeJob.html" class="menu_btn"><ion-icon name="reader-outline"></ion-icon> My Post</a></li>
                    <li><a href="../../General/GetNotification/GetNotification.html" class="menu_btn"><ion-icon name="notifications-outline"></ion-icon> Notification</a></li>
                    <li>
                        <a href="#" class="menu_btn" id="current-user"><ion-icon class="icon" name="person-circle-outline"></ion-icon>Account</a>
                        <ul class="submenu">
                            <li class="account-name-and-email" id="current-user-name"></li><hr>
                            <li><a href="../../Employer/Edit_Employer_Profile/Edit_Employer_Profile.html" class="submenu1"><ion-icon class="icon" name="person-outline"></ion-icon>Edit profile</a></li>
                            <li><a href="#" id="log-out" class="submenu2"><ion-icon class="icon" name="log-out-outline"></ion-icon>Log out</a></li>
                            <li><a href="../help/help.html" target="_blank" class="submenu3">User Guild</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>`;

    // Choose the right Navbar to insert
    let navbarHTML = studentNavbar; // Default is Student
    let role = 'Student';

    if (currentUser && currentUser.role === "Employer") {
        navbarHTML = employerNavbar;
        role = 'Employer';
    } else if (currentUser && currentUser.role === "Student") {
        navbarHTML = studentNavbar;
    } 
    
    // Insert Navbar at the beginning of the body
    body.insertAdjacentHTML('afterbegin', navbarHTML);

    // Activate common Navbar logic
    initializeNavbarLogic(currentUser, role);
});

// Common logic to handle Login/Logout and display user name
function initializeNavbarLogic(currentUser, role) {
    const LOGIN_URL = "../../General/Login/Login.html";
    const SIGNUP_URL = "../../Student/Sign_up/Signup.html";
    
    // Edit Profile URL varies by role
    const EDIT_PROFILE_URL = role === 'Employer' 
        ? "../../Employer/Edit_Employer_Profile/Edit_Employer_Profile.html" 
        : "../../Student/Edit_Student_Profile/Edit_Student_Profile.html";

    const accountBtn = document.getElementById("current-user");
    const submenu1 = document.querySelector(".submenu1");
    const logoutLink = document.getElementById("log-out");

    if (!accountBtn || !submenu1 || !logoutLink) return;

    const setMenuItem = (el, { href, icon, text }) => {
        el.setAttribute("href", href);
        el.innerHTML = `<ion-icon class="icon" name="${icon}"></ion-icon>${text}`;
    };

    if (currentUser) {
        const userName = role === 'Employer' ? currentUser.employerName : currentUser.fullName;
        // Change "Account" to "Hi, name"
        accountBtn.innerHTML = `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Hi, ${userName}`;

        // submenu1 = Edit profile
        setMenuItem(submenu1, {
            href: EDIT_PROFILE_URL,
            icon: "person-outline",
            text: "Edit profile",
        });

        // submenu2 = Log out
        setMenuItem(logoutLink, {
            href: "#",
            icon: "log-out-outline",
            text: "Log out",
        });

        // Logout action
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("current_user");
            window.location.href = LOGIN_URL;
        });

    } else {
        // Not logged in: Menu will be Login and Sign up
        accountBtn.innerHTML = `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Account`;
        
        // submenu1 = Login
        setMenuItem(submenu1, {
            href: LOGIN_URL,
            icon: "log-in-outline",
            text: "Login",
        });

        // submenu2 = Sign up
        setMenuItem(logoutLink, {
            href: SIGNUP_URL,
            icon: "person-add-outline",
            text: "Sign up",
        });
    }
}