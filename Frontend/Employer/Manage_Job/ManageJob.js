// Biến toàn cục để lưu trữ dữ liệu công việc
let allJobs = []; 
let currentUser = null;

// Hàm khởi tạo currentUser an toàn
function initCurrentUser() {
    try {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('Current user loaded:', currentUser);
        } else {
            console.log('No current user found in localStorage');
        }
    } catch (e) {
        console.error('Error parsing current_user:', e);
        currentUser = null;
    }
}

/**
 * 1. Tải TẤT CẢ dữ liệu công việc từ localStorage
 * @returns {Array} Mảng tất cả các đối tượng công việc
 */
function loadJobsFromLocalStorage() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    
    console.log('Loading jobs from localStorage...');
    console.log('Raw data:', storedJobsJSON);
    
    try {
        const allJobsRaw = storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
        console.log('All jobs parsed:', allJobsRaw);
        
        // Kiểm tra currentUser
        if (!currentUser) {
            console.warn('No current user - showing all jobs (or none if filtering is required)');
            allJobs = allJobsRaw; // Tạm thời hiển thị tất cả để debug
            return allJobs;
        }
        
        // Lọc job theo userId
        if (currentUser.role === 'Employer' && currentUser.EmployerID) {
            allJobs = allJobsRaw.filter(job => {
                console.log(`Checking job ${job.jobId}: userId="${job.userId}" vs EmployerID="${currentUser.EmployerID}"`);
                return job.userId === currentUser.EmployerID;
            });
            console.log('Filtered jobs for employer:', allJobs);
        } else {
            console.warn('User is not an Employer or missing EmployerID');
            allJobs = [];
        }
        
    } catch (e) {
        console.error("Lỗi khi phân tích cú pháp dữ liệu localStorage:", e);
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
    
    if (!tbody) {
        console.error('Element jobListBody not found!');
        return;
    }
    
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
        
        // Cột Post Date
        const dateCell = row.insertCell();
        const timestamp = job.postDate ? job.postDate : parseInt(job.jobId.replace('JD', ''));
        const date = new Date(timestamp);
        dateCell.textContent = date.toLocaleDateString('vi-VN'); 
        
        const crudCell = row.insertCell();
        crudCell.classList.add('crud-buttons');
        crudCell.innerHTML = `
        <button class="manage-btn" title="Manage candidate" onclick="manageCandidates('${job.jobId}')">
            <ion-icon name="people-outline"></ion-icon>
        </button> 
        <button class="edit-btn" title="Edit job post" onclick="openEditModal('${job.jobId}')">
            <ion-icon name="create-outline"></ion-icon>
        </button> 
        <button class="delete-btn" title="Delete job post" onclick="deleteJob('${job.jobId}')">
            <ion-icon name="trash-outline"></ion-icon>
        </button>
        `;
    });
    
    console.log(`Rendered ${jobsToDisplay.length} jobs to table`);
}

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

    document.getElementById('editJobId').value = jobId;
    document.getElementById('editJobIdDisplay').textContent = jobId;
    
    document.getElementById('editJobTitle').value = job.jobTitle;
    document.getElementById('editField').value = job.field;
    document.getElementById('editDescription').value = job.description;
    document.getElementById('editCompanyName').value = job.companyName;
    
    document.getElementById('editSalary').value = job.salary;
    
    document.getElementById('editLocation').value = job.location;
    
    document.getElementById('editExperienceMin').value = job.experience.min;
    document.getElementById('editExperienceMax').value = job.experience.max;
    document.getElementById('editExperienceCurrency').value = job.experience.currency;
    
    document.getElementById('editRequirement').value = job.requirement;
    document.getElementById('editDeadline').value = job.deadline; 
    
    document.getElementById('editBenefit').value = job.benefit;
    document.getElementById('editNumberOfVacancy').value = job.numberOfVacancy;

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
    
    const jobTitle = document.getElementById('editJobTitle').value.trim();
    const field = document.getElementById('editField').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const companyName = document.getElementById('editCompanyName').value.trim();
    
    const salary = document.getElementById('editSalary').value.trim();

    
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

    if (
        !jobTitle || !field || !description || !companyName || 
        !salary || !location ||
        !experienceMin || !experienceMax || !experienceCurrency || 
        !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    const Sal = parseInt(salary);
    const minExp = parseInt(experienceMin);
    const maxExp = parseInt(experienceMax);
    const numVacancy = parseInt(numberOfVacancy);

    if (minExp > maxExp || isNaN(numVacancy) || numVacancy <= 0) {
        alert('Check experience ranges and vacancy number.');
        return;
    }

    let avatarBase64 = job.avatar;
    if (avatarFile) {
        avatarBase64 = await convertFileToBase64(avatarFile); 
    }
    
    const updatedJobData = {
        jobId: jobId, 
        jobTitle: jobTitle,
        field: field,
        companyName: companyName,
        description: description,
        location: location,
        salary: Sal,
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
        postDate: job.postDate || Date.now(),
        userId: job.userId || 'unknown'
    };

    if (updateJobInLocalStorage(updatedJobData)) {
        alert(`Job ID: ${jobId} updated successfully!`);
        closeModal('editJobModal');
        loadJobsFromLocalStorage(); 
        renderJobList(allJobs);
    }
}

/**
 * Cập nhật job đã chỉnh sửa vào Local Storage
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
 * Đóng Modal
 */
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/**
 * Hiển thị chi tiết công việc trong Modal
 */
function showJobDetails(jobId) {
    console.log("Showing details for Job ID:", jobId); 

    const job = allJobs.find(j => j.jobId === jobId);
    
    if (!job) {
        alert('Job not found!');
        return;
    }
    
    document.getElementById('modalJobTitle').textContent = job.jobTitle;
    const detailsDiv = document.getElementById('jobDetails');
    
    let logoHtml = '';
    if (job.avatar) {
        logoHtml = `<img src="${job.avatar}" alt="${job.companyName} Logo" style="max-width: 100px; max-height: 100px; display: block; margin-top: 5px; border: 1px solid #ddd; padding: 5px; background-color: white;">`;
    } else {
        logoHtml = 'N/A';
    }
    
    detailsDiv.innerHTML = `
        <p><strong>Job ID:</strong> ${job.jobId}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Field:</strong> ${job.field}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
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
    localStorage.setItem("managing_job_ID", JSON.stringify(jobId)); 
    window.location.href = "../Manage_Job/manage_candicate.html"; 
}

function deleteJob(jobId) {
    if (confirm(`Bạn có chắc chắn muốn xóa Job ID: ${jobId} không?`)) {
        const allStoredJobs = getAllJobsRaw();
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

function getAllJobsRaw() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    try {
        return storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        console.error('Error parsing postedJobs:', e);
        return [];
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    console.log('ManageJob page loaded');
    
    // Khởi tạo currentUser trước
    initCurrentUser();
    
    // Load và render jobs
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