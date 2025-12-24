// File: script.js (Complete Version for Candidate Management)

let allApplications = [];
let allCvData = [];
let candidates = []; 
let filteredCandidates = [];
let selectedTab = 'all';
let searchTerm = '';
let filterStatus = 'all';
let currentJobId = null;

// --- Utility Functions ---
function formatDate(dateString) {
    return dateString || 'N/A';
}

function getInitials(name) {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
        return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'U';
}

// --- 1. Load Data from LocalStorage ---
function loadCandidates() {
    // Get the Job ID currently being managed
    currentJobId = JSON.parse(localStorage.getItem("managing_job_ID"));

    if (!currentJobId) {
        document.getElementById('candidateList').innerHTML = 
            '<div class="empty-state">Error: No Job ID found. Please return to the Job Management page.</div>';
        return;
    }

    // Load all applications and CV data
    allApplications = JSON.parse(localStorage.getItem('applications')) || [];
    allCvData = JSON.parse(localStorage.getItem('cvData')) || [];
    
    // Filter candidates by Job ID and map data
    candidates = allApplications
        .filter(app => app.jobId === currentJobId)
        .map(app => ({
            id: app.CvId, // Unique identifier for View Detail
            cvId: app.CvId, 
            name: app.fullName,
            email: app.email,
            appliedDate: app.applyDate,
            status: app.status.toLowerCase()
        }));

    updateStats();
    updateCounts();
    filterAndDisplay();
}

// --- 2. Update Statistics and Counters ---
function updateStats() {
    document.getElementById('totalCandidates').textContent = candidates.length;
    document.getElementById('pendingCandidates').textContent = 
        candidates.filter(c => c.status === 'pending').length;
    document.getElementById('approvedCandidates').textContent = 
        candidates.filter(c => c.status === 'approved').length;
    document.getElementById('rejectedCandidates').textContent = 
        candidates.filter(c => c.status === 'rejected').length;
}

function updateCounts() {
    document.getElementById('allCount').textContent = candidates.length;
    document.getElementById('pendingCount').textContent = 
        candidates.filter(c => c.status === 'pending').length;
    document.getElementById('approvedCount').textContent = 
        candidates.filter(c => c.status === 'approved').length;
    document.getElementById('rejectedCount').textContent = 
        candidates.filter(c => c.status === 'rejected').length;
}

// --- 3. Display Candidate List ---
function filterAndDisplay() {
    filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.id.toLowerCase().includes(searchTerm.toLowerCase());
                            
        const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
        const matchesTab = selectedTab === 'all' || candidate.status === selectedTab;
        
        return matchesSearch && matchesFilter && matchesTab;
    });

    displayCandidates();
}

function displayCandidates() {
    const candidateList = document.getElementById('candidateList');
    
    if (filteredCandidates.length === 0) {
        candidateList.innerHTML = '<div class="empty-state">No matching candidates found.</div>';
        return;
    }

    candidateList.innerHTML = filteredCandidates.map(candidate => `
        <div class="candidate-item">
            <div class="candidate-header">
                <div class="candidate-avatar">${getInitials(candidate.name)}</div>
                <div class="candidate-info">
                    <div class="candidate-top">
                        <h3 class="candidate-name">${candidate.name}</h3>
                        ${getStatusBadge(candidate.status)}
                    </div>
                    <div class="candidate-details">
                        <span class="detail-item">
                            <ion-icon name="mail-outline"></ion-icon> ${candidate.email}
                        </span>
                    </div>

                    <div class="candidate-actions">
                        <button class="btn btn-primary" onclick="viewDetail('${candidate.id}')">
                            <ion-icon name="eye-outline"></ion-icon> View Detail
                        </button>
                        <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                            <ion-icon name="download-outline"></ion-icon> Download CV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBadge(status) {
    const badges = {
        pending: { text: 'Pending', class: 'pending' },
        approved: { text: 'Approved', class: 'approved' },
        rejected: { text: 'Rejected', class: 'rejected' }
    };

    const badge = badges[status] || badges.pending;
    return `<span class="status-badge ${badge.class}">${badge.text}</span>`;
}

// --- 4. View Detail Function ---
function viewDetail(candidateId) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-candidate-header">
            <div class="modal-avatar">${getInitials(candidate.name)}</div>
            <div class="modal-candidate-info">
                <div class="modal-name-section">
                    <h3 class="modal-name">${candidate.name}</h3>
                    ${getStatusBadge(candidate.status)}
                </div>
                
                <div class="modal-details-grid">
                    <div class="modal-detail-item"><strong>Email:</strong> <span>${candidate.email}</span></div>
                    <div class="modal-detail-item"><strong>Applied Date:</strong> <span>${formatDate(candidate.appliedDate)}</span></div>
                    <div class="modal-detail-item"><strong>CV ID:</strong> <span>${candidate.cvId}</span></div>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            ${candidate.status === 'pending' ? `
                <button class="btn btn-approve" onclick="updateStatus('${candidate.id}', 'approved')">
                    Approve
                </button>
                <button class="btn btn-reject" onclick="updateStatus('${candidate.id}', 'rejected')">
                    Reject
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                Download CV (PDF)
            </button>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

// --- 5. Update Application Status with Notifications ---
function updateStatus(candidateId, newStatus) {
    let tempAllApplications = JSON.parse(localStorage.getItem('applications')) || [];
    const appIndex = tempAllApplications.findIndex(app => app.CvId === candidateId);

    if (appIndex !== -1) {
        // Retrieve the candidate name for the notification
        const candidateName = tempAllApplications[appIndex].fullName;

        // Update status in memory and LocalStorage
        tempAllApplications[appIndex].status = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        localStorage.setItem("applications", JSON.stringify(tempAllApplications));
        
        // Reload data to sync UI
        loadCandidates();
        closeModal();
        
        // Display specific notification based on status
        if (newStatus === 'approved') {
            alert(`Success: Candidate "${candidateName}" has been approved.`);
        } else if (newStatus === 'rejected') {
            alert(`Notice: Candidate "${candidateName}" has been rejected.`);
        }
    } else {
        alert("Error: Candidate data not found in storage.");
    }
}

// --- 6. Download CV (Base64) ---
function downloadCV(cvId, fullName) {
    const cvEntry = allCvData.find(entry => entry.CvId === cvId);

    if (cvEntry && cvEntry.cvFileBase64) {
        const link = document.createElement('a');
        link.href = cvEntry.cvFileBase64;
        link.download = `CV_${fullName}_${cvId}.pdf`; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Error: CV file not found.");
    }
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// --- 7. Initialize Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    loadCandidates();

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTab = btn.dataset.tab;
            filterAndDisplay();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        filterAndDisplay();
    });

    // Filter by Status
    document.getElementById('filterStatus').addEventListener('change', (e) => {
        filterStatus = e.target.value;
        filterAndDisplay();
    });

    // Close modal on outside click or Esc key
    window.addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});