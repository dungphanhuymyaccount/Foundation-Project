// File: script.js (For Manage Candidates feature)

let allApplications = [];
let allCvData = [];
let candidates = []; // Filtered candidate list for the current Job
let filteredCandidates = [];
let selectedTab = 'all';
let searchTerm = '';
let filterStatus = 'all';
let currentJobId = null;

// Utility Function: Format Date (Used for Applied Date)
function formatDate(dateString) {
    return dateString || 'N/A';
}

// Utility Function: Get Initials
function getInitials(name) {
    const names = name.split(' ');
    if (names.length >= 2) {
        return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'U';
}

// 💥 LOAD DATA FROM LOCAL STORAGE AND FILTER BY JOB ID 💥
function loadCandidates() {
    // 1. Get the currently managed Job ID
    currentJobId = JSON.parse(localStorage.getItem("managing_job_ID"));

    if (!currentJobId) {
        document.getElementById('candidateList').innerHTML = 
            '<div class="empty-state">Error: No managing job ID found. Please return to the Manage Job page.</div>';
        return;
    }

    // 2. Load all applications and CV Data
    allApplications = JSON.parse(localStorage.getItem('applications')) || [];
    allCvData = JSON.parse(localStorage.getItem('cvData')) || [];
    
    // 3. Filter the candidate list for the current Job only
    candidates = allApplications
        .filter(app => app.jobId === currentJobId)
        .map((app, index) => ({
            // Map applications metadata to a Candidate object for display
            cvId: app.CvId, 
            name: app.fullName,
            email: app.email,
            appliedDate: app.applyDate,
            status: app.status.toLowerCase() // Ensure status is lowercase
        }));
    // Update UI
    updateStats();
    updateCounts();
    filterAndDisplay();
}

// Update statistics
function updateStats() {
    document.getElementById('totalCandidates').textContent = candidates.length;
    document.getElementById('pendingCandidates').textContent = 
        candidates.filter(c => c.status === 'pending').length;
    document.getElementById('approvedCandidates').textContent = 
        candidates.filter(c => c.status === 'approved').length;
    document.getElementById('rejectedCandidates').textContent = 
        candidates.filter(c => c.status === 'rejected').length;
}

// Update tab counts
function updateCounts() {
    document.getElementById('allCount').textContent = candidates.length;
    document.getElementById('pendingCount').textContent = 
        candidates.filter(c => c.status === 'pending').length;
    document.getElementById('approvedCount').textContent = 
        candidates.filter(c => c.status === 'approved').length;
    document.getElementById('rejectedCount').textContent = 
        candidates.filter(c => c.status === 'rejected').length;
}

// Filter and display candidates
function filterAndDisplay() {
    filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.cvId.toLowerCase().includes(searchTerm.toLowerCase());
                            
        const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
        
        const effectiveTab = selectedTab === 'all' ? filterStatus : selectedTab;
        const matchesTab = effectiveTab === 'all' || candidate.status === effectiveTab;
        
        return matchesSearch && matchesFilter && matchesTab;
    });

    displayCandidates();
}

// Display candidates
function displayCandidates() {
    const candidateList = document.getElementById('candidateList');
    
    if (filteredCandidates.length === 0) {
        candidateList.innerHTML = '<div class="empty-state">No candidates found matching the filter criteria.</div>';
        return;
    }

    candidateList.innerHTML = filteredCandidates.map(candidate => `
        <div class="candidate-item">
            <div class="candidate-header">
                <div class="candidate-avatar">${getInitials(candidate.name)}</div>
                <div class="candidate-info">
                    <div class="candidate-top">
                        <div>
                            <h3 class="candidate-name">${candidate.name}</h3>
                        </div>
                        ${getStatusBadge(candidate.status)}
                    </div>
                    <div class="candidate-details">
                        <span class="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            ${candidate.email}
                        </span>
                    </div>

                    <div class="candidate-actions">
                        <button class="btn btn-primary" onclick="viewDetail(${candidate.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            View Detail
                        </button>
                        <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Download CV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        pending: {
            text: 'Pending',
            class: 'pending',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        approved: {
            text: 'Approved',
            class: 'approved',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        },
        rejected: {
            text: 'Rejected',
            class: 'rejected',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
        }
    };

    const badge = badges[status] || badges.pending;
    return `
        <span class="status-badge ${badge.class}">
            ${badge.icon}
            ${badge.text}
        </span>
    `;
}

// View candidate detail
function viewDetail(candidateId) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-candidate-header">
            <div class="modal-avatar">${getInitials(candidate.name)}</div>
            <div class="modal-candidate-info">
                <div class="modal-name-section">
                    <div>
                        <h3 class="modal-name">${candidate.name}</h3>
                    </div>
                    ${getStatusBadge(candidate.status)}
                </div>
                
                <div class="modal-details-grid">
                    <div class="modal-detail-item">
                        <strong>Email:</strong><span>${candidate.email}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>Applied Date:</strong><span>${formatDate(candidate.appliedDate)}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>CV ID:</strong><span>${candidate.cvId}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            ${candidate.status === 'pending' ? `
                <button class="btn btn-approve" onclick="updateStatus(${candidate.id}, 'approved')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Approve
                </button>
                <button class="btn btn-reject" onclick="updateStatus(${candidate.id}, 'rejected')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Reject
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download CV
            </button>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

// Get status text (Kept for consistency, though not heavily used)
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected'
    };
    return statusMap[status] || status;
}

// Close modal
function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// 💥 UPDATE STATUS IN LOCAL STORAGE 💥
function updateStatus(candidateId, newStatus) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Find and update in the allApplications array (of localStorage)
    let tempAllApplications = JSON.parse(localStorage.getItem('applications')) || [];
    const appIndex = tempAllApplications.findIndex(app => app.CvId === candidate.cvId);

    if (appIndex !== -1) {
        // Update status in localStorage
        tempAllApplications[appIndex].status = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        localStorage.setItem("applications", JSON.stringify(tempAllApplications));
        
        // Update UI
        candidate.status = newStatus;
        updateStats();
        updateCounts();
        filterAndDisplay();
        closeModal();
        
        const statusText = newStatus === 'approved' ? 'approved' : 'rejected';
        alert(`${candidate.name}'s application has been ${statusText}.`); // Updated Alert
    } else {
        alert("Error: Can't find the candidate's application in storage."); // Updated Alert
    }
}


// 💥 DOWNLOAD CV USING BASE64 FROM cvData 💥
function downloadCV(cvId, fullName) {
    // 1. Find the Base64 CV from cvData
    const cvEntry = allCvData.find(entry => entry.CvId === cvId);

    if (cvEntry && cvEntry.cvFileBase64) {
        // 2. Create Data URI
        const dataUrl = cvEntry.cvFileBase64; 
        
        // 3. Create and trigger download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${fullName}_CV_${cvId}.pdf`; 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } else {
        alert("Error: Cannot find the CV file in storage."); // Updated Alert
    }
}

// Event Listeners 
document.addEventListener('DOMContentLoaded', () => {
    loadCandidates();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTab = btn.dataset.tab;
            document.getElementById('filterStatus').value = 'all'; 
            filterStatus = 'all';
            filterAndDisplay();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        filterAndDisplay();
    });

    // Filter
    document.getElementById('filterStatus').addEventListener('change', (e) => {
        filterStatus = e.target.value;
        document.querySelector('.tab-btn.active').classList.remove('active');
        document.querySelector('.tab-btn[data-tab="all"]').classList.add('active');
        selectedTab = 'all';
        filterAndDisplay();
    });

    // Close modal on outside click
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});