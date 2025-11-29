document.addEventListener("DOMContentLoaded", () => {
  const cvPreview = document.getElementById("cvPreview");
  const noCvMessage = document.getElementById("noCvMessage");
  const editBtn = document.getElementById("editCvBtn");
  const downloadBtn = document.getElementById("downloadPdfBtn");

  const latest = getLatestCV();
  if (!latest || !latest.data) {
    // Không có CV nào -> báo + cho quay lại trang tạo CV
    noCvMessage.classList.remove("hidden");
    cvPreview.classList.add("hidden");
    return;
  }

  const { templateId, data } = latest;

  // Render CV ra preview
  const html = buildCvHtml(data);
  cvPreview.innerHTML = html;
  cvPreview.classList.remove("hidden");
  noCvMessage.classList.add("hidden");

  // Nút Edit: quay lại trang CV Builder (đã load sẵn dữ liệu từ localStorage)
  editBtn.addEventListener("click", () => {
    window.location.href = "../CV_template/template.html";
  });

  // Nút Download PDF: dùng html2pdf để tạo file và tải xuống
  downloadBtn.addEventListener("click", () => {
    const element = cvPreview; // phần cần convert sang PDF
    const fileName = (data.fullName ? data.fullName.replace(/\s+/g, "_") : "my_cv") + ".pdf";

    const opt = {
      margin:       10,
      filename:     fileName,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Gọi html2pdf để tạo và lưu file
    html2pdf().set(opt).from(element).save();
  });
});

/**
 * Lấy CV mới nhất từ localStorage
 */
function getLatestCV() {
  let templateId = localStorage.getItem("lastSavedTemplateId");

  if (!templateId) {
    if (localStorage.getItem("cvTemplate_1")) templateId = "1";
    else if (localStorage.getItem("cvTemplate_2")) templateId = "2";
    else return null;
  }

  const raw = localStorage.getItem(`cvTemplate_${templateId}`);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    return { templateId: payload.templateId, data: payload.data || {} };
  } catch (err) {
    console.error("Error parsing CV data:", err);
    return null;
  }
}

/**
 * Build HTML cho CV preview từ data trong localStorage
 */
function buildCvHtml(data) {
  const fullName = data.fullName || "Your Name";
  const jobTitle = data.jobTitle || "Your Job Title";
  const email = data.email || "";
  const phone = data.phone || "";
  const address = data.address || "";
  const linkedin = data.linkedin || "";
  const portfolio = data.portfolio || "";
  const summary = data.summary || "";
  const education = data.education || "";
  const experience = data.experience || "";
  const skills = data.skills || "";

  const contactParts = [];
  if (email) contactParts.push(`<span>Email: ${escapeHtml(email)}</span>`);
  if (phone) contactParts.push(`<span>Phone: ${escapeHtml(phone)}</span>`);
  if (address) contactParts.push(`<span>Address: ${escapeHtml(address)}</span>`);
  if (linkedin) contactParts.push(`<span>LinkedIn: ${escapeHtml(linkedin)}</span>`);
  if (portfolio) contactParts.push(`<span>Portfolio: ${escapeHtml(portfolio)}</span>`);

  return `
    <div class="cv-header">
      <div class="cv-name">${escapeHtml(fullName)}</div>
      <div class="cv-title">${escapeHtml(jobTitle)}</div>
      <div class="cv-contact">
        ${contactParts.join(" ")}
      </div>
    </div>

    ${summary
      ? `
      <div class="cv-section-block">
        <div class="cv-section-title">Summary</div>
        <div class="cv-section-content">${escapeHtml(summary)}</div>
      </div>
    `
      : ""}

    ${education
      ? `
      <div class="cv-section-block">
        <div class="cv-section-title">Education</div>
        <div class="cv-section-content">${escapeHtml(education)}</div>
      </div>
    `
      : ""}

    ${experience
      ? `
      <div class="cv-section-block">
        <div class="cv-section-title">Experience / Projects</div>
        <div class="cv-section-content">${escapeHtml(experience)}</div>
      </div>
    `
      : ""}

    ${skills
      ? `
      <div class="cv-section-block">
        <div class="cv-section-title">Skills</div>
        <div class="cv-section-content">${escapeHtml(skills)}</div>
      </div>
    `
      : ""}
  `;
}

/**
 * Escape HTML cơ bản
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
