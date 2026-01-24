// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { firebaseConfig } from "./config.js";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Lấy DOM elements
const getElement = (id) => document.getElementById(id);
// const userEmailEl = getElement("userEmail");
const nameInput = getElement("nameInput");
const schoolInput = getElement("schoolInput");
const dobInput = getElement("dobInput");
const nameList = getElement("nameList");

// Load danh sách tên
const loadNames = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "names"));
    nameList.innerHTML = "";

    // Hiển thị từng tên
    querySnapshot.forEach((doc) => {
      const { name = "", school = "", dob = "" } = doc.data();
      const li = document.createElement("li");
      const displayDob = dob ? dob.split("-").reverse().join("/") : ""; // yyyy-mm-dd -> dd/mm/yyyy
      li.textContent = `${name}${school ? " — " + school : ""}${
        displayDob ? " — " + displayDob : ""
      }`;
      nameList.appendChild(li);
    });
  } catch ({ message }) {
    alert(`Lỗi khi tải danh sách: ${message}`);
  }
};

// Lưu tên và thông tin
window.saveName = async () => {
  const name = nameInput.value.trim();
  const school = schoolInput ? schoolInput.value.trim() : "";
  const dob = dobInput ? dobInput.value : ""; // yyyy-mm-dd from date input

  if (!name) {
    alert("Chưa nhập tên!");
    return;
  }

  try {
    await addDoc(collection(db, "names"), { name, school, dob });
    nameInput.value = "";
    if (schoolInput) schoolInput.value = "";
    if (dobInput) dobInput.value = "";
    await loadNames();
  } catch ({ message }) {
    alert(`Lỗi: ${message}`);
  }
};

// Đăng xuất
window.logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    alert("Lỗi khi đăng xuất!");
  }
};

// Kiểm tra đăng nhập
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailEl.textContent = user.email;
    loadNames();
  } else {
    window.location.href = "auth.html";
  }
});
