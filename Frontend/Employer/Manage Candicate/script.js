// State
let candidates = [];
let filteredCandidates = [];
let selectedTab = 'all';
let searchTerm = '';
let filterStatus = 'all';

function formatDate(dateString) {
    // Input format: YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
        // Output format: DD/MM/YYYY
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

// Function to get initials from name
function getInitials(name) {
    const names = name.split(' ');
    if (names.length >= 2) {
        return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
}

// Function to assign random status (for demo purposes)
function assignRandomStatus() {
    return 'pending';
}

// Load candidates from JSON
async function loadCandidates() {
    try {
        const response = await fetch('cv.json');
        const cvData = await response.json();
        
        // Transform CV data to candidate format
        candidates = cvData.map((cv, index) => ({
            id: index + 1,
            cvId: cv.CvID,
            name: cv.Name,
            email: cv.Email,
            phone: cv["Phone Number"],
            address: cv.Address,
            dob: cv.DoB,
            gender: cv.Gender,
            summary: cv.Summary,
            experience: cv.Experience,
            skills: cv.Skills.split(',').map(s => s.trim()),
            education: cv.Education,
            project: cv.Project,
            status: assignRandomStatus(),
        }));
        
        updateStats();
        updateCounts();
        filterAndDisplay();
    } catch (error) {
        console.error('Error loading candidates:', error);
        // Dịch thông báo lỗi
        document.getElementById('candidateList').innerHTML = 
            '<div class="empty-state">Error loading candidate data. Please check the cv.json file.</div>';
    }
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
                            candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())); // <-- KHÔI PHỤC ĐOẠN NÀY
        const matchesFilter = filterStatus === 'all' || candidate.status === filterStatus;
        const matchesTab = selectedTab === 'all' || candidate.status === selectedTab;
        return matchesSearch && matchesFilter && matchesTab;
    });

    displayCandidates();
}

// Display candidates
function displayCandidates() {
    const candidateList = document.getElementById('candidateList');
    
    if (filteredCandidates.length === 0) {
        // Dịch thông báo không tìm thấy
        candidateList.innerHTML = '<div class="empty-state">No candidates found</div>';
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
                            <p class="candidate-position">${candidate.summary}</p>
                        </div>
                        ${getStatusBadge(candidate.status)}
                    </div>


                    <div class="candidate-details">
                        <span class="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            ${candidate.email}
                        </span>
                        <span class="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            ${candidate.phone}
                        </span>
                        <span class="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${candidate.address}
                        </span>
                    </div>
                    
                    
                    <div class="skills-container">
                        ${candidate.skills.slice(0, 5).map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                        ${candidate.skills.length > 5 ? `<span class="skill-tag">+${candidate.skills.length - 5} more</span>` : ''}
                    </div>

                    <div class="candidate-actions">
                        <button class="btn btn-primary" onclick="viewDetail(${candidate.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            View Details
                        </button>
                        <button class="btn btn-secondary" onclick="sendMessage(${candidate.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                            Send Message
                        </button>
                        <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}')">
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
            // Dịch 'Chờ xử lý'
            text: 'Pending',
            class: 'pending',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        approved: {
            // Dịch 'Đã chấp nhận'
            text: 'Approved',
            class: 'approved',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        },
        rejected: {
            // Dịch 'Đã từ chối'
            text: 'Rejected',
            class: 'rejected',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
        }
    };

    const badge = badges[status];
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
                        <p class="modal-position">${candidate.summary}</p>
                    </div>
                    ${getStatusBadge(candidate.status)}
                </div>
                
                <div class="modal-details-grid">
                    <div class="modal-detail-item">
                        <strong>Email:</strong><span>${candidate.email}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>Phone:</strong><span>${candidate.phone}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>Gender:</strong><span>${candidate.gender === 'Male' ? 'Male' : 'Female'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>Date of Birth:</strong><span>${formatDate(candidate.dob)}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>Address:</strong><span>${candidate.address}</span>
                    </div>
                    <div class="modal-detail-item">
                        <strong>CV ID:</strong><span>${candidate.cvId}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h4>Summary</h4>
            <div class="info-box">
                <p class="summary-text">${candidate.summary}</p>
            </div>
        </div>

        <div class="modal-section">
            <h4>Work Experience</h4>
            <div class="info-box">
                <p class="experience-text">${candidate.experience}</p>
            </div>
        </div>

        <div class="modal-section">
            <h4>Skills</h4>
            <div class="skills-container">
                ${candidate.skills.map(skill => 
                    `<span class="skill-tag">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        <div class="modal-section">
            <h4>Education</h4>
            <p class="education-text">${candidate.education}</p>
        </div>

        <div class="modal-section">
            <h4>Projects</h4>
            <div class="info-box">
                <p class="info-label">📌 ${candidate.project}</p>
            </div>
        </div>

        <div class="modal-section">
            <h4>Application Information</h4>
            <div class="info-box">
                <p><strong>Applied Date:</strong> ${candidate.appliedDate || 'N/A'}</p>
                <p><strong>Status:</strong> ${getStatusText(candidate.status)}</p>
            </div>
        </div>

        <div class="modal-actions">
            ${candidate.status === 'pending' ? `
                <button class="btn btn-approve" onclick="updateStatus(${candidate.id}, 'approved')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Approve Candidate
                </button>
                <button class="btn btn-reject" onclick="updateStatus(${candidate.id}, 'rejected')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Reject Candidate
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="sendMessage(${candidate.id})">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Send Message
            </button>
            <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download CV
            </button>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        // Dịch trạng thái
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

// Update candidate status
function updateStatus(candidateId, newStatus) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
        candidate.status = newStatus;
        updateStats();
        updateCounts();
        filterAndDisplay();
        closeModal();
        
        // Dịch thông báo alert
        const statusText = newStatus === 'approved' ? 'approved' : 'rejected';
        alert(`Candidate ${candidate.name} has been ${statusText}`);
    }
}

// Send message
function sendMessage(candidateId) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
        // Dịch thông báo chức năng đang phát triển
        alert(`Messaging function for ${candidate.name} (${candidate.email}) is currently under development`);
    }
}

// Download CV
function downloadCV(cvId) {
    // Dịch thông báo chức năng đang phát triển
    alert(`Downloading CV ${cvId}...\nDownload CV function is currently under development`);
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