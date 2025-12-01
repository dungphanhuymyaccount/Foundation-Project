// Tải lên Notification từ localStorage

function loadNotifications() {
  let data = JSON.parse(localStorage.getItem("notifications"));

  if (!data) {
    data = { recent: [], older: [] };
    localStorage.setItem("notifications", JSON.stringify(data));
  }

  const current = (localStorage.getItem('current_user')) ? JSON.parse(localStorage.getItem('current_user')) : null;
  const currentId = current?.EmployerID || current?.StudentID; // Lấy ID của người dùng hiện tại

  let recentToShow = [];
  let olderToShow = [];

  // Quy tắc lọc: Chỉ hiển thị thông báo nếu recipientId khớp với ID của người dùng hiện tại
  // Hoặc nếu nó là thông báo chung (Global) - nhưng ta sẽ loại bỏ thông báo Global sau này.
  
  if (current) {
    // Lọc cho Employer
    if (current.role === 'Employer' && current.EmployerID) {
        recentToShow = data.recent.filter(n => n.recipientId === current.EmployerID);
        olderToShow = data.older.filter(n => n.recipientId === current.EmployerID);

    // Lọc cho Student
    } else if (current.role === 'Student' && current.StudentID) {
        recentToShow = data.recent.filter(n => 
            (n.recipientId === current.StudentID) || (n.jobId && !n.recipientId) // Nếu có jobId mà không có recipientId, coi là thông báo Job mới (Global)
        );
        olderToShow = data.older.filter(n => 
             (n.recipientId === current.StudentID) || (n.jobId && !n.recipientId)
        );
    }
  } else {
    // Nếu chưa đăng nhập, không hiển thị thông báo
    recentToShow = [];
    olderToShow = [];
  }
  
  renderNotifications("recent-container", recentToShow);
  renderNotifications("older-notifications", olderToShow);
}

function renderNotifications(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "notification";

    div.innerHTML = `
      <img src="${item.avatar}" class="avatar">
      <div class="content">
        <p>${item.content}</p>
        <span class="time">${item.time}</span>
      </div>
      ${item.dot ? '<div class="dot"></div>' : ''}
    `;

    // click => mở job detail nếu có jobId
    div.addEventListener("click", () => {
      if (item.jobId) openJobDetail(item.jobId);
      item.dot = false;  // đánh dấu đã đọc
      localStorage.setItem("notifications", JSON.stringify(JSON.parse(localStorage.getItem("notifications"))));
      const dot = div.querySelector(".dot");
      if (dot) dot.remove();
    });

    container.appendChild(div);
  });
}

//  Chia 2 tab All/Unread

document.addEventListener("click", function(e) {
  if (e.target.closest(".tabs button")) {
    const tabs = document.querySelectorAll(".tabs button");
    const tab = e.target;
    const notifications = document.querySelectorAll(".notification");

    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (tab.textContent === "Unread") {
      notifications.forEach(noti => {
        noti.style.display = noti.querySelector(".dot") ? "flex" : "none";
      });
    } else {
      notifications.forEach(noti => noti.style.display = "flex");
    }
  }
});

//  View older

document.getElementById("view-btn").addEventListener("click", () => {
  const older = document.getElementById("older-notifications");
  const btn = document.getElementById("view-btn");

  if (older.style.display === "none") {
    older.style.display = "block";
    btn.textContent = "Hide older notifications";
    older.scrollIntoView({ behavior: "smooth" });
  } else {
    older.style.display = "none";
    btn.textContent = "View older notifications";
  }
});

//  Mở JobDetail
async function openJobDetail(jobId) {
  const jobs = getAllJobsRaw(); // Lấy data từ localStorage
  
  const job = jobs.find(j => j.jobId === jobId);

  if (!job) {
    alert("Job not found in localStorage!");
    return;
  }

  const jobDescriptionHtml = job.description ? `<p><b>Description:</b></p><pre>${job.description}</pre>` : '';

  document.getElementById("job-detail").innerHTML = `
      <h2>${job.jobTitle}</h2>
      <p><b>Job ID:</b> ${job.jobId}</p>
      <p><b>Company:</b> ${job.companyName}</p>
      <p><b>Location:</b> ${job.location}</p>
      <p><b>Salary:</b> ${job.salary.min} - ${job.salary.max} ${job.salary.currency}</p>
      <p><b>Experience:</b> ${job.experience.min} - ${job.experience.max} ${job.experience.currency}</p>
      <p><b>Vacancy:</b> ${job.numberOfVacancy}</p>
      <p><b>Deadline:</b> ${job.deadline}</p>
      <p><b>Requirement:</b> ${job.requirement}</p>
      <p><b>Benefit:</b> ${job.benefit}</p>
      <p><b>Company Logo:</b></p>
      <img src="${job.avatar || 'default-logo.png'}" style="width:150px;">
      ${jobDescriptionHtml}
  `;

  document.getElementById("job-modal").style.display = "flex";
}

// Đóng cửa sổ JobDetail
document.querySelector(".close-modal").addEventListener("click", () => {
  document.getElementById("job-modal").style.display = "none";
});

// RUN
loadNotifications();
