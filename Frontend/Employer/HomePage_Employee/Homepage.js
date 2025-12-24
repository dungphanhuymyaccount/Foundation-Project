// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
    if(!document.getElementById('log-out')) return null
document.getElementById('log-out').addEventListener("click", function(e) {
    e.preventDefault();
    currentUser = JSON.parse(localStorage.getItem('current_user'));
    if(currentUser) {
        localStorage.removeItem('current_user');
        setTimeout(() => {window.location.href= '../../General/Login/Login.html'}, 800);
    }
    else{
        console.error("You haven't login yet");
        alert("You haven't login yet!");
        setTimeout(() => {window.location.href= '../../General/Login/Login.html'}, 800);
    }
})
});

// Display the user's name after logging in
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const accountName = document.getElementById("current-user");
    if (currentUser && currentUser.role === "Employer") {
        accountName.textContent = `Hi, ${currentUser.employerName}`;
        // If not logged in, display “account”
    } else {
        accountName.textContent = "Account";
    }
});

document.getElementById('log-out').addEventListener("click", function(e) {
    e.preventDefault();
    // Hành động xóa này sẽ kích hoạt sự kiện 'storage' cho tất cả các tab khác
    localStorage.removeItem('current_user'); 
    
    setTimeout(() => {
        window.location.href = '../../General/Login/Login.html';
    }, 800);
});