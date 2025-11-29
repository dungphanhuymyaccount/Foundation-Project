document.addEventListener("DOMContentLoaded", () => {
  const templateButtons = document.querySelectorAll(".template-switch button");
  const saveButtons = document.querySelectorAll(".save-cv");

  // Switch between templates
  templateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateId = btn.dataset.template;
      showTemplate(templateId);
    });
  });

  // Save CV on button click
  saveButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateId = btn.dataset.template;
      saveCV(templateId);
    });
  });

  // Load saved data for both templates
  ["1", "2"].forEach((id) => loadCV(id));

  // If you want to open last edited template:
  const last = localStorage.getItem("lastSavedTemplateId");
  if (last) {
    showTemplate(last);
  } else {
    showTemplate("1");
  }
});

function showTemplate(templateId) {
  const forms = document.querySelectorAll(".cv-form");
  const buttons = document.querySelectorAll(".template-switch button");

  forms.forEach((form) => {
    if (form.dataset.template === templateId) {
      form.classList.remove("hidden");
    } else {
      form.classList.add("hidden");
    }
  });

  buttons.forEach((btn) => {
    if (btn.dataset.template === templateId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function saveCV(templateId) {
  const form = document.querySelector(`.cv-form[data-template="${templateId}"]`);
  if (!form) return;

  const fields = form.querySelectorAll("input, textarea");
  const data = {};

  fields.forEach((el) => {
    const key = el.name || el.id;
    if (!key) return;
    data[key] = el.value;
  });

  const payload = {
    templateId,
    data,
    updatedAt: new Date().toISOString(),
  };

  // Save CV data and last used template
  localStorage.setItem(`cvTemplate_${templateId}`, JSON.stringify(payload));
  localStorage.setItem("lastSavedTemplateId", templateId);

  // Optionally show a quick message
  alert(`CV for Template ${templateId} has been saved! Redirecting to "My CV"...`);

  // Redirect to My CV page (adjust path if needed)
  window.location.href = "../MyCV/myCV.html";
}

function loadCV(templateId) {
  const raw = localStorage.getItem(`cvTemplate_${templateId}`);
  if (!raw) return;

  try {
    const payload = JSON.parse(raw);
    const data = payload.data || {};
    const form = document.querySelector(`.cv-form[data-template="${templateId}"]`);
    if (!form) return;

    Object.keys(data).forEach((key) => {
      const field =
        form.querySelector(`[name="${key}"]`) ||
        form.querySelector(`#${key}`);

      if (field) {
        field.value = data[key];
      }
    });
  } catch (err) {
    console.error("Error parsing CV data from localStorage:", err);
  }
}
