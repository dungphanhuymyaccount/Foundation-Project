// Lấy danh sách tất cả các công ty (các <li>)
const chatItems = document.querySelectorAll(".chat-list li");
// Lấy khung hiển thị tin nhắn bên phải
const chatBox = document.querySelector(".sent-message");

// Dữ liệu hội thoại mẫu cho từng công ty
const chatScripts = {
    TechVision: [
    { type: 'incoming', text: 'Hello! We have seen your resume and we would like to interview you directly.', avatar: 'techvisionlogo.png' },
    { type: 'incoming', text: 'What time is suit for you?', avatar: 'techvisionlogo.png' },
    { type: 'outgoing', text: 'I can come on Monday.' },
    { type: 'incoming', text: 'Great! Let me set up an appointment for you.', avatar: 'techvisionlogo.png' }
  ],
  SoftHub: [
    { type: 'outgoing', text: 'I am sorry but I can come to the interview on Monday. I have got busy all of the sudden.' },
    { type: 'incoming', text: 'Can we set up another appointment.', avatar: 'softhub_logo.png' },
    { type: 'outgoing', text: 'Yes, please.' },
  ]
};

// Gắn sự kiện click cho từng dòng trong danh sách công ty
chatItems.forEach(function (item) {
  item.addEventListener('click', function () {
    // Lấy tên công ty từ phần <a> trong <li>
    var company = item.querySelector('a').textContent.trim();

    // Lấy danh sách tin nhắn tương ứng trong chatScripts
    var messages = chatScripts[company];

    // Xóa các tin nhắn cũ trong chatBox trước đó
    chatBox.innerHTML = '';

    // Duyệt qua từng tin nhắn trong kịch bản
    messages.forEach(function (msg) {
      // Tạo một thẻ <div> mới cho mỗi tin nhắn
      var div = document.createElement('div');
      div.classList.add(msg.type); // Thêm class "incoming" hoặc "outgoing"

      // Nếu là tin nhắn đến → có avatar
      if (msg.type === 'incoming') {
        div.innerHTML = `<img src="${msg.avatar}"><div class="message">${msg.text}</div>`;
      } 
      // Nếu là tin nhắn gửi đi → chỉ có nội dung
      else {
        div.innerHTML = `<div class="message">${msg.text}</div>`;
      }

      // Thêm tin nhắn vào khung chat
      chatBox.appendChild(div);
    });
  });
});