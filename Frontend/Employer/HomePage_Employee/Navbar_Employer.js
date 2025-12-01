document.addEventListener("DOMContentLoaded", () => {
  const LOGIN_URL = "../../General/Login/Login.html";
  const SIGNUP_URL = "../../Student/Sign_up/Signup.html"; 
  const EDIT_PROFILE_URL = "../Edit_Employer_Profile/Edit_Employer_Profile.html";

  const currentUser = JSON.parse(localStorage.getItem("current_user"));

  const accountBtn = document.getElementById("current-user");

  const submenu1 = document.querySelector(".submenu1");                
  const submenu2 = document.querySelector(".submenu2");               

  if (!accountBtn || !submenu1 || !submenu2) return;

  const setMenuItem = (el, { href, icon, text }) => {
    el.setAttribute("href", href);
    el.innerHTML = `<ion-icon class="icon" name="${icon}"></ion-icon>${text}`;
  };

//khi đăng nhập đổi chữ account thành hi +tên
  if (currentUser && currentUser.role === "Employer") {

    accountBtn.innerHTML = `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Hi, ${currentUser.employerName}`;


    // submenu1 = Edit profile
    setMenuItem(submenu1, {
      href: EDIT_PROFILE_URL,
      icon: "person-outline",
      text: "Edit profile",
    });

    // submenu2 = Log out (vẫn là # để JS xử lý)
    setMenuItem(submenu2, {
      href: "#",
      icon: "log-out-outline",
      text: "Log out",
    });

    // Logout action
    submenu2.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("current_user");
      window.location.href = LOGIN_URL;
    });

  // ====== CHƯA ĐĂNG NHẬP ======
  } else {
    accountBtn.innerHTML = `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Account`;
    

    // submenu1 = Login
    setMenuItem(submenu1, {
      href: LOGIN_URL,
      icon: "log-in-outline",
      text: "Login",
    });

    // submenu2 = Sign up (dùng chính link #log-out làm nút thứ 2)
    setMenuItem(submenu2, {
      href: SIGNUP_URL,
      icon: "person-add-outline",
      text: "Sign up",
    });
  }
});
