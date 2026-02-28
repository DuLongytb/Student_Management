const searchInput = document.getElementById("searchInput");

const classData = {
  10: Array.from({ length: 25 }, (_, i) => `10A${i + 1}`),
  11: Array.from({ length: 25 }, (_, i) => `11A${i + 1}`),
  12: Array.from({ length: 25 }, (_, i) => `12A${i + 1}`),
};

const gradeSelect = document.getElementById("gradeSelect");
const classSelect = document.getElementById("classSelect");
const tableBox = document.getElementById("tableBox");
const tbody = document.querySelector("#infoTable tbody");

let db = JSON.parse(localStorage.getItem("studentInfoDB")) || {};

function saveDB() {
  localStorage.setItem("studentInfoDB", JSON.stringify(db));
}

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
  searchInput.disabled = false;
  render();
};

// ===== TÁCH TÊN =====
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);

  return {
    ho: parts[0] || "",
    ten: parts[parts.length - 1] || "",
    lot: parts.slice(1, -1).join(" ") || "",
  };
}

// ===== SORT =====
function sortStudents(cls) {
  db[cls].sort((a, b) => {
    const A = splitName(a.name);
    const B = splitName(b.name);

    let cmp = A.ten.localeCompare(B.ten, "vi", { sensitivity: "base" });
    if (cmp !== 0) return cmp;

    cmp = A.lot.localeCompare(B.lot, "vi", { sensitivity: "base" });
    if (cmp !== 0) return cmp;

    return A.ho.localeCompare(B.ho, "vi", { sensitivity: "base" });
  });
}

// ===== RENDER =====
function render() {
  const cls = classSelect.value;
  tbody.innerHTML = "";

  const keyword = searchInput.value.toLowerCase();

  db[cls]
    .filter((st) => splitName(st.name).ten.toLowerCase().includes(keyword))
    .forEach((st, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${i + 1}</td>
      <td contenteditable onblur="editField('${cls}',${i},'name',this.innerText)">${st.name}</td>
        <td>
          <select onchange="editField('${cls}',${i},'gender',this.value)">
            <option value="">--</option>
            <option value="Nam" ${st.gender === "Nam" ? "selected" : ""}>Nam</option>
            <option value="Nữ" ${st.gender === "Nữ" ? "selected" : ""}>Nữ</option>
            <option value="Khác" ${st.gender === "Khác" ? "selected" : ""}>Khác</option>
        </select>
        </td>
      <td contenteditable onblur="editField('${cls}',${i},'birth',this.innerText)">${st.birth}</td>
      <td contenteditable onblur="editField('${cls}',${i},'address',this.innerText)">${st.address}</td>
      <td contenteditable onblur="editField('${cls}',${i},'grade',this.innerText)">${st.grade}</td>
      <td><button onclick="removeStudent('${cls}',${i})">❌</button></td>
    `;

      tbody.appendChild(tr);
    });

  tableBox.style.display = "block";
}

// ===== THÊM HỌC SINH =====
window.addStudent = function () {
  const cls = classSelect.value;
  if (!cls) return alert("Chọn lớp trước!");

  const name = prompt("Tên học sinh:");
  if (!name) return;

  db[cls].push({
    id: Date.now(),
    name: name.trim(),
    gender: "",
    birth: "",
    address: "",
    grade: "",
  });

  sortStudents(cls);
  saveDB();
  render();
};

// ===== SỬA =====
window.editField = function (cls, i, field, val) {
  db[cls][i][field] = val.trim();
  sortStudents(cls);
  saveDB();
  render();
};

// ===== XÓA =====
window.removeStudent = function (cls, i) {
  if (!confirm("Xóa học sinh?")) return;
  db[cls].splice(i, 1);
  saveDB();
  render();
};

searchInput.addEventListener("input", render);
