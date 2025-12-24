// ==================== SHARED FUNCTIONS ====================
// This file contains shared functions for PostJob and ManageJob
// Define structure for Notification storage
const MAX_RECENT_NOTIFICATIONS = 5;
function initNotificationStorage() {
    const defaultStructure = {
        recent: [],
        older: []
    };

    if (!localStorage.getItem("notifications")) {
        localStorage.setItem("notifications", JSON.stringify(defaultStructure));
    } else {
        let data = JSON.parse(localStorage.getItem("notifications"));
        let changed = false;

        if (!Array.isArray(data.recent)) { data.recent = []; changed = true; }
        if (!Array.isArray(data.older)) { data.older = []; changed = true; }

        if (data.recent.length > MAX_RECENT_NOTIFICATIONS) {
            // Move items older than the threshold to 'older' list
            const itemsToMove = data.recent.splice(MAX_RECENT_NOTIFICATIONS);
            data.older.unshift(...itemsToMove);
            changed = true;
        }

        if (changed) {
            localStorage.setItem("notifications", JSON.stringify(data));
        }
    }
}

// Create Notification object
function createNotification(data) {
    return {
        avatar: data.avatar || "default-logo.png",
        content: data.content || "",
        time: new Date().toLocaleString(),
        jobId: data.jobId || null,
        recipientId: data.recipientId || null, // Optional: employer ID or target user ID
        dot: true
    };
}

// Add notification to storage
function addNotificationToStorage(noti) {
    let storage = JSON.parse(localStorage.getItem("notifications"));

    // Maintain recipientId if present for filtered UI
    storage.recent.unshift(createNotification(noti));

    if (storage.recent.length > MAX_RECENT_NOTIFICATIONS) {
        const oldestNotification = storage.recent.pop();
        
        storage.older.unshift(oldestNotification);
        
        console.log("Notification moved to older list:", oldestNotification);
    }

    localStorage.setItem("notifications", JSON.stringify(storage));
}


/**
 * Get current user from localStorage
 * @returns {object|null} User object or null
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
 * Get all raw jobs from localStorage (unfiltered)
 * @returns {Array} Array of job objects
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
 * Convert File to Base64
 * @param {File | null} file - Image file
 * @returns {Promise<string | null>} Base64 string or null
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
 * Generate unique job ID in format JD001, JD002, ...
 * @returns {string} New job ID
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
 * Save new job to localStorage
 */
function saveJobToLocalStorage(jobData) {
    let postedJobs = getAllJobsRaw();
    postedJobs.push(jobData);
    localStorage.setItem('postedJobs', JSON.stringify(postedJobs));
    console.log("Job data successfully saved to localStorage");
}

/**
 * Update existing job in localStorage
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
 * Delete job from localStorage
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