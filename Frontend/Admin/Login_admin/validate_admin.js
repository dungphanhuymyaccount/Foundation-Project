let admin = []// Save all admin data

// Get data from the JSON file
async function loadData() {
    try {
        const res = await fetch("../../../json/admin_account.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        admin = data.admin;
        console.log("all admin", admin)
    }
    catch (err) {
        console.log(err);
        alert("không có admin")
    }
}



function validateInfo(accountName, password) {
    let valid = true;
    let errorMessage = document.getElementById("error-message");
    if (!accountName) {
        errorMessage.innerHTML = "<p>Please enter your username .</p>"
        valid = false;
    }
    if (!password) {
        errorMessage.innerHTML = "<p>Please enter your password.</p>"
        valid = false;
    }
    if (!admin.find(admin => admin.accountName === accountName && admin.password === password)) {
        errorMessage.innerHTML = "<p>Your username or password is incorrect.</p>"
        valid = false;
    }
    return valid;
}

document.getElementById("login-box").addEventListener("submit", async function (e) {
    e.preventDefault();
    accountName = document.getElementById("account-name").value;
    password = document.getElementById("password").value;

    // Load data first
    try {
            if (admin.length === 0) await loadData();
        } catch (err) {
            console.error(err);
            showError("Cannot load admin data. Please try again.");
            return;
        }

    if (!validateInfo(accountName, password)) {
        return;
    }
    else {
        
        currentAdmin = {
            accountName: accountName,
            password: password,
            role: "Admin"
        }
        sessionStorage.setItem("current_admin", JSON.stringify(currentAdmin))
        window.location.href = "../Admin_dashboard/Dashboard.html";
    }
})