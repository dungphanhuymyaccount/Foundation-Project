// ==================== SHARED FUNCTIONS ====================
// File này chứa các hàm dùng chung cho PostJob và ManageJob

/**
 * Lấy thông tin user hiện tại từ localStorage
 * @returns {object|null} User object hoặc null
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('current_user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error('Error parsing current_user:', e);
        return null;
    }
}

/**
 * Lấy tất cả jobs từ localStorage (không filter)
 * @returns {Array} Mảng các đối tượng công việc
 */
function getAllJobsRaw() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    try {
        return storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        console.error('Error parsing postedJobs:', e);
        return [];
    }
}

/**
 * Chuyển đổi File thành Base64
 * @param {File | null} file - Tệp hình ảnh
 * @returns {Promise<string | null>} Chuỗi Base64 hoặc null
 */
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null); 
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Tạo ID công việc mới theo định dạng JD001, JD002, ...
 * @returns {string} ID công việc mới
 */
function generateJobId() {
    const postedJobs = getAllJobsRaw();
    
    if (postedJobs.length === 0) {
        return "JD001";
    }

    let maxID = postedJobs.reduce((max, job) => {
        let num = parseInt(job.jobId?.replace("JD", "")) || 0;
        return Math.max(max, num);
    }, 0);

    let nextID = maxID + 1;
    return "JD" + String(nextID).padStart(3, "0");
}

/**
 * Lưu job mới vào localStorage
 * @param {object} jobData - Đối tượng dữ liệu công việc mới
 */
function saveJobToLocalStorage(jobData) {
    let postedJobs = getAllJobsRaw();
    postedJobs.push(jobData);
    localStorage.setItem('postedJobs', JSON.stringify(postedJobs));
    console.log("Job data successfully saved to localStorage");
}

/**
 * Cập nhật job đã tồn tại trong localStorage
 * @param {object} updatedJobData - Đối tượng job đã cập nhật
 * @returns {boolean} True nếu thành công
 */
function updateJobInLocalStorage(updatedJobData) {
    let postedJobs = getAllJobsRaw();
    const index = postedJobs.findIndex(job => job.jobId === updatedJobData.jobId);
    
    if (index !== -1) {
        postedJobs[index] = updatedJobData;
        localStorage.setItem('postedJobs', JSON.stringify(postedJobs));
        return true;
    }
    return false;
}

/**
 * Xóa job khỏi localStorage
 * @param {string} jobId - ID của job cần xóa
 * @returns {boolean} True nếu thành công
 */
function deleteJobFromLocalStorage(jobId) {
    let postedJobs = getAllJobsRaw();
    const index = postedJobs.findIndex(job => job.jobId === jobId);
    
    if (index !== -1) {
        postedJobs.splice(index, 1);
        localStorage.setItem('postedJobs', JSON.stringify(postedJobs));
        return true;
    }
    return false;
}