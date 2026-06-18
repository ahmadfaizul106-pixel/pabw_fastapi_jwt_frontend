const API_URL = "http://127.0.0.1:8000";

/* ==========================
   ELEMENT HTML
========================== */

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loginForm = document.getElementById("loginForm");
const mahasiswaForm = document.getElementById("mahasiswaForm");

const logoutButton = document.getElementById("logoutBtn");

const tabelMahasiswa = document.getElementById("mahasiswaTable");

/* ==========================
   SAAT WEBSITE DIBUKA
========================== */

document.addEventListener("DOMContentLoaded", mulaiAplikasi);

function mulaiAplikasi() {
  cekStatusLogin();

  loginForm.addEventListener("submit", prosesLogin);

  mahasiswaForm.addEventListener("submit", simpanMahasiswa);

  logoutButton.addEventListener("click", logout);
}

/* ==========================
   TOKEN
========================== */

function ambilToken() {
  return localStorage.getItem("token");
}

function simpanToken(token) {
  localStorage.setItem("token", token);
}

/* ==========================
   LOGIN & LOGOUT
========================== */

function logout() {
  localStorage.removeItem("token");

  location.reload();
}

function cekStatusLogin() {
  const token = ambilToken();

  if (token) {
    loginPage.classList.add("hidden");

    dashboardPage.classList.remove("hidden");

    tampilkanDataMahasiswa();
  }
}

/* ==========================
   NOTIFIKASI
========================== */

function tampilkanPesan(elementId, pesan, jenis) {
  const element = document.getElementById(elementId);

  element.innerHTML = `
        <div class="message ${jenis}">
            ${pesan}
        </div>
    `;
}

/* ==========================
   LOGIN
========================== */

async function prosesLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      simpanToken(data.access_token);

      location.reload();
    } else {
      tampilkanPesan("loginMessage", "Login gagal", "error");
    }
  } catch (error) {
    tampilkanPesan("loginMessage", error.message, "error");
  }
}

/* ==========================
   MENAMPILKAN DATA
========================== */

async function tampilkanDataMahasiswa() {
  try {
    const response = await fetch(`${API_URL}/mahasiswa`, {
      headers: {
        Authorization: `Bearer ${ambilToken()}`,
      },
    });

    const data = await response.json();

    updateStatistik(data);

    isiTabelMahasiswa(data);
  } catch (error) {
    console.log(error);
  }
}

/* ==========================
   STATISTIK
========================== */

function updateStatistik(dataMahasiswa) {
  document.getElementById("totalMahasiswa").textContent = dataMahasiswa.length;

  const daftarJurusan = [...new Set(dataMahasiswa.map((item) => item.jurusan))];

  document.getElementById("totalJurusan").textContent = daftarJurusan.length;

  document.getElementById("totalNim").textContent = dataMahasiswa.length;
}

/* ==========================
   ISI TABEL
========================== */

function isiTabelMahasiswa(dataMahasiswa) {
  tabelMahasiswa.innerHTML = "";

  for (let i = 0; i < dataMahasiswa.length; i++) {
    const mahasiswa = dataMahasiswa[i];

    tabelMahasiswa.innerHTML += `
            <tr>
                <td>${mahasiswa.nama}</td>
                <td>${mahasiswa.nim}</td>
                <td>${mahasiswa.jurusan}</td>
                <td>
                    <button
                        class="btn danger"
                        onclick="hapusMahasiswa('${mahasiswa.id}')">
                        Hapus
                    </button>
                </td>
            </tr>
        `;
  }
}

/* ==========================
   TAMBAH MAHASISWA
========================== */

async function simpanMahasiswa(event) {
  event.preventDefault();

  const nama = document.getElementById("nama").value;

  const nim = document.getElementById("nim").value;

  const jurusan = document.getElementById("jurusan").value;

  try {
    const response = await fetch(`${API_URL}/mahasiswa`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${ambilToken()}`,
      },

      body: JSON.stringify({
        nama: nama,
        nim: nim,
        jurusan: jurusan,
      }),
    });

    if (response.ok) {
      mahasiswaForm.reset();

      tampilkanPesan("appMessage", "Data berhasil disimpan", "success");

      tampilkanDataMahasiswa();
    } else {
      tampilkanPesan("appMessage", "Gagal menyimpan data", "error");
    }
  } catch (error) {
    tampilkanPesan("appMessage", error.message, "error");
  }
}

/* ==========================
   HAPUS MAHASISWA
========================== */

async function hapusMahasiswa(id) {
  const yakin = confirm("Yakin ingin menghapus data?");

  if (!yakin) {
    return;
  }

  try {
    await fetch(`${API_URL}/mahasiswa/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${ambilToken()}`,
      },
    });

    tampilkanDataMahasiswa();
  } catch (error) {
    console.log(error);
  }
}
