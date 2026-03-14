const searchInput = document.getElementById("searchInput");

const classData = {
  10: [
    "10A1",
    "10A2",
    "10A3",
    "10A4",
    "10A5",
    "10A6",
    "10A7",
    "10A8",
    "10A9",
    "10A10",
    "10A11",
    "10A12",
    "10A13",
    "10A14",
    "10A15",
    "10A16",
    "10A17",
    "10A18",
    "10A19",
    "10A20",
    "10A21",
    "10A22",
    "10A23",
    "10A24",
    "10A25",
  ],
  11: [
    "11A1",
    "11A2",
    "11A3",
    "11A4",
    "11A5",
    "11A6",
    "11A7",
    "11A8",
    "11A9",
    "11A10",
    "11A11",
    "11A12",
    "11A13",
    "11A14",
    "11A15",
    "11A16",
    "11A17",
    "11A18",
    "11A19",
    "11A20",
    "11A21",
    "11A22",
    "11A23",
    "11A24",
    "11A25",
  ],
  12: [
    "12A1",
    "12A2",
    "12A3",
    "12A4",
    "12A5",
    "12A6",
    "12A7",
    "12A8",
    "12A9",
    "12A10",
    "12A11",
    "12A12",
    "12A13",
    "12A14",
    "12A15",
    "12A16",
    "12A17",
    "12A18",
    "12A19",
    "12A20",
    "12A21",
    "12A22",
    "12A23",
    "12A24",
    "12A25",
  ],
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

let infoDB = JSON.parse(localStorage.getItem("studentInfoDB")) || {};
let db = JSON.parse(localStorage.getItem("scoreDB")) || {};

// ===== LƯU DATABASE =====
function saveDB() {
  localStorage.setItem("scoreDB", JSON.stringify(db));
}

// ===== TẠO LỚP RỖNG =====
function initClass(cls) {
  if (!db[cls]) {
    db[cls] = [];
    saveDB();
  }
}

function syncStudents(cls) {
  if (!infoDB[cls]) return;

  if (!db[cls]) db[cls] = [];

  infoDB[cls].forEach((st) => {
    const exist = db[cls].find((s) => s.id === st.id);

    if (!exist) {
      let scores = {};
      subjects.forEach((sub) => {
        scores[sub] = {
          tx: [],
          gk: null,
          ck: null,
        };
      });

      db[cls].push({
        id: st.id,
        name: st.name,
        scores,
      });
    }
  });

  //XÓA NHỮNG HỌC SINH KHÔNG CÒN TRONG INFO DB
  db[cls] = db[cls].filter((scoreSt) =>
    infoDB[cls].some((infoSt) => infoSt.id === scoreSt.id),
  );

  sortStudents(cls);
  saveDB();
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
  syncStudents(classSelect.value);
  searchInput.disabled = false;
  render();
};

// ===== RANDOM ĐIỂM =====
function rand() {
  return +(Math.random() * 4 + 6).toFixed(1);
}

// ===== RENDER =====
function render() {
  const cls = classSelect.value;
  tbody.innerHTML = "";

  if (!db[cls]) return;

  const keyword = searchInput.value.toLowerCase().trim();

  db[cls]
    .filter((st) => {
      const words = keyword.split(" ");
      const name = st.name.toLowerCase();

      return words.every((w) => name.includes(w));
    })
    .forEach((st, i) => {
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

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });

  tableBox.style.display = "block";
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);

  const ho = parts[0] || "";
  const ten = parts[parts.length - 1] || "";
  const lot = parts.slice(1, -1).join(" ") || "";

  return { ho, lot, ten };
}

function sortStudents(cls) {
  db[cls].sort((a, b) => {
    const A = splitName(a.name);
    const B = splitName(b.name);

    // 1️⃣ so TÊN
    let cmp = A.ten.localeCompare(B.ten, "vi", { sensitivity: "base" });
    if (cmp !== 0) return cmp;

    // 2️⃣ so TÊN LÓT
    cmp = A.lot.localeCompare(B.lot, "vi", { sensitivity: "base" });
    if (cmp !== 0) return cmp;

    // 3️⃣ so HỌ
    return A.ho.localeCompare(B.ho, "vi", { sensitivity: "base" });
  });
}

// ===== SỬA TÊN =====
window.editName = function (cls, i, val) {
  db[cls][i].name = val.trim();
  sortStudents(cls);
  saveDB();
  render();
};

let currentEdit = {};

window.editScore = function (cls, i, sub) {
  currentEdit = { cls, i, sub };

  const score = db[cls][i].scores[sub] || { tx: [], gk: null, ck: null };

  document.getElementById("modalTitle").innerText =
    `${subjectNames[sub]} – ${db[cls][i].name}`;

  const box = document.getElementById("scoreInputs");

  const tx = score.tx || [];

  box.innerHTML = `
    <input class="TX" type="number" step="0.1" placeholder="TX1" value="${tx[0] ?? ""}">
    <input class="TX" type="number" step="0.1" placeholder="TX2" value="${tx[1] ?? ""}">
    <input class="TX" type="number" step="0.1" placeholder="TX3" value="${tx[2] ?? ""}">
    <input class="TX" type="number" step="0.1" placeholder="TX4" value="${tx[3] ?? ""}">

    <input id="GK" type="number" step="0.1" placeholder="Giữa kì"
      value="${score.gk ?? ""}">

    <input id="CK" type="number" step="0.1" placeholder="Cuối kì"
      value="${score.ck ?? ""}">
  `;

  document.getElementById("scoreModal").style.display = "flex";
};

// ===== TÍNH TRUNG BÌNH =====
function calcAvg(score) {
  if (!score) return "-";

  const tx = score.tx || [];
  const gk = score.gk;
  const ck = score.ck;

  if (tx.length === 0 || gk == null || ck == null) return "-";

  const txSum = tx.reduce((a, b) => a + b, 0);

  const sum = txSum + gk * 2 + ck * 3;
  const weight = tx.length + 2 + 3;

  return (sum / weight).toFixed(1);
}

function calcOverallAvg(scores) {
  let sum = 0;
  let count = 0;

  subjects.forEach((sub) => {
    const avg = calcAvg(scores[sub]);

    if (avg !== "-") {
      sum += parseFloat(avg);
      count++;
    }
  });

  return count ? (sum / count).toFixed(1) : "-";
}

// ===== XÓA 1 CỘT ĐIỂM =====
window.removeScore = function (idx) {
  const { cls, i, sub } = currentEdit;
  db[cls][i].scores[sub].splice(idx, 1);
  saveDB();
  editScore(cls, i, sub);
  render();
};

// ===== LƯU CHI TIẾT =====
window.saveDetail = function () {
  const { cls, i, sub } = currentEdit;

  const txInputs = document.querySelectorAll(".TX");
  let tx = [];

  txInputs.forEach((inp) => {
    const v = parseFloat(inp.value);
    if (!isNaN(v)) tx.push(v);
  });

  const gk = parseFloat(document.getElementById("GK").value);
  const ck = parseFloat(document.getElementById("CK").value);

  db[cls][i].scores[sub] = {
    tx,
    gk: isNaN(gk) ? null : gk,
    ck: isNaN(ck) ? null : ck,
  };

  if (
    tx.some((v) => v < 0 || v > 10) ||
    gk < 0 ||
    gk > 10 ||
    ck < 0 ||
    ck > 10
  ) {
    alert("Điểm phải từ 0 đến 10");
    return;
  }

  saveDB();
  closeModal();
  render();
};

// ===== ĐÓNG POPUP =====
window.closeModal = function () {
  document.getElementById("scoreModal").style.display = "none";
};

searchInput.addEventListener("input", render);
