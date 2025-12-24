// ==================== POST JOB ====================

/**
 * Clear form content after successful job posting
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
 * Handle form submission and save data with EmployerID
 */
async function handleSubmit() { 
    // Get current user information
    const currentUser = getCurrentUser(); 
    
    // Authorization check: Must have EmployerID
    if (!currentUser || !currentUser.EmployerID) {
        alert('Error: You must be logged in as an Employer to post a job!');
        return;
    }

    // Retrieve input data
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

    // Validation: Check if required fields are filled
    if (
        !jobTitle || !field || !description || 
        !salary || !location ||
        !experienceMin || !experienceMax || 
        !requirement || !deadline || !benefit || !numberOfVacancy
    ) {
        alert('You need to fill all the required information!');
        return;
    }
    
    // Create new job data object
    const newJobData = {
        jobId: generateJobId(), // Auto-generate ID e.g., JD001
        jobTitle: jobTitle,
        field: field,
        companyName: currentUser.companyName || 'Unknown Company', 
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
        avatar: currentUser.avatar || '', // Company logo
        postDate: Date.now(),
        // OWNER IDENTIFICATION: Link to EmployerID for filtering
        userId: currentUser.EmployerID 
    };

    // Save job to global list
    saveJobToLocalStorage(newJobData);

    // Initialize and send system notification
    initNotificationStorage(); 
    addNotificationToStorage({
        avatar: newJobData.avatar, 
        content: `<b>${newJobData.companyName}</b> posted a new job: <b>${newJobData.jobTitle}</b>.`,
        jobId: newJobData.jobId,
        recipientId: undefined 
    });
    
    alert('Job posted successfully! It will now appear in your management dashboard.');
    clearForm();
}