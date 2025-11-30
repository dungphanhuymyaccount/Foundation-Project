// ==================== POST JOB ====================
// ✅ KHÔNG KHAI BÁO currentUser Ở ĐÂY NỮA!

/**
 * Xóa nội dung form
 */
function clearForm() {
    const formElements = document.querySelectorAll('#jobTitle, #field, #description, #salary, #location, #experienceMin, #experienceMax, #experienceCurrency, #requirement, #deadline, #benefit, #numberOfVacancy, #avatar');

    formElements.forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        }
        if (element.id === 'experienceCurrency') {
            element.value = 'years';
        }
    });
}

/**
 * Xử lý submit form (async để đọc file)
 */
async function handleSubmit() { 
    // ✅ Lấy currentUser từ hàm shared
    const currentUser = getCurrentUser();
    
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const field = document.getElementById('field').value.trim();
    const description = document.getElementById('description').value.trim();
    const jobCompanyName = currentUser && currentUser.companyName ? currentUser.companyName : 'Unknown Company';
    if (jobCompanyName === 'Unknown Company' || !currentUser.EmployerID) {
        alert('Error: Employer data (Company Name or User ID) is missing. Please log in again.');
        return;
    }    
    const salary = document.getElementById('salary').value.trim();
    const location = document.getElementById('location').value.trim();
    const experienceMin = document.getElementById('experienceMin').value.trim();
    const experienceMax = document.getElementById('experienceMax').value.trim();
    const experienceCurrency = document.getElementById('experienceCurrency').value.trim();    
    const requirement = document.getElementById('requirement').value.trim();
    const deadline = document.getElementById('deadline').value.trim();
    const benefit = document.getElementById('benefit').value.trim();
    const numberOfVacancy = document.getElementById('numberOfVacancy').value.trim();
    
    const companyAvatar = currentUser && currentUser.avatar ? currentUser.avatar : 'Unknown Company';
    if (companyAvatar === 'Unknown Company' || !currentUser.EmployerID) {
        alert('Error: Employer data is missing. Please log in again.');
        return;
    }

    // Validation
    if (
        !jobTitle || !field || !description || 
        !salary || !location ||
        !experienceMin || !experienceMax || !experienceCurrency || 
        !requirement || !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    const Sal = parseInt(salary);

    const minExp = parseInt(experienceMin);
    const maxExp = parseInt(experienceMax);

    // Tạo object job mới
    const newJobData = {
        jobId: generateJobId(),
        jobTitle: jobTitle,
        field: field,
        companyName: jobCompanyName,
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
        numberOfVacancy: parseInt(numberOfVacancy),
        avatar: companyAvatar, // logo công ty (base64)
        postDate: Date.now(),
        userId: currentUser && currentUser.EmployerID ? currentUser.EmployerID : 'GUEST'
    };

    // ✅ Lưu vào localStorage bằng hàm shared
    saveJobToLocalStorage(newJobData);

    // Tạo Notification
    initNotificationStorage(); // Đảm bảo storage đúng cấu trúc

addNotificationToStorage({
    avatar: newJobData.avatar, // logo công ty (base64)
    content: `<b>${newJobData.companyName}</b> posted a new job: <b>${newJobData.jobTitle}</b>.`,
    jobId: newJobData.jobId
});
    
    alert('Job posted successfully! Data saved locally.');
    clearForm();
}