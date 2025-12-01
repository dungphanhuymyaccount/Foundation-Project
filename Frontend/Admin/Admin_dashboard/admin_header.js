function getCurrentAdmin() {
  const currentAdmin = sessionStorage.getItem("current_admin");
  if (!currentAdmin) return null;
  try { 
    return JSON.parse(currentAdmin); 
  } catch { 
    return null; }
}

function clearCurrentAdmin() {
  sessionStorage.removeItem("current_admin");
}

document.addEventListener("DOMContentLoaded", () => {
  const label = document.getElementById("accountLabel");
  const btn = document.getElementById("accountBtn");
  const menu = document.getElementById("accountMenu");
  const action = document.getElementById("accountAction");

  function render() {
    const admin = getCurrentAdmin();
    const name = admin?.accountname || admin?.accountName;

    if (name) {
      label.textContent = name;
      action.textContent = "Logout";
      action.onclick = () => {
        clearCurrentAdmin();
        window.location.href = "Login_admin/Login_admin.html";
      };
    } else {
      label.textContent = "Account";
      action.textContent = "Login";
      action.onclick = () => {
        window.location.href = "Login_admin/Login_admin.html";
      };
    }
  }

  function openMenu() {
    menu.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    menu.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener("click", closeMenu);

  render();
});
