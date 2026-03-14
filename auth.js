import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
// Import Firebase
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import { firebaseConfig } from "./config.js";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Lấy DOM elements
const getElement = (id) => document.getElementById(id);
const loginForm = getElement("loginForm");
const registerForm = getElement("registerForm");

// Hiển thị thông báo
const showMessage = (text) => {
  const messageEl = getElement("message");
  messageEl.textContent = text;
};

// Đăng ký
window.register = async () => {
  const email = getElement("registerEmail").value.trim();
  const password = getElement("registerPassword").value;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ!");
    return;
  }

  if (password.length < 6) {
    showMessage("Mật khẩu phải có ít nhất 6 ký tự!");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage("Đăng ký thành công!");
  } catch ({ message }) {
    showMessage(`Lỗi: ${message}`);
  }
};

// Đăng nhập
window.login = async () => {
  const email = getElement("loginEmail").value.trim();
  const password = getElement("loginPassword").value;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ!");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showMessage("Đăng nhập thành công!");
  } catch (error) {
    showMessage("Email hoặc mật khẩu không đúng!");
  }
};

// Chuyển đổi form
window.showRegister = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  document.getElementById("title").innerText = "Đăng kí";
};

window.showLogin = () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";

  document.getElementById("title").innerText = "Đăng nhập";
};

// Đăng xuất
window.logout = async () => {
  await signOut(auth);
  window.location.href = "../auth.html";
};

// ===== Admin and User =====
const adminEmails = ["hadulong12@gmail.com"];

window.loginGoogle = () => {
  signInWithPopup(auth, provider).then((result) => {
    const email = result.user.email;

    if (adminEmails.includes(email)) {
      window.location.href =
        "http://127.0.0.1:5500/Student_Management/admin/index.html";
    } else {
      window.location.href =
        "http://127.0.0.1:5500/Student_Management/student/student.html";
    }
  });
};

// Kiểm tra nếu đã đăng nhập từ trước
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const email = user.email;

  if (adminEmails.includes(email)) {
    window.location.href =
      "http://127.0.0.1:5500/Student_Management/admin/index.html";
  } else {
    window.location.href =
      "http://127.0.0.1:5500/Student_Management/student/student.html";
  }
});
