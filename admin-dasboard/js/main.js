// File: /js/main.js

/**
 * Global JavaScript untuk mengelola fungsionalitas admin dashboard.
 * Termasuk:
 * 1. Navigasi sidebar
 * 2. Mengambil dan menampilkan data dari JSON
 * 3. Menghubungkan fungsionalitas dengan halaman HTML
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Manajemen Navigasi Sidebar ---
    // Pastikan sidebar bisa berfungsi di semua halaman.
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');

    // Menambahkan event listener untuk tombol toggle sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // --- Fungsi Helper untuk Mengambil Data JSON ---
    const fetchData = async (file) => {
        try {
            const response = await fetch(`/data/${file}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Terjadi kesalahan saat mengambil data:', error);
            // Menampilkan pesan error di UI jika perlu
            return [];
        }
    };

    // --- Fungsi untuk Menampilkan Data ke Tabel ---
    // Digunakan untuk fitur Manajemen Anggota, Pendaftaran Anggota, dan Pendaftaran Event.
    const renderTable = (data, containerId, columns) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        let tableHtml = `<table class="min-w-full leading-normal">
            <thead>
                <tr>
                    ${columns.map(col => `<th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>`;

        if (data.length === 0) {
            tableHtml += `<tr><td colspan="${columns.length}" class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">Tidak ada data untuk ditampilkan.</td></tr>`;
        } else {
            tableHtml += data.map(item => {
                const values = Object.values(item).slice(1); // Ambil nilai, lewati ID
                return `<tr class="hover:bg-gray-50">
                    ${values.map(val => `<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${val}</td>`).join('')}
                </tr>`;
            }).join('');
        }

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    };

    // --- Fungsi untuk Menampilkan Data ke Grid/Card ---
    // Digunakan untuk fitur Daftar Event Berjalan.
    const renderCards = (data, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500">Tidak ada event yang sedang berlangsung.</p>`;
            return;
        }

        const cardsHtml = data.map(event => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                <img src="${event.gambar}" alt="${event.namaEvent}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex items-baseline mb-2">
                        <span class="text-sm font-semibold tracking-wide uppercase text-blue-600">${event.status}</span>
                    </div>
                    <h3 class="font-bold text-xl text-gray-900 leading-tight mb-2">${event.namaEvent}</h3>
                    <p class="text-gray-600 text-sm mb-4 truncate">${event.deskripsi}</p>
                    <div class="text-sm text-gray-500">
                        <p class="mb-1"><i class="fas fa-map-marker-alt mr-2 text-blue-500"></i>${event.lokasi}</p>
                        <p><i class="fas fa-calendar-alt mr-2 text-blue-500"></i>${event.tanggal}</p>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = cardsHtml;
    };

    // --- PENGELOLAAN FITUR PER HALAMAN ---

    // Fitur 1: Manajemen Anggota (members.html)
    if (document.body.id === 'members-page') {
        fetchData('members').then(data => {
            const columns = ['Nama', 'Email', 'Departemen', 'Tahun Bergabung'];
            renderTable(data, 'members-table-container', columns);
        });
    }

    // Fitur 2: Pendaftaran Anggota Baru (new-members.html)
    if (document.body.id === 'new-members-page') {
        fetchData('new-members').then(data => {
            const columns = ['Nama', 'Email', 'Alasan Bergabung', 'Status'];
            renderTable(data, 'new-members-table-container', columns);
        });
    }

    // Fitur 3: Pendaftaran Event (event-applicants.html)
    if (document.body.id === 'event-applicants-page') {
        fetchData('event-applicants').then(data => {
            const columns = ['Nama', 'Email', 'Event', 'Status'];
            renderTable(data, 'event-applicants-table-container', columns);
        });
    }

    // Fitur 4: Daftar Event Berjalan (ongoing-events.html)
    if (document.body.id === 'ongoing-events-page') {
        fetchData('events').then(data => {
            const ongoingEvents = data.filter(event => event.status === 'Berlangsung' || event.status === 'Pendaftaran Dibuka');
            renderCards(ongoingEvents, 'ongoing-events-container');
        });
    }

    // Fitur 5: Manajemen Event (manage-events.html)
    if (document.body.id === 'manage-events-page') {
        const form = document.getElementById('event-form');
        const eventListContainer = document.getElementById('event-list-container');
        let events = []; // State lokal untuk events

        // Fungsi untuk me-render daftar event dengan tombol edit/hapus
        const renderManageEventList = () => {
            eventListContainer.innerHTML = events.map(event => `
                <div class="flex items-center justify-between p-4 mb-2 bg-gray-100 rounded-lg shadow-sm">
                    <span class="font-medium text-gray-800">${event.namaEvent}</span>
                    <div>
                        <button onclick="editEvent(${event.id})" class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                        <button onclick="deleteEvent(${event.id})" class="text-red-500 hover:text-red-700">Hapus</button>
                    </div>
                </div>
            `).join('');
        };

        // Fungsi untuk mengambil data awal saat halaman dimuat
        const loadEvents = async () => {
            events = await fetchData('events');
            renderManageEventList();
        };

        loadEvents();

        // Mengelola submit form
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const namaEvent = document.getElementById('namaEvent').value;
            const deskripsi = document.getElementById('deskripsi').value;
            const gambar = document.getElementById('gambar').value;
            const tanggal = document.getElementById('tanggal').value;
            const lokasi = document.getElementById('lokasi').value;
            const status = document.getElementById('status').value;

            // Logika sederhana untuk menambah event baru
            const newEvent = {
                id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
                namaEvent,
                lokasi,
                tanggal,
                status,
                deskripsi,
                gambar: gambar || "https://placehold.co/600x400/94a3b8/ffffff?text=New+Event"
            };
            events.push(newEvent);

            // Re-render daftar event
            renderManageEventList();

            // Reset form
            form.reset();
            alert('Event berhasil ditambahkan!');
        });

        // Catatan: Fungsi `editEvent` dan `deleteEvent` perlu dibuat global agar bisa dipanggil dari HTML
        // Di dunia nyata, ini akan berinteraksi dengan API, bukan array lokal.
        window.editEvent = (id) => {
            alert(`Fungsi Edit untuk Event ID ${id} akan dibuat di sini.`);
            const eventToEdit = events.find(e => e.id === id);
            // Anda bisa mengisi form dengan data eventToEdit untuk diedit
        };

        window.deleteEvent = (id) => {
            if (confirm(`Apakah Anda yakin ingin menghapus Event ID ${id}?`)) {
                events = events.filter(e => e.id !== id);
                renderManageEventList();
                alert('Event berhasil dihapus.');
            }
        };
    }

    // Fitur 6: Pengaturan Dashboard (settings.html)
    if (document.body.id === 'settings-page') {
        const usersContainer = document.getElementById('users-container');
        let users = [];

        const renderUserList = () => {
             usersContainer.innerHTML = users.map(user => `
                <div class="flex items-center justify-between p-4 mb-2 bg-gray-100 rounded-lg shadow-sm">
                    <div class="font-medium text-gray-800">
                        <p>${user.username} <span class="text-xs font-normal text-gray-500">(${user.role})</span></p>
                    </div>
                    <div>
                        <button onclick="editUser(${user.id})" class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                        <button onclick="deleteUser(${user.id})" class="text-red-500 hover:text-red-700">Hapus</button>
                    </div>
                </div>
            `).join('');
        };

        const loadUsers = async () => {
            users = await fetchData('users');
            renderUserList();
        };

        loadUsers();

        window.editUser = (id) => {
             alert(`Fungsi Edit untuk User ID ${id} akan dibuat di sini.`);
        };
        
        window.deleteUser = (id) => {
            if (confirm(`Apakah Anda yakin ingin menghapus User ID ${id}?`)) {
                users = users.filter(user => user.id !== id);
                renderUserList();
                alert('User berhasil dihapus.');
            }
        };

    }

    // --- Catatan Teknis: Integrasi dengan Google Spreadsheet (Dummy) ---
    // Di dunia nyata, Anda akan menggunakan Google Sheets API untuk mengambil data.
    // Berikut adalah contoh alur kerjanya:
    
    // 1. Dapatkan Kunci API & ID Spreadsheet dari Google Cloud Console.
    //    Ini akan menjadi bagian dari backend atau konfigurasi.

    // 2. Buat fungsi untuk memanggil API.
    const fetchFromGoogleSheets = async () => {
        // const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
        // const API_KEY = 'YOUR_API_KEY';
        // const RANGE = 'Sheet1!A1:D10'; // Tentukan rentang data

        // const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        // try {
        //     const response = await fetch(url);
        //     const data = await response.json();
        //     // Proses data di sini
        //     console.log('Data dari Google Sheets:', data.values);
        // } catch (error) {
        //     console.error('Gagal mengambil data dari Google Sheets:', error);
        // }
    };
    
    // Simulasikan fungsionalitas tombol "Gunakan Data dari Spreadsheet"
    const spreadsheetBtn = document.getElementById('use-spreadsheet-data');
    if (spreadsheetBtn) {
        spreadsheetBtn.addEventListener('click', () => {
            alert('Menjalankan fungsi dummy untuk mengambil data dari Google Spreadsheet. Di implementasi nyata, fungsi ini akan memanggil Google Sheets API.');
            // Panggil fungsi nyata di sini:
            // fetchFromGoogleSheets();
        });
    }

    // --- Logika Login (login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const users = await fetchData('users');
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                // Dummy session storage untuk menyimpan role user
                sessionStorage.setItem('userRole', user.role);
                alert(`Login berhasil! Selamat datang, ${user.username}.`);
                window.location.href = 'index.html';
            } else {
                alert('Username atau password salah.');
            }
        });
    }
});