// Navbar_Employer.js (dựa trên code cũ) — KHÔNG redirect khi chưa login, chỉ đổi menu

document.addEventListener("DOMContentLoaded", () => {
  const LOGIN_URL = "../../General/Login/Login.html";
  const EDIT_PROFILE_URL = "../Edit_Employer_Profile/Edit_Employer_Profile.html";

  window.addEventListener("storage", (event) => {
    if (event.key === "current_user" && event.newValue === null) {
      window.location.href = LOGIN_URL;
    }
  });

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("current_user"));
  } catch (e) {
    currentUser = null;
  }

  const accountBtn = document.getElementById("current-user");
  const submenu1 = document.querySelector(".submenu1"); // Edit profile / Login
  const logoutBtn = document.getElementById("log-out"); // <a id="log-out"...>

  if (!accountBtn || !submenu1 || !logoutBtn) return;

  const setMenuItem = (el, { href, icon, text }) => {
    el.setAttribute("href", href);
    el.innerHTML = `<ion-icon class="icon" name="${icon}"></ion-icon>${text}`;
  };

  // ===== LOGGED IN (Employer) =====
  if (currentUser && currentUser.role === "Employer") {
    accountBtn.innerHTML =
      `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Hi, ${currentUser.employerName}`;

    setMenuItem(submenu1, {
      href: EDIT_PROFILE_URL,
      icon: "person-outline",
      text: "Edit profile",
    });

    // hiện logout
    logoutBtn.style.display = "";
    logoutBtn.innerHTML = `<ion-icon class="icon" name="log-out-outline"></ion-icon>Log out`;
    logoutBtn.setAttribute("href", "#");

    // chống gắn trùng event
    if (!logoutBtn.dataset.bound) {
      logoutBtn.dataset.bound = "1";
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("current_user");
        window.location.replace(LOGIN_URL);
      });
    }

  // ===== NOT LOGGED IN =====
  } else {
    accountBtn.innerHTML =
      `<ion-icon class="icon" name="person-circle-outline"></ion-icon>Account`;

    setMenuItem(submenu1, {
      href: LOGIN_URL,
      icon: "log-in-outline",
      text: "Login",
    });

    // ẩn logout
    logoutBtn.style.display = "none";
  }
});
