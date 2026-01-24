const classData = {
  10: ["10A1", "10A2"],
  11: ["11A1"],
  12: ["12A1"],
};

const subjects = [
  "toan",
  "van",
  "anh",
  "su",
  "dia",
  "li",
  "hoa",
  "sinh",
  "tin",
];

const subjectNames = {
  toan: "Toán",
  van: "Văn",
  anh: "Anh",
  su: "Sử",
  dia: "Địa",
  li: "Lí",
  hoa: "Hóa",
  sinh: "Sinh",
  tin: "Tin",
};

const gradeSelect = document.getElementById("gradeSelect");
const classSelect = document.getElementById("classSelect");
const semesterSelect = document.getElementById("semesterSelect");
const tableBox = document.getElementById("tableBox");
const tbody = document.querySelector("#scoreTable tbody");

let db = JSON.parse(localStorage.getItem("scoreDB")) || {};

// ===== LƯU DATABASE =====
function saveDB() {
  localStorage.setItem("scoreDB", JSON.stringify(db));
}

// ===== RANDOM ĐIỂM =====
function rand() {
  return +(Math.random() * 4 + 6).toFixed(1);
}

// ===== TẠO LỚP RỖNG =====
function initClass(cls) {
  if (!db[cls]) {
    db[cls] = [];
    saveDB();
  }
}

// ===== CHỌN KHỐI =====
gradeSelect.onchange = () => {
  const g = gradeSelect.value;
  classSelect.innerHTML = `<option value="">-- Chọn lớp --</option>`;
  semesterSelect.value = "";
  tableBox.style.display = "none";

  if (!g) return (classSelect.disabled = true);

  classSelect.disabled = false;
  classData[g].forEach((c) => {
    classSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
};

// ===== CHỌN LỚP =====
classSelect.onchange = () => {
  semesterSelect.disabled = !classSelect.value;
  tableBox.style.display = "none";
};

// ===== CHỌN HỌC KÌ =====
semesterSelect.onchange = () => {
  if (!semesterSelect.value) return;
  initClass(classSelect.value);
  render();
};

// ===== RENDER =====
function render() {
  const cls = classSelect.value;
  tbody.innerHTML = "";

  db[cls].forEach((st, i) => {
    let tr = document.createElement("tr");

    let html = `
      <td>${i + 1}</td>
      <td contenteditable onblur="editName('${cls}',${i},this.innerText)">${st.name}</td>
    `;

    subjects.forEach((sub) => {
      let avg = calcAvg(st.scores[sub]);
      html += `<td onclick="editScore('${cls}',${i},'${sub}')">${avg}</td>`;
    });

    let overall = calcOverallAvg(st.scores);
    html += `<td style="font-weight:700;color:#1976d2">${overall}</td>`;

    html += `<td><button onclick="removeStudent('${cls}',${i})">❌</button></td>`;

    tr.innerHTML = html;
    tbody.appendChild(tr);
  });

  tableBox.style.display = "block";
}

// ===== TÍNH TRUNG BÌNH =====
function calcAvg(arr = []) {
  if (!arr.length) return "-";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}

function calcOverallAvg(scores) {
  let sum = 0;
  let count = 0;

  subjects.forEach((sub) => {
    const arr = scores[sub];
    if (arr && arr.length) {
      sum += arr.reduce((a, b) => a + b, 0) / arr.length;
      count++;
    }
  });

  return count ? (sum / count).toFixed(1) : "-";
}

// ===== THÊM HỌC SINH =====
window.addStudent = function () {
  const cls = classSelect.value;
  const name = prompt("Tên học sinh:");
  if (!name) return;

  let scores = {};
  subjects.forEach((s) => {
    scores[s] = [rand(), rand(), rand()];
  });

  db[cls].push({ name, scores });
  saveDB();
  render();
};

// ===== XÓA =====
window.removeStudent = function (cls, i) {
  if (!confirm("Xóa học sinh này?")) return;
  db[cls].splice(i, 1);
  saveDB();
  render();
};

// ===== SỬA TÊN =====
window.editName = function (cls, i, val) {
  db[cls][i].name = val.trim();
  saveDB();
};

let currentEdit = {};

// ===== SỬA ĐIỂM (MỞ POPUP) =====
window.editScore = function (cls, i, sub) {
  currentEdit = { cls, i, sub };

  const arr = db[cls][i].scores[sub];

  document.getElementById("modalTitle").innerText =
    `${subjectNames[sub]} – ${db[cls][i].name}`;

  const box = document.getElementById("scoreInputs");
  box.innerHTML = "";

  arr.forEach((v, idx) => {
    box.innerHTML += `
      <div style="display:flex;gap:5px">
        <input type="number" step="0.1" value="${v}" />
        <button onclick="removeScore(${idx})">❌</button>
      </div>
    `;
  });

  box.innerHTML += `<input id="newScore" type="number" step="0.1" placeholder="+ Thêm điểm">`;

  document.getElementById("scoreModal").style.display = "flex";
};

// ===== XÓA 1 CỘT ĐIỂM =====
window.removeScore = function (idx) {
  const { cls, i, sub } = currentEdit;
  db[cls][i].scores[sub].splice(idx, 1);
  saveDB();
  editScore(cls, i, sub);
};

// ===== LƯU CHI TIẾT =====
window.saveDetail = function () {
  const { cls, i, sub } = currentEdit;

  let arr = [];
  document.querySelectorAll("#scoreInputs input").forEach((inp) => {
    const v = parseFloat(inp.value);
    if (!isNaN(v)) arr.push(v);
  });

  if (!arr.length) return alert("Chưa có điểm!");

  db[cls][i].scores[sub] = arr;
  saveDB();
  closeModal();
  render();
};

// ===== ĐÓNG POPUP =====
window.closeModal = function () {
  document.getElementById("scoreModal").style.display = "none";
};
