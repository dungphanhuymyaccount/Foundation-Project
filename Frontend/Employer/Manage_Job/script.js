// File: script.js (Cho chức năng Manage Candidates)

let allApplications = [];
let allCvData = [];
let candidates = []; // Danh sách ứng viên đã lọc cho Job hiện tại
let filteredCandidates = [];
let selectedTab = 'all';
let searchTerm = '';
let filterStatus = 'all';
let currentJobId = null;

// Hàm Utility: Định dạng ngày (Dùng cho Applied Date)
function formatDate(dateString) {
    return dateString || 'N/A';
}

// Hàm Utility: Lấy chữ cái đầu
function getInitials(name) {
    const names = name.split(' ');
    if (names.length >= 2) {
        return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    }
    return names[0] ? names[0][0].toUpperCase() : 'U';
}

// 💥 LOAD DỮ LIỆU TỪ LOCAL STORAGE VÀ LỌC THEO JOB ID 💥
function loadCandidates() {
    // 1. Lấy Job ID đang được quản lý
    currentJobId = JSON.parse(localStorage.getItem("managing_job_ID"));

    if (!currentJobId) {
        document.getElementById('candidateList').innerHTML = 
            '<div class="empty-state">Lỗi: Không tìm thấy ID công việc đang quản lý. Vui lòng quay lại trang Manage Job.</div>';
        return;
    }

    // 2. Tải tất cả ứng tuyển và CV Data
    allApplications = JSON.parse(localStorage.getItem('applications')) || [];
    allCvData = JSON.parse(localStorage.getItem('cvData')) || [];
    
    // 3. Lọc danh sách ứng viên chỉ cho Job hiện tại
    candidates = allApplications
        .filter(app => app.jobId === currentJobId)
        .map((app, index) => ({
            // Ánh xạ từ applications metadata sang object Candidate để hiển thị
            id: index + 1, // ID tạm thời cho hiển thị
            cvId: app.CvId, 
            name: app.fullName,
            email: app.email,
            // SỬ DỤNG PLACEHOLDERS VÌ THIẾU DỮ LIỆU CHI TIẾT
            phone: 'N/A', 
            address: 'N/A',
            summary: 'Thông tin tóm tắt không khả dụng (Chỉ có trong file CV)',
            skills: ['PDF CV', 'Dữ liệu thô'], 
            appliedDate: app.applyDate,
            status: app.status.toLowerCase() // Đảm bảo status là chữ thường
        }));

    // Cập nhật giao diện
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
        candidateList.innerHTML = '<div class="empty-state">Không tìm thấy ứng viên nào khớp với tiêu chí lọc.</div>';
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
                            N/A
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
                            Xem Chi Tiết
                        </button>
                        <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Tải CV
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
            text: 'Chờ xử lý',
            class: 'pending',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        approved: {
            text: 'Đã chấp nhận',
            class: 'approved',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        },
        rejected: {
            text: 'Đã từ chối',
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
                        <p class="modal-position">${candidate.summary}</p>
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
                    <div class="modal-detail-item">
                        <strong>Phone:</strong><span>${candidate.phone}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h4>Work Experience & Skills</h4>
            <div class="info-box">
                <p>⚠️ **Lưu ý**: Thông tin chi tiết (Kinh nghiệm, Kỹ năng, Học vấn) không được lưu trong metadata hồ sơ. Vui lòng **Tải CV** để xem đầy đủ.</p>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>Application Information</h4>
            <div class="info-box">
                <p><strong>Applied Date:</strong> ${formatDate(candidate.appliedDate)}</p>
                <p><strong>Status:</strong> ${getStatusText(candidate.status)}</p>
            </div>
        </div>

        <div class="modal-actions">
            ${candidate.status === 'pending' ? `
                <button class="btn btn-approve" onclick="updateStatus(${candidate.id}, 'approved')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Chấp nhận
                </button>
                <button class="btn btn-reject" onclick="updateStatus(${candidate.id}, 'rejected')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Từ chối
                </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="downloadCV('${candidate.cvId}', '${candidate.name}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Tải CV
            </button>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'approved': 'Đã chấp nhận',
        'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
}

// Close modal
function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// 💥 CẬP NHẬT STATUS VÀO LOCAL STORAGE 💥
function updateStatus(candidateId, newStatus) {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Tìm và cập nhật trong mảng allApplications (của localStorage)
    let tempAllApplications = JSON.parse(localStorage.getItem('applications')) || [];
    const appIndex = tempAllApplications.findIndex(app => app.CvId === candidate.cvId);

    if (appIndex !== -1) {
        // Cập nhật trạng thái trong localStorage
        tempAllApplications[appIndex].status = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        localStorage.setItem("applications", JSON.stringify(tempAllApplications));
        
        // Cập nhật lại UI
        candidate.status = newStatus;
        updateStats();
        updateCounts();
        filterAndDisplay();
        closeModal();
        
        const statusText = newStatus === 'approved' ? 'chấp nhận' : 'từ chối';
        alert(`Ứng viên ${candidate.name} đã được ${statusText}!`);
    } else {
        alert("Lỗi: Không tìm thấy hồ sơ ứng tuyển gốc trong localStorage.");
    }
}


// 💥 TẢI CV DÙNG BASE64 TỪ cvData 💥
function downloadCV(cvId, fullName) {
    // 1. Tìm CV Base64 từ cvData
    const cvEntry = allCvData.find(entry => entry.CvId === cvId);

    if (cvEntry && cvEntry.cvFileBase64) {
        // 2. Tạo Data URI
        const dataUrl = cvEntry.cvFileBase64; 
        
        // 3. Tạo link tải xuống và kích hoạt
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${fullName}_CV_${cvId}.pdf`; 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } else {
        alert("Lỗi: Không tìm thấy file CV Base64. Vui lòng kiểm tra key 'cvData' trong localStorage.");
    }
}

// Event Listeners (GIỮ NGUYÊN)
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