// Biến toàn cục để lưu trữ dữ liệu công việc đã được lọc theo Employer
let allJobs = []; 
let currentUser = null;

/**
 * 1. Khởi tạo thông tin người dùng hiện tại
 */
function initCurrentUser() {
    try {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            currentUser = JSON.parse(userData);
            console.log('Current user loaded:', currentUser);
        } else {
            console.log('No current user found in localStorage');
            // Chuyển hướng về trang login nếu cần thiết
            // window.location.href = "../../General/Login/Login.html";
        }
    } catch (e) {
        console.error('Error parsing current_user:', e);
        currentUser = null;
    }
}

/**
 * 2. Tải và LỌC dữ liệu công việc theo Employer ID
 */
function loadJobsFromLocalStorage() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    allJobs = []; // Reset danh sách trước khi nạp

    if (!currentUser || !currentUser.EmployerID) {
        console.warn('Cannot load jobs: Employer not logged in.');
        return;
    }
    
    try {
        const allJobsRaw = storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
        
        // CHỈ LẤY những job có userId trùng với ID của người đang đăng nhập
        allJobs = allJobsRaw.filter(job => job.userId === currentUser.EmployerID);
        
        console.log(`Loaded ${allJobs.length} jobs for employer: ${currentUser.EmployerID}`);
    } catch (e) {
        console.error('Error loading jobs:', e);
        allJobs = [];
    }
}

/**
 * 3. Hiển thị danh sách công việc vào bảng HTML
 */
function renderJobList(jobsToDisplay) {
    const tbody = document.getElementById('jobListBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = ''; 

    if (!jobsToDisplay || jobsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No jobs posted yet.</td></tr>';
        return;
    }

    jobsToDisplay.forEach(job => {
        const row = tbody.insertRow();
        
        // Cột Job Title
        const titleCell = row.insertCell();
        titleCell.innerHTML = `<a href="#" class="job-title-link" onclick="showJobDetails('${job.jobId}'); event.preventDefault();">${job.jobTitle}</a>`;
        
        // Cột Post Date
        const dateCell = row.insertCell();
        const timestamp = job.postDate ? job.postDate : Date.now();
        const date = new Date(timestamp);
        dateCell.textContent = date.toLocaleDateString('vi-VN'); 
        
        // Cột Hành động (CRUD)
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
}

/**
 * 4. Hàm Tìm kiếm (Chỉ tìm trên danh sách đã lọc)
 */
function filterJobs() {
    const searchTerm = document.getElementById('searchJob').value.toLowerCase().trim();
    
    // Luôn dựa trên biến allJobs (đã được lọc theo chủ sở hữu)
    if (!searchTerm) {
        renderJobList(allJobs); 
        return;
    }
    
    const filteredJobs = allJobs.filter(job => 
        (job.jobTitle && job.jobTitle.toLowerCase().includes(searchTerm)) ||
        (job.field && job.field.toLowerCase().includes(searchTerm)) ||
        (job.location && job.location.toLowerCase().includes(searchTerm))
    );
    
    renderJobList(filteredJobs);
}

/**
 * 5. Xóa công việc (Có kiểm tra quyền sở hữu)
 */
function deleteJob(jobId) {
    if (confirm(`Are you sure you want to delete Job ID: ${jobId}?`)) {
        // Lấy lại dữ liệu thô từ Storage để thao tác xóa
        let allStoredJobs = JSON.parse(localStorage.getItem('postedJobs')) || [];
        
        // Tìm đúng job cần xóa dựa trên ID job VÀ ID người dùng
        const jobIndex = allStoredJobs.findIndex(j => 
            j.jobId === jobId && j.userId === currentUser.EmployerID
        );

        if (jobIndex !== -1) {
            allStoredJobs.splice(jobIndex, 1);
            localStorage.setItem('postedJobs', JSON.stringify(allStoredJobs));
            
            // Cập nhật lại bộ nhớ tạm và giao diện
            loadJobsFromLocalStorage(); 
            renderJobList(allJobs);
            alert(`Job deleted successfully.`);
        } else {
            alert('Error: You do not have permission to delete this job.');
        }
    }
}

/**
 * 6. Quản lý ứng viên
 */
function manageCandidates(jobId) {    
    localStorage.setItem("managing_job_ID", JSON.stringify(jobId)); 
    window.location.href = "manage_candicate.html"; 
}

/**
 * 7. Xem chi tiết công việc (Modal)
 */
function showJobDetails(jobId) {
    const job = allJobs.find(j => j.jobId === jobId);
    if (!job) return;
    
    document.getElementById('modalJobTitle').textContent = job.jobTitle;
    const detailsDiv = document.getElementById('jobDetails');
    
    const logoHtml = job.avatar ? `<img src="${job.avatar}" style="max-width: 100px;">` : 'N/A';
    
    detailsDiv.innerHTML = `
        <p><strong>Job ID:</strong> ${job.jobId}</p>
        <p><strong>Company:</strong> ${job.companyName}</p>
        <p><strong>Field:</strong> ${job.field}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Salary:</strong> ${job.salary.toLocaleString()} VND</p>
        <p><strong>Experience:</strong> ${job.experience.min} - ${job.experience.max} ${job.experience.currency}</p>
        <p><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
        <p><strong>Description:</strong></p>
        <pre style="white-space: pre-wrap;">${job.description}</pre>
        <p><strong>Company Logo:</strong></p>
        <div>${logoHtml}</div>
    `;

    document.getElementById('jobDetailModal').style.display = 'block';
}

/**
 * 8. Đóng Modal
 */
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/**
 * 9. Mở Modal chỉnh sửa
 */
function openEditModal(jobId) {
    const job = allJobs.find(j => j.jobId === jobId);
    if (!job) return;

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

    document.getElementById('editJobModal').style.display = 'block';
}

/**
 * 10. Lưu chỉnh sửa
 */
async function saveEditedJob() {
    const jobId = document.getElementById('editJobId').value;
    let allStoredJobs = JSON.parse(localStorage.getItem('postedJobs')) || [];
    const jobIdx = allStoredJobs.findIndex(j => j.jobId === jobId && j.userId === currentUser.EmployerID);

    if (jobIdx === -1) {
        alert('Permission denied or Job not found.');
        return;
    }

    // Cập nhật dữ liệu từ form
    const updatedJob = {
        ...allStoredJobs[jobIdx],
        jobTitle: document.getElementById('editJobTitle').value.trim(),
        field: document.getElementById('editField').value.trim(),
        description: document.getElementById('editDescription').value.trim(),
        salary: parseInt(document.getElementById('editSalary').value),
        location: document.getElementById('editLocation').value.trim(),
        experience: {
            min: parseInt(document.getElementById('editExperienceMin').value),
            max: parseInt(document.getElementById('editExperienceMax').value),
            currency: document.getElementById('editExperienceCurrency').value
        },
        deadline: document.getElementById('editDeadline').value,
        numberOfVacancy: parseInt(document.getElementById('editNumberOfVacancy').value)
    };

    // Xử lý Logo nếu có upload mới
    const avatarInput = document.getElementById('editAvatar');
    if (avatarInput.files.length > 0) {
        updatedJob.avatar = await convertFileToBase64(avatarInput.files[0]);
    }

    allStoredJobs[jobIdx] = updatedJob;
    localStorage.setItem('postedJobs', JSON.stringify(allStoredJobs));

    alert('Updated successfully!');
    closeModal('editJobModal');
    loadJobsFromLocalStorage();
    renderJobList(allJobs);
}

// Khởi tạo khi trang sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    initCurrentUser();
    loadJobsFromLocalStorage();
    renderJobList(allJobs);
    
    // Đóng modal khi nhấn ra ngoài
    window.onclick = function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = "none";
        }
    }
});