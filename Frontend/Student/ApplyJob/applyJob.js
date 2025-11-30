// ==================== APPLY JOB ====================

let currentUser = JSON.parse(localStorage.getItem("current_user"));
let selectedJobId = JSON.parse(localStorage.getItem("selected_job_ID"));
let applications = JSON.parse(localStorage.getItem("applications")) || [];

const msg = document.getElementById("error-message-cv");

/**
 * Khởi tạo form khi load trang
 */
document.addEventListener("DOMContentLoaded", () => {
    // Kiểm tra login
    if (!currentUser) {
        setTimeout(() => {
            alert("You need to log in before applying!");
            window.location.href = "../../General/Login/Login.html";
        }, 300);
        return;
    }
    if (currentUser.role !== "Student") {
        setTimeout(() => {
            alert("You need to log in before applying!");
            window.location.href = "../../General/Login/Login.html";
        }, 300);
        return;

    }

    // Tự động điền thông tin user
    document.getElementById("fullname").value = currentUser.fullName || "";
    document.getElementById("email").value = currentUser.email || "";

    console.log("Current User:", currentUser);
    console.log("Selected Job ID:", selectedJobId);
});

/**
 * Convert File thành Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("File reading error.");
        reader.readAsDataURL(file);
    });
}

/**
 * Generate CV ID mới
 */
function generateCvId() {
    if (applications.length === 0) return "CV001";

    // Tìm ID lớn nhất
    const maxNum = applications.reduce((max, app) => {
        const num = parseInt(app.CvId.replace("CV", "")) || 0;
        return Math.max(max, num);
    }, 0);

    const nextNum = maxNum + 1;
    return "CV" + nextNum.toString().padStart(3, "0");
}

/**
 * Kiểm tra đã apply job này chưa
 */
function alreadyApplied(studentId, jobId) {
    return applications.some(a => a.studentId === studentId && a.jobId === jobId);
}

/**
 * Lưu CV Base64 vào localStorage riêng
 */
function saveCvData(cvId, cvBase64) {
    let cvData = JSON.parse(localStorage.getItem("cvData")) || [];
    cvData.push({
        CvId: cvId,
        cvFileBase64: cvBase64
    });
    localStorage.setItem("cvData", JSON.stringify(cvData));
    console.log("CV saved with ID:", cvId);
}

/**
 * Xóa lỗi khi đổi file
 */
document.getElementById("cvFile").addEventListener("change", () => {
    msg.innerHTML = "";
});

/**
 * Xử lý submit form (CHỈ MỘT LẦN!)
 */
document.getElementById("applyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = ""; // Reset lỗi

    console.log("Form submitted!");

    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const cvFile = document.getElementById("cvFile").files[0];

    // 1. Kiểm tra đã apply chưa
    if (alreadyApplied(currentUser.StudentID, selectedJobId)) {
        alert("You've already applied for this job!");
        return;
    }

    // 2. Kiểm tra CV
    if (!cvFile) {
        msg.innerHTML = "<p>You need to choose a CV before submitting.</p>";
        return;
    }

    // 3. Kiểm tra kích thước file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (cvFile.size > MAX_SIZE) {
        msg.innerHTML = "<p>The file exceeds 5MB. Please choose another one!</p>";
        return;
    }

    // 4. Kiểm tra định dạng file
    if (cvFile.type !== 'application/pdf') {
        msg.innerHTML = "<p>Only PDF files are allowed!</p>";
        return;
    }

    try {
        // 5. Convert CV thành Base64
        console.log("Converting CV to Base64...");
        const cvBase64 = await fileToBase64(cvFile);

        // 6. Generate CV ID mới
        const newCvId = generateCvId();
        console.log("Generated CV ID:", newCvId);

        // 7. Lưu CV Base64 vào cvData (riêng biệt)
        saveCvData(newCvId, cvBase64);

        // 8. Tạo application object (CHỈ LƯU METADATA)
        const app = {
            CvId: newCvId,
            studentId: currentUser.StudentID,
            jobId: selectedJobId,
            fullName: fullName,
            email: email,
            applyDate: new Date().toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: "Pending"
        };

        // 9. Lưu application vào localStorage
        applications.push(app);
        localStorage.setItem("applications", JSON.stringify(applications));

        console.log("Application submitted successfully!", app);

        // Tạo notification cho Employer (thông báo có ứng viên apply)
        try {
            // Đảm bảo cấu trúc notifications tồn tại
            if (typeof initNotificationStorage === 'function') initNotificationStorage();

            // Lấy job để lấy tiêu đề và thông tin công ty
            const postedJobs = JSON.parse(localStorage.getItem('postedJobs')) || [];
            const job = postedJobs.find(j => j.jobId == selectedJobId);
            const jobTitle = job ? job.jobTitle : 'your job';

            if (typeof addNotificationToStorage === 'function') {
                addNotificationToStorage({
                    avatar: currentUser.avatar || '',
                    content: `<b>${currentUser.fullName}</b> applied to your job: <b>${jobTitle}</b>.`,
                    jobId: selectedJobId,
                    recipientId: job && job.userId ? job.userId : null
                });
            }
        } catch (e) {
            console.error('Error creating employer notification:', e);
        }

        alert("Application submitted successfully!");

        // đóng popup + reset form
        document.getElementById("applyForm").reset();
        closeApplyModal?.(); // gọi hàm trong jobDetail.js (nếu có)


    } catch (error) {
        console.error("Error submitting application:", error);
        msg.innerHTML = "<p>An error occurred while submitting. Please try again.</p>";
    }
});