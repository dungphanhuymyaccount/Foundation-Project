let currentUser = JSON.parse(localStorage.getItem("current_user"));
let selectedJobId = JSON.parse(localStorage.getItem("selected_job_ID"));
let applications = JSON.parse(localStorage.getItem("applications")) || [];

const msg = document.getElementById("error-message-cv");

document.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) {
        setTimeout(() => {
            alert("You need to log in before applying.!");
            window.location.href = "../../General/Login/Login.html";
        }, 300);
        return;
    }

    // Tự động điền
    document.getElementById("fullname").value = currentUser.fullName || "";
    document.getElementById("email").value = currentUser.email || "";
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("File reading error.");
        reader.readAsDataURL(file);
    });
}

function generateCvId() {
    if (applications.length === 0) return "CV001";
    const last = applications[applications.length - 1].CvId;
    const num = parseInt(last.replace("CV", "")) + 1;
    return "CV" + num.toString().padStart(3, "0");
}

function alreadyApplied(studentId, jobId) {
    return applications.some(a => a.studentId === studentId && a.jobId === jobId);
}

// Xoá lỗi khi đổi file
document.getElementById("cvFile").addEventListener("change", () => {
    msg.innerHTML = "";
});

document.getElementById("applyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = ""; // Reset lỗi

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const cvFile = document.getElementById("cvFile").files[0];

    // Check trùng ứng tuyển
    if (alreadyApplied(currentUser.StudentID, selectedJobId)) {
        alert ("You’ve already applied for this job.!");
        return;
    }

    // Check CV khi submit
    if (!cvFile) {
        msg.innerHTML = "<p>You need to choose a CV before submitting.</p>";
        return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (cvFile.size > MAX_SIZE) {
        msg.innerHTML = "<p>The file exceeds 5MB. Please choose another one!</p>";
        return;
    }

    // Convert Base64
    const cvBase64 = await fileToBase64(cvFile);

    const app = {
        CvId: generateCvId(),
        studentId: currentUser.StudentID,
        jobId: selectedJobId,
        fullName,
        email,
        cvFile: cvBase64,
        applyDate: new Date().toLocaleString()
    };

    applications.push(app);
    localStorage.setItem("applications", JSON.stringify(applications));

    alert("Application submitted successfully!");
    window.location.href = "../HomePage/Student-homepage.html";
});
