# 🌌 Alya Pratama — Personal Portfolio & Admin Portal CMS
## Arsitektur Deployment: PHP Native API + MySQL (Shared Hosting / VPS)

Proyek ini menggunakan **Vite + React (TypeScript)** untuk antarmuka pengguna (Frontend SPA), didukung oleh **PHP Native API + MySQL/MariaDB** di sisi server (Backend). Arsitektur ini dirancang khusus agar kompatibel dengan shared hosting atau VPS tradisional Anda (cPanel/DirectAdmin).

---

## 📂 Struktur Proyek Server-Side

Proyek ini menyertakan komponen-komponen backend berikut:
```bash
├── config/
│   ├── database.php            # File konfigurasi database AKTIF (Abaikan di Git)
│   └── database.example.php    # Template contoh konfigurasi database
├── database/
│   └── schema.sql              # Struktur tabel migrasi database untuk phpMyAdmin
├── api/
│   ├── database.php            # Komponen penghubung PDO & Pengaturan CORS
│   ├── get_portfolio.php       # API Read: Membaca data portofolio dari MySQL
│   ├── save_portfolio.php      # API Write: Menyimpan data CMS ke database
│   ├── upload.php              # API Media: Secure Upload & Anti-executable Filter
│   └── login.php               # API Auth: Verifikasi kredensial admin & Session
├── uploads/                    # Folder penyimpanan lokal untuk file media di server
│   ├── profile/
│   ├── portfolio/
│   ├── works/
│   ├── background/
│   └── cv/
└── dist/                       # Output build dari 'npm run build' (File HTML/JS/CSS)
```

---

## 🛠️ Langkah-Langkah Deployment ke Hosting Pribadi

Ikuti panduan berikut untuk meluncurkan website portofolio dan portal admin Anda ke server hosting pribadi:

### 1. Bangun Aplikasi Frontend (Vite Build)
Sebelum mengunggah, kompilasi file React Anda menjadi aset statis:
```bash
npm install
npm run build
```
Seluruh file statis siap dideploy akan dikompilasi ke dalam folder `/dist`.

### 2. Unggah Source Code ke Hosting
* Masuk ke File Manager di cPanel/hosting Anda, atau hubungkan via klien FTP (seperti FileZilla).
* Unggah file dari folder `/dist` ke folder root public Anda (biasanya `public_html`).
* Unggah folder `config/`, `database/`, `api/`, dan buat folder `uploads/` langsung ke direktori public_html Anda.

### 3. Buat Database MySQL di Hosting
* Masuk ke kontrol panel hosting Anda (cPanel/DirectAdmin).
* Cari menu **MySQL Database Wizard** atau **Databases**.
* Buat database baru (misal: `u12345_portfolio`).
* Buat User Database baru (misal: `u12345_admin`) dengan password yang kuat.
* Hubungkan User ke Database tersebut dan berikan hak akses penuh (**All Privileges**).

### 4. Import Schema Database via phpMyAdmin
* Masuk ke menu **phpMyAdmin** di kontrol panel hosting Anda.
* Pilih nama database yang baru saja Anda buat di sidebar kiri.
* Klik tab **Import** di bagian menu atas.
* Pilih file `database/schema.sql` dari komputer Anda.
* Klik tombol **Go** atau **Import** di bagian bawah. Semua tabel yang diperlukan (admin, hero, profile, portfolio, dll.) akan terbuat otomatis lengkap dengan data awal.

### 5. Konfigurasi Database Lokal di Server
* Di File Manager hosting Anda, navigasikan ke dalam folder `config/`.
* Salin/rename file `database.example.php` menjadi `database.php`.
* Buka dan edit file `database.php` menggunakan editor bawaan hosting Anda.
* Isi placeholder dengan kredensial MySQL asli dari hosting Anda:
  ```php
  define('DB_HOST', 'localhost'); // Biasanya localhost
  define('DB_PORT', '3306');
  define('DB_NAME', 'nama_database_anda');
  define('DB_USER', 'username_database_anda');
  define('DB_PASSWORD', 'password_database_anda');
  
  // Masukkan kunci secret acak untuk mengamankan tanda tangan token admin
  define('API_SECRET_KEY', 'buat_kombinasi_karakter_unik_bebas_disini');
  ```
* *Kredensial database ini aman dan tidak akan pernah ter-push ke GitHub karena `config/database.php` terdaftar di `.gitignore`.*

### 6. Atur Permission Folder Uploads
Sistem upload file menyimpan gambar langsung di local directory server Anda. Agar PHP dapat menulis file ke disk, pastikan folder tersebut writable:
* Di File Manager hosting Anda, klik kanan folder `/uploads`.
* Pilih **Change Permissions** atau **File Permissions**.
* Atur kode permission menjadi **`0755`** (atau `0775` jika server hosting Anda membutuhkannya).
* Pastikan sub-folder di dalam `/uploads` berikut juga memiliki izin akses yang sama:
  * `/uploads/profile`
  * `/uploads/portfolio`
  * `/uploads/works`
  * `/uploads/background`
  * `/uploads/cv`

### 7. Hubungkan Domain Anda
* Pastikan Domain pribadi Anda sudah terhubung ke folder aplikasi utama (`public_html`).
* Jika Anda menempatkan API di sub-folder atau domain terpisah, buka `/src/config.ts` di komputer lokal Anda, sesuaikan konstanta `API_BASE_URL` ke domain baru Anda, lalu jalankan `npm run build` kembali dan unggah ulang file di folder `/dist`.

---

## 🧪 Panduan Pengujian Fitur setelah Live

Gunakan daftar pengujian berikut untuk memastikan seluruh sistem berjalan optimal:

### 1. Uji API
Akses URL ini di browser Anda: `https://domainanda.com/api/get_portfolio.php`
* **Hasil yang diharapkan**: Response JSON yang menampilkan `status: "success"` beserta seluruh struktur data portofolio dari MySQL.

### 2. Uji Login Admin
* Buka halaman Admin Portal (melalui tombol Control Panel di website Anda).
* Masukkan username: `admin` dan password: `adminpassword123` (password default dari schema.sql).
* **Hasil yang diharapkan**: Berhasil login, menerima token akses, dan masuk ke Dashboard Utama.
* *Sangat Direkomendasikan*: Segera ubah password default melalui query `UPDATE admin SET password_hash = ...` atau ganti langsung di tabel `admin` melalui phpMyAdmin menggunakan enkripsi `password_hash` PHP.

### 3. Uji Upload Gambar
* Di dalam Admin Portal, masuk ke tab Media Library atau coba ubah Foto Profil.
* Pilih file gambar (`.png` atau `.jpg`) dan klik unggah.
* **Hasil yang diharapkan**: Gambar berhasil diunggah, tersimpan di folder `/uploads`, dan terdaftar di database media. Anda dapat memverifikasi fisik file di dalam File Manager cPanel Anda.

### 4. Uji Public Portfolio
* Buka halaman utama portofolio Anda.
* **Hasil yang diharapkan**: Website menampilkan konten secara dinamis dari database MySQL (seperti teks hero, badge kreatif, list karya, dan info kontak) dengan performa loading instan dan efek visual/animasi premium yang lancar.
