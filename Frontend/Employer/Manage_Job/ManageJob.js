// Biến toàn cục để lưu trữ dữ liệu công việc
let allJobs = []; 

/**
 * 1. Tải TẤT CẢ dữ liệu công việc từ localStorage (Tạm thời không lọc theo người dùng)
 * @returns {Array} Mảng tất cả các đối tượng công việc
 */
function loadJobsFromLocalStorage() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    
    try {
        // Tải toàn bộ job vào allJobs
        allJobs = storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        console.error("Lỗi khi phân tích cú pháp dữ liệu localStorage.", e);
        allJobs = [];
    }
    
    return allJobs;
}

/**
 * 2. Hiển thị danh sách công việc vào bảng HTML
 * @param {Array} jobsToDisplay - Mảng công việc cần hiển thị
 */
function renderJobList(jobsToDisplay) {
    const tbody = document.getElementById('jobListBody');
    tbody.innerHTML = ''; // Xóa nội dung cũ

    if (jobsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No jobs posted yet or no matching results.</td></tr>';
        return;
    }

    jobsToDisplay.forEach(job => {
        const row = tbody.insertRow();
        
        // Cột Job Title
        const titleCell = row.insertCell();
        titleCell.innerHTML = `<a href="#" class="job-title-link" onclick="showJobDetails('${job.jobId}'); event.preventDefault();">${job.jobTitle}</a>`;
        
        // Cột Post Date (Sử dụng postDate mới, hoặc giả lập từ jobId cũ nếu thiếu)
        const dateCell = row.insertCell();
        const timestamp = job.postDate ? job.postDate : parseInt(job.jobId.replace('JD', ''));
        const date = new Date(timestamp);
        dateCell.textContent = date.toLocaleDateString('vi-VN'); 
        
        const crudCell = row.insertCell();
        crudCell.classList.add('crud-buttons');
        crudCell.innerHTML = `
            <button class="manage-btn" onclick="manageCandidates('${job.jobId}')">👥</button> 
            <button class="edit-btn" onclick="openEditModal('${job.jobId}')">✅</button> 
            <button class="delete-btn" onclick="deleteJob('${job.jobId}')">❌</button>
        `;
    });
}


// POPUP EDIT (MỚI)

/**
 * Mở Modal chỉnh sửa và điền dữ liệu
 * @param {string} jobId - ID của công việc cần chỉnh sửa
 */
function openEditModal(jobId) {
    const job = allJobs.find(j => j.jobId === jobId);
    
    if (!job) {
        alert('Job not found!');
        return;
    }

    // Lưu ID vào trường ẩn
    document.getElementById('editJobId').value = jobId;
    document.getElementById('editJobIdDisplay').textContent = jobId;
    
    // Điền dữ liệu vào form
    document.getElementById('editJobTitle').value = job.jobTitle;
    document.getElementById('editField').value = job.field;
    document.getElementById('editDescription').value = job.description;
    document.getElementById('editCompanyName').value = job.companyName;
    
    document.getElementById('editSalaryMin').value = job.salary.min;
    document.getElementById('editSalaryMax').value = job.salary.max;
    document.getElementById('editSalaryCurrency').value = job.salary.currency;
    
    document.getElementById('editLocation').value = job.location;
    
    document.getElementById('editExperienceMin').value = job.experience.min;
    document.getElementById('editExperienceMax').value = job.experience.max;
    document.getElementById('editExperienceCurrency').value = job.experience.currency;
    
    document.getElementById('editRequirement').value = job.requirement;
    document.getElementById('editDeadline').value = job.deadline; 
    
    document.getElementById('editBenefit').value = job.benefit;
    document.getElementById('editNumberOfVacancy').value = job.numberOfVacancy;

    // Hiển thị logo hiện tại (nếu có)
    const currentLogoDiv = document.getElementById('currentLogoDisplay');
    if (job.avatar) {
        currentLogoDiv.innerHTML = `<img src="${job.avatar}" style="max-width: 80px; max-height: 80px;"> <small>(Current Logo)</small>`;
    } else {
        currentLogoDiv.innerHTML = `<small>(No current logo)</small>`;
    }
    
    document.getElementById('editJobModal').style.display = 'block';
}

/**
 * Lưu dữ liệu job đã chỉnh sửa
 */
async function saveEditedJob() {
    const jobId = document.getElementById('editJobId').value;
    const job = allJobs.find(j => j.jobId === jobId);

    if (!job) {
        alert('Lỗi: Công việc không tìm thấy!');
        return;
    }
    
    // Lấy dữ liệu mới từ form
    const jobTitle = document.getElementById('editJobTitle').value.trim();
    const field = document.getElementById('editField').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const companyName = document.getElementById('editCompanyName').value.trim();
    
    const salaryMin = document.getElementById('editSalaryMin').value.trim();
    const salaryMax = document.getElementById('editSalaryMax').value.trim();
    const salaryCurrency = document.getElementById('editSalaryCurrency').value.trim();
    
    const location = document.getElementById('editLocation').value.trim();
    
    const experienceMin = document.getElementById('editExperienceMin').value.trim();
    const experienceMax = document.getElementById('editExperienceMax').value.trim();
    const experienceCurrency = document.getElementById('editExperienceCurrency').value.trim();
    
    const requirement = document.getElementById('editRequirement').value.trim();
    const deadline = document.getElementById('editDeadline').value.trim();
    const benefit = document.getElementById('editBenefit').value.trim();
    const numberOfVacancy = document.getElementById('editNumberOfVacancy').value.trim();
    
    const avatarInput = document.getElementById('editAvatar');
    const avatarFile = avatarInput.files.length > 0 ? avatarInput.files[0] : null;

    // 1. Validation (Tối thiểu)
    if (
        !jobTitle || !field || !description || !companyName || 
        !salaryMin || !salaryMax || !salaryCurrency || !location ||
        !experienceMin || !experienceMax || !experienceCurrency || 
        !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    const minSal = parseInt(salaryMin);
    const maxSal = parseInt(salaryMax);
    const minExp = parseInt(experienceMin);
    const maxExp = parseInt(experienceMax);
    const numVacancy = parseInt(numberOfVacancy);

    if (minSal >= maxSal || minExp > maxExp || isNaN(numVacancy) || numVacancy <= 0) {
        alert('Check salary/experience ranges and vacancy number.');
        return;
    }

    // 2. Xử lý Logo (Sử dụng hàm từ PostJob.js)
    let avatarBase64 = job.avatar; // Giữ lại avatar cũ
    if (avatarFile) {
        // LƯU Ý: Phải đảm bảo hàm convertFileToBase64() có thể được truy cập
        avatarBase64 = await convertFileToBase64(avatarFile); 
    }
    
    // 3. Tạo đối tượng dữ liệu đã cập nhật
    const updatedJobData = {
        jobId: jobId, 
        jobTitle: jobTitle,
        field: field,
        companyName: companyName,
        description: description,
        location: location,
        salary: {
            min: minSal,
            max: maxSal,
            currency: salaryCurrency
        },
        experience: {
            min: minExp,
            max: maxExp,
            currency: experienceCurrency
        },
        requirement: requirement,
        deadline: deadline,
        benefit: benefit,
        numberOfVacancy: numVacancy,
        avatar: avatarBase64,
        postDate: job.postDate || Date.now(), // Giữ nguyên ngày đăng bài
        userId: job.userId || 'unknown' // Giữ nguyên ID người dùng (nếu có)
    };

    // 4. CẬP NHẬT DỮ LIỆU VÀO LOCALSTORAGE
    if (updateJobInLocalStorage(updatedJobData)) {
        alert(`Job ID: ${jobId} updated successfully!`);
        closeModal('editJobModal');
        // Tải lại dữ liệu và render bảng
        loadJobsFromLocalStorage(); 
        renderJobList(allJobs);
    }
}

/**
 * Cập nhật job đã chỉnh sửa vào Local Storage (Ghi đè)
 */
function updateJobInLocalStorage(updatedJobData) {
    let postedJobs = loadAllJobsFromStorageForDeletion();
    const index = postedJobs.findIndex(job => job.jobId === updatedJobData.jobId);
    
    if (index !== -1) {
        postedJobs[index] = updatedJobData;
        localStorage.setItem('postedJobs', JSON.stringify(postedJobs));
        return true;
    }
    return false;
}


/**
 * Đóng Modal chi tiết hoặc Modal chỉnh sửa
 * @param {string} modalId - ID của Modal cần đóng
 */
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/**
 * 3. Hiển thị chi tiết công việc trong Modal
 * @param {string} jobId - ID của công việc cần hiển thị
 */
function showJobDetails(jobId) {
    console.log("Job ID đang được kiểm tra:", jobId); 

    // Tìm job trong mảng chung allJobs
    const job = allJobs.find(j => j.jobId === jobId);
    
    if (!job) {
        alert('Job not found!');
        return;
    }
    
    document.getElementById('modalJobTitle').textContent = job.jobTitle;
    const detailsDiv = document.getElementById('jobDetails');
    
    // Xử lý hiển thị logo từ Base64
    let logoHtml = '';
    if (job.avatar) {
        logoHtml = `<img src="${job.avatar}" alt="${job.companyName} Logo" style="max-width: 100px; max-height: 100px; display: block; margin-top: 5px; border: 1px solid #ddd; padding: 5px; background-color: white;">`;
    } else {
        logoHtml = 'N/A';
    }
    
    // Format nội dung chi tiết ĐẦY ĐỦ
    detailsDiv.innerHTML = `
        <p><strong>Job ID:</strong> ${job.jobId}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Field:</strong> ${job.field}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Salary:</strong> ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} ${job.salary.currency}</p>
        <p><strong>Experience:</strong> ${job.experience.min} to ${job.experience.max} ${job.experience.currency}</p>
        <p><strong>Vacancy:</strong> ${job.numberOfVacancy}</p>
        <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
        <p><strong>Requirement:</strong> ${job.requirement || 'N/A'}</p>
        <p><strong>Benefit:</strong> ${job.benefit || 'N/A'}</p>
        <p><strong>Company Logo:</strong></p>
        <div>${logoHtml}</div> 
        <p><strong>Description:</strong></p>
        <pre>${job.description}</pre>
    `;

    document.getElementById('jobDetailModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}


function filterJobs() {
    const searchTerm = document.getElementById('searchJob').value.toLowerCase().trim();
    if (!searchTerm) {
        renderJobList(allJobs); 
        return;
    }
    
    const filteredJobs = allJobs.filter(job => 
        job.jobTitle.toLowerCase().includes(searchTerm) ||
        job.companyName.toLowerCase().includes(searchTerm) ||
        job.field.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
    );
    
    renderJobList(filteredJobs);
}

function manageCandidates(jobId) {
    alert(`Chức năng Quản lý ứng viên cho Job ID: ${jobId} sẽ được phát triển sau!`);
}

function deleteJob(jobId) {
    if (confirm(`Bạn có chắc chắn muốn xóa Job ID: ${jobId} không?`)) {
        const allStoredJobs = loadAllJobsFromStorageForDeletion();
        const jobIndex = allStoredJobs.findIndex(j => j.jobId === jobId);

        if (jobIndex > -1) {
            allStoredJobs.splice(jobIndex, 1);
            localStorage.setItem('postedJobs', JSON.stringify(allStoredJobs));
            
            loadJobsFromLocalStorage(); 
            renderJobList(allJobs);
            
            alert(`Job ID: ${jobId} đã được xóa thành công.`);
        } else {
            alert('Lỗi: Không tìm thấy công việc để xóa.');
        }
    }
}

function loadAllJobsFromStorageForDeletion() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    try {
        return storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        return [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadJobsFromLocalStorage();
    renderJobList(allJobs);
    
    // Đóng modal khi click ra ngoài
    window.onclick = function(event) {
        const detailModal = document.getElementById('jobDetailModal');
        const editModal = document.getElementById('editJobModal');
        
        if (event.target == detailModal) {
            detailModal.style.display = "none";
        }
        if (event.target == editModal) {
            editModal.style.display = "none";
        }
    }
});