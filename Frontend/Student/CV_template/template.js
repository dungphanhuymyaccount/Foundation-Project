// get StudentID from current_user in localStorage
function getCurrentStudentId() {
  try {
    const userData = JSON.parse(localStorage.getItem("current_user") || "null");
    const StudentID = userData && userData.StudentID;
    if (!StudentID) {
      console.warn("StudentID not found in current_user");
      return null;
    }
    return StudentID;
  } catch (e) {
    console.error("Cannot parse current_user from localStorage:", e);
    return null;
  }
}

// build CV key by StudentID + templateId
function getCvKey(StudentID, templateId) {
  return `cv_${StudentID}_template_${templateId}`;
}

function getLastTemplateKey(StudentID) {
  return `cv_${StudentID}_lastTemplateId`;
}

let StudentID = null;    // currently logged-in student
let existingData = null; // cached CV data

document.addEventListener("DOMContentLoaded", () => {
  // get current StudentID
  StudentID = getCurrentStudentId();
  console.log("StudentID used for CV:", StudentID);

  // not logged in
  if (!StudentID) {
    alert("You need to log in to create or edit your CV.");
    window.location.href = "../../General/Login/Login.html";
    return;
  }

  const form = document.getElementById("cvForm");
  const saveBtn = document.getElementById("saveCvBtn");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");

  // load existing CV (if any)
  loadExistingCvAndFillForm(form, avatarPreview);

  // avatar upload handler
  if (avatarInput) {
    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files[0];
      if (!file) return;

      const reader = new FileReader(); // read image file
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Avatar preview">`;

        // keep avatar in memory so we can save later
        if (!existingData) existingData = {};
        existingData.avatar = dataUrl;
      };
      reader.readAsDataURL(file); // file -> data URL
    });
  }

  // save CV
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      // if button is type="submit", prevent default in HTML or here if needed

      handleSaveCv(form);
    });
  }
});

// load CV from localStorage and fill form
function loadExistingCvAndFillForm(form, avatarPreview) {
  const cvKey = getCvKey(StudentID, "1");
  if (!localStorage.getItem(cvKey)) return;

  try {
    const payload = JSON.parse(localStorage.getItem(cvKey));
    const data = payload.data || {};
    existingData = data;

    // fill inputs
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

// save CV to localStorage
function handleSaveCv(form) {
  if (!StudentID) {
    alert("You need to log in to save your CV.");
    return;
  }

  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    data[key] = value;
  });

  // keep old avatar if user didn't change it
  if (existingData && existingData.avatar) {
    data.avatar = existingData.avatar;
  }

  // payload stored in localStorage
  const payload = {
    templateId: "1",
    StudentID: StudentID,
    data,
    updatedAt: new Date().toISOString(),
  };

  const cvKey = getCvKey(StudentID, "1");
  const lastKey = getLastTemplateKey(StudentID);

  localStorage.setItem(cvKey, JSON.stringify(payload));
  localStorage.setItem(lastKey, "1"); // last used template

  console.log("Saved CV payload:", payload);

  // redirect to My CV page
  window.location.href = "../MyCV/myCV.html";
}
