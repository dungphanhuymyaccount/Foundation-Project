/**
 * Hàm hỗ trợ: Xóa nội dung tất cả các trường trong form
 */
function clearForm() {
    const formElements = document.querySelectorAll('#jobTitle, #field, #description, #companyName, #salaryMin, #salaryMax, #salaryCurrency, #location, #experienceMin, #experienceMax, #experienceCurrency, #requirement, #deadline, #benefit, #numberOfVacancy, #avatar');

    formElements.forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        }
        // Giữ lại giá trị mặc định cho Experience Unit là 'years'
        if (element.id === 'experienceCurrency') {
            element.value = 'years';
        }
    });
}

/**
Lưu đối tượng dữ liệu công việc vào localStorage
 * @param {object} jobData - Đối tượng dữ liệu công việc mới.
 */
function saveToLocalStorage(jobData) {
    // 1. Lấy dữ liệu job hiện có (nếu có) từ localStorage
    const storedJobsJSON = localStorage.getItem('postedJobs');
    let postedJobs = [];
    
    try {
        // Kiểm tra và phân tích cú pháp JSON
        postedJobs = storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        console.error("Lỗi khi phân tích cú pháp dữ liệu localStorage. Bắt đầu với mảng rỗng.", e);
        postedJobs = [];
    }
    
    // 2. Thêm job mới vào mảng
    postedJobs.push(jobData);
    
    // 3. Lưu lại toàn bộ mảng đã cập nhật vào localStorage
    localStorage.setItem('postedJobs', JSON.stringify(postedJobs));

    console.log("Job data successfully saved to localStorage under key 'postedJobs'.");
}

function handleSubmit() {
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
    const avatar = document.getElementById('avatar').value.trim();

    // 1. Validation (Kiểm tra bắt buộc và so sánh min/max)
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


    // 2. Tạo đối tượng dữ liệu (Data Object)
    const newJobData = {
        // Tạo ID giả lập dựa trên thời gian
        jobId: `JD${Date.now()}`, 
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
        avatar: avatar || null
    };

    // 3. LƯU DỮ LIỆU VÀO LOCALSTORAGE
    saveToLocalStorage(newJobData);
    
    alert('Job posted successfully! Data saved locally.');
    
    // 4. Xóa form sau khi gửi thành công
    clearForm();
}