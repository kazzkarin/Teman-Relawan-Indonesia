document.addEventListener("DOMContentLoaded", function () {
  // Tombol pendaftaran anggota
  const daftarAnggotaBtn = document.querySelector("#daftar-anggota-btn");
  if (daftarAnggotaBtn) {
    daftarAnggotaBtn.addEventListener("click", function (e) {
      e.preventDefault();

      fetch("../../../data/timerequest.json")
        .then(res => res.json())
        .then(data => {
          const now = new Date();
          const open = new Date(data.formrekrutmen.open);
          const close = new Date(data.formrekrutmen.close);

          if (now < open || now > close) {
            showStatusPopup(data.formrekrutmen.message);
          } else {
            window.location.href = "halaman/formrekrutmen/formpendaftaran.html";
          }
        })
        .catch(err => {
          console.error("Gagal mengambil data waktu:", err);
          showStatusPopup("Terjadi kesalahan saat memeriksa waktu pendaftaran.");
        });
    });
  }

  // Tombol daftar volunteer per program
  const daftarVolunteerBtns = document.querySelectorAll(".daftar-anggota-btn");
  daftarVolunteerBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const programName = this.getAttribute("data-program");
      const href = this.getAttribute("href");

      fetch("../../../data/timerequest.json")
        .then(res => res.json())
        .then(data => {
          const program = data.formvolunteer[programName];
          if (!program) {
            showStatusPopup("Program ini tidak ditemukan.");
            return;
          }

          const now = new Date();
          const open = new Date(program.open);
          const close = new Date(program.close);

          if (now < open || now > close) {
            showStatusPopup(program.message);
          } else {
            window.location.href = href;
          }
        })
        .catch(err => {
          console.error("Gagal memeriksa program:", err);
          showStatusPopup("Terjadi kesalahan saat memeriksa status program.");
        });
    });
  });
});

// Menampilkan popup
function showStatusPopup(message) {
  const popup = document.getElementById("popup-cekstatus");
  const messageEl = document.getElementById("popup-cekstatus-message");

  if (popup && messageEl) {
    messageEl.textContent = message;
    popup.classList.remove("hidden");
  }
}

// Menutup popup
function closeStatusPopup() {
  const popup = document.getElementById("popup-cekstatus");
  if (popup) {
    popup.classList.add("hidden");
  }
}
