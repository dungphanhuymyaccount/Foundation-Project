// ===== Helper: lấy studentId (nếu chưa login dùng "guest" để test) =====
function getCurrentStudentId() {
  const raw =
    localStorage.getItem("current_student") ||
    localStorage.getItem("current_user");

  if (!raw) {
    console.warn("No current_student found, using 'guest' id");
    return "guest";
  }

  try {
    const student = JSON.parse(raw);
    return student.studentId || student.id || student.userId || "guest";
  } catch (e) {
    console.error("Cannot parse current_student", e);
    return "guest";
  }
}

function getCvKey(studentId, templateId) {
  return `cv_${studentId}_template_${templateId}`;
}

function getLastTemplateKey(studentId) {
  return `cv_${studentId}_lastTemplateId`;
}

const state = {
  studentId: null,
  existingData: null, // giữ CV cũ (avatar…)
};

document.addEventListener("DOMContentLoaded", () => {
  state.studentId = getCurrentStudentId();
  console.log("studentId dùng cho CV:", state.studentId);

  const form = document.getElementById("cvForm");
  const saveBtn = document.getElementById("saveCvBtn");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");

  // Load CV đã lưu nếu có
  loadExistingCvAndFillForm(form, avatarPreview);

  // Preview avatar
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Avatar preview">`;

      if (!state.existingData) state.existingData = {};
      state.existingData.avatar = dataUrl;
    };
    reader.readAsDataURL(file);
  });

  // Save CV
  saveBtn.addEventListener("click", () => {
    handleSaveCv(form);
  });
});

function loadExistingCvAndFillForm(form, avatarPreview) {
  const studentId = state.studentId;
  const cvKey = getCvKey(studentId, "1");
  const raw = localStorage.getItem(cvKey);
  if (!raw) return;

  try {
    const payload = JSON.parse(raw);
    const data = payload.data || {};
    state.existingData = data;

    Object.keys(data).forEach((key) => {
      if (key === "avatar") return;
      const field =
        form.querySelector(`[name="${key}"]`) || form.querySelector(`#${key}`);
      if (field) field.value = data[key];
    });

    if (data.avatar) {
      avatarPreview.innerHTML = `<img src="${data.avatar}" alt="Avatar">`;
    }
  } catch (err) {
    console.error("Error parsing existing CV:", err);
  }
}

function handleSaveCv(form) {
  const studentId = state.studentId;

  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  if (state.existingData && state.existingData.avatar) {
    data.avatar = state.existingData.avatar;
  }

  const payload = {
    templateId: "1",
    studentId,
    data,
    updatedAt: new Date().toISOString(),
  };

  const cvKey = getCvKey(studentId, "1");
  const lastKey = getLastTemplateKey(studentId);

  localStorage.setItem(cvKey, JSON.stringify(payload));
  localStorage.setItem(lastKey, "1");

  console.log("Saved CV payload:", payload);

  // chuyển sang My CV
  window.location.href = "../MyCV/myCV.html";
}
