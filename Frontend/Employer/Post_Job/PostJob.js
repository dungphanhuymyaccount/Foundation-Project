/**
 * Hàm hỗ trợ: Xóa nội dung tất cả các trường trong form
 */
function clearForm() {
    // Thêm #avatar vào danh sách các trường cần xóa nội dung (value)
    const formElements = document.querySelectorAll('#jobTitle, #field, #description, #companyName, #salaryMin, #salaryMax, #salaryCurrency, #location, #experienceMin, #experienceMax, #experienceCurrency, #requirement, #deadline, #benefit, #numberOfVacancy, #avatar');

    formElements.forEach(element => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // Đối với input type="file", cần set value = "" để xóa tệp đã chọn
            element.value = '';
        }
        // Giữ lại giá trị mặc định cho Experience Unit là 'years'
        if (element.id === 'experienceCurrency') {
            element.value = 'years';
        }
    });
}

/**
 * Tải dữ liệu công việc từ localStorage
 * @returns {Array} Mảng các đối tượng công việc
 */
function loadJobsFromLocalStorageForIdGeneration() {
    const storedJobsJSON = localStorage.getItem('postedJobs');
    try {
        return storedJobsJSON ? JSON.parse(storedJobsJSON) : [];
    } catch (e) {
        console.error("Lỗi khi phân tích cú pháp dữ liệu localStorage. Bắt đầu với mảng rỗng.", e);
        return [];
    }
}

/**
 * Tạo ID công việc mới theo định dạng JD00001, JD00002, ...
 * @returns {string} ID công việc mới
 */
function generateNextJobId() {
    const postedJobs = loadJobsFromLocalStorageForIdGeneration();
    let maxIdNumber = 0;
    
    if (postedJobs.length > 0) {
        postedJobs.forEach(job => {
            // ID có dạng 'JDxxxxx', loại bỏ 'JD' và chuyển thành số
            const idNumber = parseInt(job.jobId.replace('JD', '')); 
            if (!isNaN(idNumber) && idNumber > maxIdNumber) {
                maxIdNumber = idNumber;
            }
        });
    }

    const nextIdNumber = maxIdNumber + 1;
    // Chuyển số thành chuỗi 5 chữ số có padding ('00001')
    const paddedId = String(nextIdNumber).padStart(5, '0');
    
    return `JD${paddedId}`;
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

/**
 * Chuyển đổi đối tượng File thành chuỗi Base64 (Data URL).
 * @param {File | null} file - Tệp hình ảnh được chọn.
 * @returns {Promise<string | null>} Chuỗi Base64 hoặc null.
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

// Chuyển hàm thành async để sử dụng await cho việc đọc file
async function handleSubmit() { 
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
    
    // Lấy đối tượng FileList và File từ input type="file"
    const avatarInput = document.getElementById('avatar');
    const avatarFile = avatarInput.files.length > 0 ? avatarInput.files[0] : null;

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

    // ĐỌC TỆP VÀ CHUYỂN THÀNH BASE64 BẤT ĐỒNG BỘ
    let avatarBase64 = null;
    try {
        avatarBase64 = await convertFileToBase64(avatarFile);
    } catch (error) {
        console.error("Error reading file:", error);
        alert("Lỗi khi đọc tệp hình ảnh. Vui lòng thử lại.");
        return;
    }

    // 2. Tạo đối tượng dữ liệu (Data Object)
    const newJobData = {
        // Cập nhật ID mới theo định dạng JD00001
        jobId: generateNextJobId(), 
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
        // *** THÊM TRƯỜNG postDate để lưu thời gian đăng bài ***
        postDate: Date.now() 
    };

    // 3. LƯU DỮ LIỆU VÀO LOCALSTORAGE
    saveToLocalStorage(newJobData);
    
    alert('Job posted successfully! Data saved locally.');
    
    // 4. Xóa form sau khi gửi thành công
    clearForm();
}