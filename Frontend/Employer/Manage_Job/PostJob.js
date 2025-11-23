// ==================== POST JOB ====================
// ✅ KHÔNG KHAI BÁO currentUser Ở ĐÂY NỮA!

/**
 * Xóa nội dung form
 */
function clearForm() {
    const formElements = document.querySelectorAll('#jobTitle, #field, #description, #companyName, #salaryMin, #salaryMax, #salaryCurrency, #location, #experienceMin, #experienceMax, #experienceCurrency, #requirement, #deadline, #benefit, #numberOfVacancy, #avatar');

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
    const companyName = document.getElementById('companyName').value.trim();
    
    const salaryMin = document.getElementById('salaryMin').value.trim();
    const salaryMax = document.getElementById('salaryMax').value.trim();
    const salaryCurrency = document.getElementById('salaryCurrency').value.trim();
    
    const location = document.getElementById('location').value.trim();
    
    const experienceMin = document.getElementById('experienceMin').value.trim();
    const experienceMax = document.getElementById('experienceMax').value.trim();
    const experienceCurrency = document.getElementById('experienceCurrency').value.trim();
    
    const requirement = document.getElementById('requirement').value.trim();
    const deadline = document.getElementById('deadline').value.trim();
    const benefit = document.getElementById('benefit').value.trim();
    const numberOfVacancy = document.getElementById('numberOfVacancy').value.trim();
    
    const avatarInput = document.getElementById('avatar');
    const avatarFile = avatarInput.files.length > 0 ? avatarInput.files[0] : null;

    // Validation
    if (
        !jobTitle || !field || !description || !companyName || 
        !salaryMin || !salaryMax || !salaryCurrency || !location ||
        !experienceMin || !experienceMax || !experienceCurrency || 
        !requirement || !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    const minSal = parseInt(salaryMin);
    const maxSal = parseInt(salaryMax);
    const minExp = parseInt(experienceMin);
    const maxExp = parseInt(experienceMax);

    if (minSal >= maxSal) {
        alert('Salary Min must be less than Salary Max.');
        return;
    }
    if (minExp > maxExp) {
        alert('Experience Min must be less than or equal to Experience Max.');
        return;
    }

    // Đọc file avatar
    let avatarBase64 = null;
    try {
        avatarBase64 = await convertFileToBase64(avatarFile);
    } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading image file. Please try again.");
        return;
    }

    // Tạo object job mới
    const newJobData = {
        jobId: generateJobId(),
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
        numberOfVacancy: parseInt(numberOfVacancy),
        avatar: avatarBase64,
        postDate: Date.now(),
        userId: currentUser && currentUser.EmployerID ? currentUser.EmployerID : 'GUEST'
    };

    // ✅ Lưu vào localStorage bằng hàm shared
    saveJobToLocalStorage(newJobData);
    
    alert('Job posted successfully! Data saved locally.');
    clearForm();
}