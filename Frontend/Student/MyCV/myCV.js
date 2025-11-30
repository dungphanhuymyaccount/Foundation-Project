// ===== Helper: escape HTML =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== Helper: per-student keys =====
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

// ===== Get latest CV =====
function getLatestCV() {
  const studentId = getCurrentStudentId();
  const lastKey = getLastTemplateKey(studentId);

  let templateId = localStorage.getItem(lastKey);

  if (!templateId) {
    if (localStorage.getItem(getCvKey(studentId, "1"))) templateId = "1";
    else if (localStorage.getItem(getCvKey(studentId, "2"))) templateId = "2";
    else return null;
  }

  const raw = localStorage.getItem(getCvKey(studentId, templateId));
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    return { templateId: payload.templateId, data: payload.data || {} };
  } catch (err) {
    console.error("Error parsing CV data:", err);
    return null;
  }
}

// ===== Build CV HTML (không dùng placeholder text) =====
function buildCvHtml(data) {
  const fullName = data.fullName || "";
  const jobTitle = data.jobTitle || "";
  const email = data.email || "";
  const phone = data.phone || "";
  const address = data.address || "";
  const linkedin = data.linkedin || "";
  const portfolio = data.portfolio || "";

  const careerGoal = data.summary || "";
  const skills = data.skills || "";
  const education = data.education || "";
  const experience = data.experience || "";
  const hobbies = data.hobbies || "";
  const avatar = data.avatar || "";

  const contactItems = [];
  if (phone) contactItems.push(`<li>${escapeHtml(phone)}</li>`);
  if (email) contactItems.push(`<li>${escapeHtml(email)}</li>`);
  if (address) contactItems.push(`<li>${escapeHtml(address)}</li>`);
  if (linkedin) contactItems.push(`<li>${escapeHtml(linkedin)}</li>`);
  if (portfolio) contactItems.push(`<li>${escapeHtml(portfolio)}</li>`);

  return `
    <div class="cv-layout">
      <aside class="cv-left">
        <div class="cv-avatar">
          ${avatar ? `<img src="${avatar}" alt="Avatar">` : ""}
        </div>

        <div class="cv-left-name">
          <div class="cv-name">${escapeHtml(fullName)}</div>
          <div class="cv-title">${escapeHtml(jobTitle)}</div>
        </div>

        ${
          contactItems.length
            ? `
        <div class="cv-left-section">
          <div class="cv-left-section-title">Thông tin liên hệ</div>
          <div class="cv-left-section-content">
            <ul class="cv-contact-list">
              ${contactItems.join("")}
            </ul>
          </div>
        </div>`
            : ""
        }

        ${
          careerGoal
            ? `
        <div class="cv-left-section">
          <div class="cv-left-section-title">Mục tiêu nghề nghiệp</div>
          <div class="cv-left-section-content">
            ${escapeHtml(careerGoal)}
          </div>
        </div>`
            : ""
        }

        ${
          skills
            ? `
        <div class="cv-left-section">
          <div class="cv-left-section-title">Kỹ năng</div>
          <div class="cv-left-section-content">
            ${escapeHtml(skills)}
          </div>
        </div>`
            : ""
        }

        ${
          hobbies
            ? `
        <div class="cv-left-section">
          <div class="cv-left-section-title">Sở thích</div>
          <div class="cv-left-section-content">
            ${escapeHtml(hobbies)}
          </div>
        </div>`
            : ""
        }
      </aside>

      <main class="cv-right">
        ${
          education
            ? `
        <section class="cv-right-section">
          <h2 class="cv-right-title">Học vấn</h2>
          <div class="cv-right-content">
${escapeHtml(education)}
          </div>
        </section>`
            : ""
        }

        ${
          experience
            ? `
        <section class="cv-right-section">
          <h2 class="cv-right-title">Kinh nghiệm làm việc</h2>
          <div class="cv-right-content">
${escapeHtml(experience)}
          </div>
        </section>`
            : ""
        }
      </main>
    </div>
  `;
}

// ===== MAIN =====
document.addEventListener("DOMContentLoaded", () => {
  const cvPreview = document.getElementById("cvPreview");
  const editBtn = document.querySelector(".editCv");
  const downloadBtn = document.querySelector(".downloadPdf");

  const latest = getLatestCV();
  let hasCv = false;

  if (latest && latest.data) {
    const data = latest.data;
    const hasContent = Object.values(data).some((v) => {
      if (typeof v !== "string") return false;
      return v.trim() !== "";
    });

    if (hasContent) {
      cvPreview.innerHTML = buildCvHtml(data);
      cvPreview.classList.remove("hidden");
      hasCv = true;
    }
  }

  // Edit -> luôn cho quay lại template
  editBtn.addEventListener("click", () => {
    window.location.href = "../CV_template/template.html";
  });

  // Download PDF: chỉ cho khi đã có CV
downloadBtn.addEventListener("click", () => {
  if (!hasCv) {
    alert("Please create and save your CV before downloading.");
    window.location.href = "../CV_template/template.html";
    return;
  }

  const data = latest.data;
  const element = cvPreview;
  const fileName =
    (data.fullName ? data.fullName.replace(/\s+/g, "_") : "my_cv") + ".pdf";

  const opt = {
    // có thể để 10 hoặc dùng mảng [top, right, bottom, left]
    margin: 10,
    filename: fileName,

    image: { type: "jpeg", quality: 0.98 },

    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0
    },

    // "slice" = kéo phần thừa sang trang tiếp theo
    pagebreak: {
      mode: ["slice"], 
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(opt).from(element).save();
});

});
