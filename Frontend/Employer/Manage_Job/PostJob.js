// ==================== POST JOB ====================

/**
 * Xóa nội dung form sau khi đăng tin thành công
 */
function clearForm() {
    const formElements = document.querySelectorAll('#jobTitle, #field, #description, #salary, #location, #experienceMin, #experienceMax, #requirement, #deadline, #benefit, #numberOfVacancy');

    formElements.forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        }
    });
}

/**
 * Xử lý sự kiện gửi form và lưu dữ liệu kèm theo EmployerID
 */
async function handleSubmit() { 
    // Lấy thông tin người dùng hiện tại từ localStorage
    const currentUser = getCurrentUser(); 
    
    // Kiểm tra tính hợp lệ của người dùng: Phải có EmployerID mới được đăng bài
    if (!currentUser || !currentUser.EmployerID) {
        alert('Error: You must be logged in as an Employer to post a job!');
        return;
    }

    // Lấy dữ liệu từ các trường nhập liệu
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const field = document.getElementById('field').value.trim();
    const description = document.getElementById('description').value.trim();
    const salary = document.getElementById('salary').value.trim();
    const location = document.getElementById('location').value.trim();
    const experienceMin = document.getElementById('experienceMin').value.trim();
    const experienceMax = document.getElementById('experienceMax').value.trim();
    const requirement = document.getElementById('requirement').value.trim();
    const deadline = document.getElementById('deadline').value.trim();
    const benefit = document.getElementById('benefit').value.trim();
    const numberOfVacancy = document.getElementById('numberOfVacancy').value.trim();

    // Kiểm tra xem tất cả các thông tin bắt buộc đã được điền chưa
    if (
        !jobTitle || !field || !description || 
        !salary || !location ||
        !experienceMin || !experienceMax || 
        !requirement || !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    // Tạo đối tượng dữ liệu công việc mới
    const newJobData = {
        jobId: generateJobId(), // Tự động tạo ID dạng JDxxx
        jobTitle: jobTitle,
        field: field,
        companyName: currentUser.companyName || 'Unknown Company', // Lấy từ thông tin Employer
        description: description,
        location: location,
        salary: parseInt(salary),
        experience: {
            min: parseInt(experienceMin),
            max: parseInt(experienceMax),
            currency: 'years'
        },
        requirement: requirement,
        deadline: deadline,
        benefit: benefit,
        numberOfVacancy: parseInt(numberOfVacancy),
        avatar: currentUser.avatar || '', // Logo của công ty
        postDate: Date.now(),
        // ĐỊNH DANH NGƯỜI ĐĂNG: Sử dụng EmployerID để lọc sau này
        userId: currentUser.EmployerID 
    };

    // Lưu công việc vào danh sách chung trong localStorage
    saveJobToLocalStorage(newJobData);

    // Khởi tạo và gửi thông báo hệ thống
    initNotificationStorage(); 
    addNotificationToStorage({
        avatar: newJobData.avatar, 
        content: `<b>${newJobData.companyName}</b> posted a new job: <b>${newJobData.jobTitle}</b>.`,
        jobId: newJobData.jobId,
        recipientId: undefined 
    });
    
    alert('Job posted successfully! It will now only appear in your management dashboard.');
    clearForm();
}