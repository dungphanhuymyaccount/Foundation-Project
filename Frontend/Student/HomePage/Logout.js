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