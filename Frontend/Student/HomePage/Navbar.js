document.addEventListener("DOMContentLoaded", () => {
  const LOGIN_URL = "../../General/Login/Login.html";
  const SIGNUP_URL = "../../Student/Sign_up/Signup.html"; 
  const EDIT_PROFILE_URL = "../Edit_Student_Profile/Edit_Student_Profile.html";

  const currentUser = JSON.parse(localStorage.getItem("current_user"));

  const accountBtn = document.getElementById("current-user");         

  const submenu1 = document.querySelector(".submenu1");                 
  const logoutLink = document.getElementById("log-out");                

  if (!accountBtn || !submenu1 || !logoutLink) return;

  const setMenuItem = (el, { href, icon, text }) => {
    el.setAttribute("href", href);
    el.innerHTML = `<ion-icon class="icon" name="${icon}"></ion-icon>${text}`;
  };


  if (currentUser && currentUser.role === "Student") {
    //// Change the login status
    accountBtn.innerHTML = `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Hi, ${currentUser.fullName}`;


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
      window.location.href = "../../General/Login/Login.html";
    });

  //NOT LOGGED IN
  } else {
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
});
