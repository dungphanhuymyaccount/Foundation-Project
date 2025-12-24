// Homepage.js (dựa trên code cũ) — KHÔNG tự redirect khi chưa login

document.addEventListener("DOMContentLoaded", () => {
  // Lấy current_user (nếu có)
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("current_user"));
  } catch (e) {
    currentUser = null;
  }

  // Nếu đã login Employer thì mới fill info (nếu có element)
  if (currentUser && currentUser.role === "Employer") {
    const userNameEl = document.getElementById("current-user-name");
    if (userNameEl) {
      const name = currentUser.employerName || "Employer";
      const email = currentUser.email || "";

      userNameEl.innerHTML = email
        ? `<strong>${escapeHtml(name)}</strong><br><small>${escapeHtml(email)}</small>`
        : `<strong>${escapeHtml(name)}</strong>`;
    }
  }

  // Các logic khác của homepage (render, data, banner...) để dưới đây
});

window.addEventListener("storage", (event) => {
  // nếu tab khác logout thì tab này về login (tùy mày muốn giữ hay bỏ)
  if (event.key === "current_user" && event.newValue === null) {
    window.location.href = "../../General/Login/Login.html";
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
