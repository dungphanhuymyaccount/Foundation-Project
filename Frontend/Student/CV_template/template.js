//Lấy studentID từ current_user trong local
function getCurrentStudentId() {
  try {
    const userData = JSON.parse(localStorage.getItem("current_user") || "null");
    const StudentID = userData && userData.StudentID;
    if (!StudentID) {
      console.warn("Not found StudentID in current_user.");
      return null;
    }
    return StudentID;
  } catch (e) {
    console.error("Can not parse current_user from localStorage:", e);
    return null;
  }
}

//tạo key cho cv theo StudentID
function getCvKey(StudentID, templateId) {
  return `cv_${StudentID}_template_${templateId}`;
}

function getLastTemplateKey(StudentID) {
  return `cv_${StudentID}_lastTemplateId`;
}

let StudentID = null;   // lấy StudentID đang login
let existingData = null; // giữ CV cũ

document.addEventListener("DOMContentLoaded", () => {
  //lấy StudentID đang login
  StudentID = getCurrentStudentId();
  console.log("studentId dùng cho CV:", StudentID);

  // thông báo khi chưa login
  if (!StudentID) {
    alert("You need to log in to create or edit your CV.");
    window.location.href = "../../General/Login/Login.html";
    return;
  }

  const form = document.getElementById("cvForm");
  const saveBtn = document.getElementById("saveCvBtn");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");

  // Load CV đã lưu 
  loadExistingCvAndFillForm(form, avatarPreview);

  // Kiểm tra phần tử DOM có tồn tại avatarInput không
  if (avatarInput) {
    avatarInput.addEventListener("change", () => {   //user chọn file ảnh mới từ laptop
      const file = avatarInput.files[0];
      if (!file) return;

      const reader = new FileReader(); //đọc file ảnh 
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Avatar preview">`; //hiển thị ảnh trên CV sau khi chọn
        //lưu ảnh vào existingData để khi lưu cv sẽ lưu cả ảnh
        if (!existingData) existingData = {};
        existingData.avatar = dataUrl;
      };
      reader.readAsDataURL(file); // chuyển file thành data URL
    });
  }

  // Save CV
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      // nếu nút là type="submit" thì tránh reload form
      // e.preventDefault();
      handleSaveCv(form);
    });
  }
}); // <-- đóng DOMContentLoaded CHUẨN

//load cv đã lưu trong localStorage và cho user sửa vào form
function loadExistingCvAndFillForm(form, avatarPreview) {
  const cvKey = getCvKey(StudentID, "1");
  if (!localStorage.getItem(cvKey)) return;

  try {
    const payload = JSON.parse(localStorage.getItem(cvKey));
    const data = payload.data || {};
    existingData = data;

    // Điền dữ liệu lại vào form
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

//save lại information của cv vào localstorage
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

  if (existingData && existingData.avatar) {
    data.avatar = existingData.avatar;
  }

  //tạo payload để lưu thông tin từ form vào localstorage
  const payload = {
    templateId: "1",
    StudentID: StudentID,
    data,
    updatedAt: new Date().toISOString(),
  };

  const cvKey = getCvKey(StudentID, "1");
  const lastKey = getLastTemplateKey(StudentID);

  localStorage.setItem(cvKey, JSON.stringify(payload));
  localStorage.setItem(lastKey, "1"); //lưu id của template cuối cùng vào local

  console.log("Saved CV payload:", payload);

  // chuyển hướng sang trang My CV
  window.location.href = "../MyCV/myCV.html";
}
