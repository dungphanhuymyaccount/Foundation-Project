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

// build CV key by StudentID & template
function getCvKey(StudentID, templateId) {
  return `cv_${StudentID}_template_${templateId}`;
}

function getLastTemplateKey(StudentID) {
  return `cv_${StudentID}_lastTemplateId`;
}

// basic HTML escape
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// build CV HTML (no placeholder text)
function buildCvHtml(data) {
  const fullName = data.fullName || "";
  const jobTitle = data.jobTitle || "";
  const email = data.email || "";
  const phone = data.phone || "";
  const address = data.address || "";
  const instagram = data.instagram || "";
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
  if (instagram) contactItems.push(`<li>${escapeHtml(instagram)}</li>`);
  if (portfolio) contactItems.push(`<li>${escapeHtml(portfolio)}</li>`);

  // return final CV HTML
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
          <div class="cv-left-section-title">Contact Information</div>
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
          <div class="cv-left-section-title">Career objective</div>
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
          <div class="cv-left-section-title">Skills</div>
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
          <div class="cv-left-section-title">Hobbies</div>
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
          <h2 class="cv-right-title">Education</h2>
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
          <h2 class="cv-right-title">Work Experience</h2>
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

// get latest CV for a student 
function getLatestCV(StudentID) {
  const lastKey = getLastTemplateKey(StudentID);
  let templateId = localStorage.getItem(lastKey);

  if (!templateId) {
    if (localStorage.getItem(getCvKey(StudentID, "1"))) templateId = "1";
    else if (localStorage.getItem(getCvKey(StudentID, "2"))) templateId = "2";
    else return null;
  }

  const raw = localStorage.getItem(getCvKey(StudentID, templateId));
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw);
    return { templateId: payload.templateId, data: payload.data || {} };
  } catch (err) {
    console.error("Error parsing CV data:", err);
    return null;
  }
}

// get StudentID
let StudentID = null;

document.addEventListener("DOMContentLoaded", () => {
  const cvPreview = document.getElementById("cvPreview");
  const editBtn = document.querySelector(".editCv");
  const downloadBtn = document.querySelector(".downloadPdf");

  // check login
  StudentID = getCurrentStudentId();
  if (!StudentID) {
    alert("You need to log in to view your CV.");
    window.location.href = "../../General/Login/Login.html";
    return;
  }

  // load latest CV from localStorage
  const latest = getLatestCV(StudentID);
  if (!latest || !latest.data) {
    // no CV -> go back to template builder
    window.location.href = "../CV_template/template.html";
    return;
  }

  const data = latest.data;

  // if all fields empty -> treat as no CV
  const hasContent = Object.values(data).some((v) => {
    if (typeof v !== "string") return false;
    return v.trim() !== "";
  });

  if (!hasContent && !data.avatar) {
    window.location.href = "../CV_template/template.html";
    return;
  }

  // render CV
  cvPreview.innerHTML = buildCvHtml(data);
  cvPreview.classList.remove("hidden");

  // Edit -> back to template page
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.href = "../CV_template/template.html";
    });
  }

  // Download PDF
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const element = cvPreview;
      const fileName =
        (data.fullName ? data.fullName.replace(/\s+/g, "_") : "my_cv") + ".pdf";

      // set up html2pdf options
      const opt = {
        margin: 10,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
        },
        // split pages when overflow
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
  }
});
