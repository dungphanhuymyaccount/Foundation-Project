//chức năng log out
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

//hiển thị tên người dùng khi đã đăng nhập vào rồi
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("current_user"));
    const accountName = document.getElementById("current-user");
    const currentUserEmail = document.getElementById("current-user-name");
    if (currentUser) {
        accountName.textContent = `Hi, ${currentUser.fullName}`;
        currentUserEmail.textContent = `Hi, ${currentUser.fullName}\n${currentUser.email}`;
        //nếu chưa đăng nhập thì sẽ hiện là account
    } else {
        accountName.textContent = "Account";
    }
});