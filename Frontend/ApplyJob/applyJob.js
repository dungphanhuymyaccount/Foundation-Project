let currentUser = JSON.parse(localStorage.getItem("current_user"));
let selectedJobId = JSON.parse(localStorage.getItem("selected_job_ID"));
let applications = JSON.parse(localStorage.getItem("applications")) || [];

const msg = document.getElementById("error-message-cv");

document.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) {
        setTimeout(() => {
            alert("Bạn cần đăng nhập trước khi ứng tuyển!");
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
        reader.onerror = () => reject("Lỗi đọc file");
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

    const fullName = document.querySelector("input[name='fullname']").value.trim();
    const email = document.querySelector("input[name='email']").value.trim();
    const cvFile = document.getElementById("cvFile").files[0];

    // Check trùng ứng tuyển
    if (alreadyApplied(currentUser.StudentID, selectedJobId)) {
        msg.innerHTML = "<p>Bạn đã ứng tuyển công việc này rồi</p>";
        return;
    }

    // Check CV khi submit
    if (!cvFile) {
        msg.innerHTML = "<p>Bạn cần chọn CV trước khi gửi</p>";
        return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (cvFile.size > MAX_SIZE) {
        msg.innerHTML = "<p>File vượt quá 5MB. Bạn hãy chọn file khác!</p>";
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

    alert("Ứng tuyển thành công!");
    window.location.href = "../HomePage/Student-homepage.html";
});
