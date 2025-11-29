// ==================== CẤU HÌNH VÀ BIẾN TOÀN CỤC (GIỐNG STUDENT) ====================
const ALL_USERS_STORAGE_KEY = "list_user";
const LOGGED_IN_EMAIL_KEY = "loggedInEmail";
const CURRENT_USER_STORAGE_KEY = "current_user";
const DEFAULT_AVATAR = "image/OIP.jpg";

let allEmployers = [];
let currentUser = null;
let originalData = {};

// ==================== LOCAL STORAGE DB HELPERS ====================
const getDatabaseObject = () => {
  const storedData = localStorage.getItem(ALL_USERS_STORAGE_KEY);
  if (storedData) {
    try { return JSON.parse(storedData); } catch (e) {}
  }
  return { list_student: [], list_employer: [] };
};

function initializeDatabase() {
  const db = getDatabaseObject();
  allEmployers = db.list_employer || [];
  allEmployers = allEmployers.map(e => ({ ...e, email: e.email?.toLowerCase() || "" }));
}

function saveAllEmployers() {
  const db = getDatabaseObject();
  db.list_employer = allEmployers;
  localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(db));
}

function findEmployerByEmail(email) {
  const normalized = email?.toLowerCase() || "";
  const emp = allEmployers.find(e => e.email === normalized);
  return emp ? { ...emp } : null;
}

function getCurrentUserFromLocalStorage() {
  const data = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    const user = Array.isArray(parsed) ? parsed[0] : parsed;
    if (user.email) user.email = user.email.toLowerCase();
    return user;
  } catch(e) { return null; }
}

// ==================== DATE ====================
function convertToYYYYMMDD(dateString) {
  if (!dateString) return "";
  const [m,d,y] = dateString.split("/");
  return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
}
function convertToMMDDYYYY(dateString) {
  if (!dateString) return "";
  const [y,m,d] = dateString.split("-");
  return `${m}/${d}/${y}`;
}

// ==================== QUERIES ====================
function getPersonalInputs() {
  const s = document.querySelector("#account-general");
  if (!s) return {};
  const i = s.querySelectorAll('.card-body input:not([type="file"])');
  return { fullName:i[0], dob:i[1], phone:i[2], address:i[3], email:i[4] };
}
function getCompanyInputs() {
  const s = document.querySelector("#account-company");
  if (!s) return {};
  const i = s.querySelectorAll('.card-body input:not([type="file"])');
  // CHÚ Ý: Đã thêm companyAddress (i[3]) và chuyển introduction thành i[4]
  return { companyName:i[0], field:i[1], size:i[2], companyAddress:i[3], introduction:i[4] };
}

// ==================== LOAD DATA ====================
function initializePage() {
  initializeDatabase();
  const emp = getCurrentUserFromLocalStorage();
  if (!emp) return;
  currentUser = emp;
  loadPersonalProfile();
  loadCompanyProfile();
  const found = findEmployerByEmail(currentUser.email);
  if (!found) {
    allEmployers.push(currentUser);
    saveAllEmployers();
  }
}

function loadPersonalProfile() {
  if (!currentUser) return;
  const image = document.querySelector(".ui-w-80");
  const inputs = getPersonalInputs();
  const d = {
    fullName:currentUser.employerName || "",
    dob:convertToYYYYMMDD(currentUser.birthday) || "",
    phone:currentUser.phoneNumber || "",
    address:currentUser.address || "",
    email:currentUser.email || "",
    avatar: currentUser.avatar || DEFAULT_AVATAR
  };
  if (inputs.fullName) inputs.fullName.value = d.fullName;
  if (inputs.dob) inputs.dob.value = d.dob;
  if (inputs.phone) inputs.phone.value = d.phone;
  if (inputs.address) inputs.address.value = d.address;
  if (inputs.email) inputs.email.value = d.email;
  if (image) image.src = d.avatar;

  originalData = d;
}

function loadCompanyProfile() {
  if (!currentUser) return;
  const inputs = getCompanyInputs();
  const d = {
    companyName:currentUser.companyName || "",
    field:currentUser.field || "",
    size:currentUser.size || "",
    companyAddress:currentUser.companyAddress || "", // <--- ĐÃ THÊM
    introduction: currentUser.companyIntroduction || "",
  };
  if (inputs.companyName) inputs.companyName.value = d.companyName;
  if (inputs.field) inputs.field.value = d.field;
  if (inputs.size) inputs.size.value = d.size;
  if (inputs.companyAddress) inputs.companyAddress.value = d.companyAddress; // <--- ĐÃ THÊM
  if (inputs.introduction) inputs.introduction.value = d.introduction;
  originalData = { ...originalData, ...d };
}

// ==================== SAVE ====================
window.saveProfile = function () {
  const ok1 = savePersonalProfile();
  const ok2 = saveCompanyProfile();
  return ok1 && ok2;
};

function validatePersonalForm() {
  const i = getPersonalInputs();
  if (!i.fullName?.value.trim()) return false;
  if (i.phone?.value.trim().length < 10) return false;
  if (new Date(i.dob?.value) > new Date()) return false;
  return true;
}

function validateCompanyForm() {
  const i = getCompanyInputs();
  if (!i.companyName?.value.trim()) return false;
  if (!i.introduction?.value.trim()) return false;
  return true;
}

function savePersonalProfile() {
  if (!validatePersonalForm()) return false;
  const i = getPersonalInputs();
  const img = document.querySelector(".ui-w-80");
  const d = {
    employerName:i.fullName?.value.trim(),
    birthday:convertToMMDDYYYY(i.dob?.value.trim()),
    phoneNumber:i.phone?.value.trim(),
    address:i.address?.value.trim(),
    email:i.email?.value.trim().toLowerCase(),
    avatar:img?.src || DEFAULT_AVATAR
  };

  const idx = allEmployers.findIndex(e => e.email === originalData.email);
  if (idx !== -1) {
    allEmployers[idx] = { ...allEmployers[idx], ...d };
    currentUser = { ...allEmployers[idx] };
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    saveAllEmployers();

    if (originalData.email !== d.email) {
      localStorage.setItem(LOGGED_IN_EMAIL_KEY, d.email);
      setTimeout(initializePage, 500);
    }
    return true;
  }
  return false;
}

function saveCompanyProfile() {
  if (!validateCompanyForm()) return false;
  const i = getCompanyInputs();
  const d = {
    companyName:i.companyName?.value.trim(),
    field:i.field?.value.trim(),
    size:i.size?.value.trim(),
    companyAddress:i.companyAddress?.value.trim(), // <--- ĐÃ THÊM
    companyIntroduction:i.introduction?.value.trim()
  };

  const idx = allEmployers.findIndex(e => e.email === originalData.email);
  if (idx !== -1) {
    allEmployers[idx] = { ...allEmployers[idx], ...d };
    currentUser = { ...allEmployers[idx] };
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    saveAllEmployers();
    return true;
  }
  return false;
}

// ==================== Image Handling ====================
window.resetPhoto = function () {
  const img = document.querySelector(".ui-w-80");
  if (img) img.src = currentUser?.avatar || DEFAULT_AVATAR;
  document.querySelector(".account-settings-fileinput")?.value = "";
};

function showNotification(message, type="info") {
  const n = document.createElement("div");
  n.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:15px;background:${
    type==="success"?"#28a745": type==="error"?"#dc3545":"#17a2b8"
  };color:#fff;border-radius:5px;white-space:pre-line;`;
  n.textContent = message;
  document.body.append(n);
  setTimeout(()=>n.remove(),3000);
}

document.addEventListener("DOMContentLoaded", initializePage);
console.log("Employer profile script ready ✅");
