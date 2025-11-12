let fullName = "";
        let email = "";
        let password = "";
        let role = "";
        let step = 1;
        //hàm kiểm tra định dạng email password
        function validate(email, password, name) {
            const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const password_pattern = /^.{6,}$/;
            const error_message_email = document.getElementById('error-message-email');
            const error_message_password = document.getElementById('error-message-password');
            const error_message_name = document.getElementById('error-message-name');
            let validEmail = true;
            let validPassword = true;
            let validName = true;
            let isValid = false;
            //kiểm tra xem điền email chưa
            if (!email) {
                error_message_email.innerHTML = "<p>Please enter your email!</p>";
                validEmail = false;
            }
            else {
                //kiểm tra đúng định dạng không
                if (!email_pattern.test(email)) {
                    error_message_email.innerHTML = "<p>Incorrect format. Please enter again!</p>";
                    validEmail = false;
                }
                else {
                    error_message_email.innerHTML = "";
                    validEmail = true;
                }

            }

            //kiểm tra đã điền mật khẩu chưa
            if (!password) {
                error_message_password.innerHTML = "<p>Please enter your password!</p>";
                validPassword = false;
            }
            else {
                error_message_password.innerHTML = "";
                validPassword = true;
            }

            //kiểm tra đúng định dạng chưa
            if (!password_pattern.test(password)) {
                error_message_password.innerHTML = "<p>Your password must contain at least 6 characters!</p>";
                validPassword = false;
            }
            else {
                error_message_password.innerHTML = "";
                validPassword = true;
            }

            //kiểm tra định dạng full name
            if (!name) {
                error_message_name.innerHTML = "<p>Please enter your name!</p>";
                validName = false;
            }
            else {
                error_message_name.innerHTML = "";
                validName = true;
            }

            if ((validEmail === validPassword && validEmail === validName && validEmail === true)) {
                isValid = true;
            }
            return isValid;
        }

        //hàm kiểm tra user đăng kí đã tồn tại
        function existEmail(email, role) {
            list_user = JSON.parse(localStorage.getItem('list_user')) ||
            {
                list_student: [],
                list_employer: []
            }

            if (email) {
                return list_user.list_student.some(user => user.email === email);
            }
            return false;
        }

        //lắng nghe sụ kiện lưu thông tin vào localStorage khi bấm submit sau khi bấm submit
        document.getElementById('signup-form-step1').addEventListener('submit', function (event) {
            event.preventDefault();
            fullName = document.getElementById('fullname').value;
            email = document.getElementById('email').value;
            password = document.getElementById('password').value;

            //kiểm tra định dạng thông tin
            if (!validate(email, password, fullName)) {
                return;
            };

            if (existEmail(email, role)) {
                document.getElementById('error-message-email').innerHTML = "<p>Email already exist!!</p>";;
                return;
            }

            let user = ({
                fullName: fullName,
                email: email,
                password: password,
                role: "Student"
            });

            //lấy dữ liệu danh sách người dùng gồm 2 role
            let list_user = JSON.parse(localStorage.getItem('list_user')) || {
                list_student: [],
                list_employer: []
            };

            //đẩy người dùng vừa nhập thông tin đăng kí vào danh sách người dùng
            list_user.list_student.push(user);

            //lưu người dùng vào danh sách người dùng(đã phân role)
            localStorage.setItem('list_user', JSON.stringify(list_user));


            //chuyển sang trang đăng nhập
            setTimeout(() => { window.location.href = '../../General/Login/Login.html' }, 800);

        })
