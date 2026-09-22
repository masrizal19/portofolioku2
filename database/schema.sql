-- ====================================================================
-- ALYA PORTFOLIO CMS DATABASE SCHEMA
-- Compatible with MySQL 5.7+ / MariaDB 10+
-- Import this file manually via phpMyAdmin
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `animation_settings`;
DROP TABLE IF EXISTS `appearance_settings`;
DROP TABLE IF EXISTS `site_settings`;
DROP TABLE IF EXISTS `media`;
DROP TABLE IF EXISTS `social_links`;
DROP TABLE IF EXISTS `contacts`;
DROP TABLE IF EXISTS `process_steps`;
DROP TABLE IF EXISTS `work_images`;
DROP TABLE IF EXISTS `works`;
DROP TABLE IF EXISTS `portfolio_images`;
DROP TABLE IF EXISTS `portfolios`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `profile`;
DROP TABLE IF EXISTS `hero_badges`;
DROP TABLE IF EXISTS `hero`;
DROP TABLE IF EXISTS `admin`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. admin Table
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Admin (default password: 'adminpassword123', hash generated via password_hash)
INSERT INTO `admin` (`id`, `username`, `password_hash`, `email`) VALUES
(1, 'admin', '$2y$10$fVqKzIqO8tE784Ncl9I0Nen7rXfXoD9pL1W0zM0y6lqD31BwD4bpe', 'admin@example.com');


-- 2. hero Table
CREATE TABLE `hero` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `nama_pendek` varchar(50) NOT NULL,
  `kalimat_pembuka` varchar(255) NOT NULL,
  `headline_utama` varchar(100) NOT NULL,
  `headline_kedua` varchar(100) NOT NULL,
  `visual_text` varchar(100) NOT NULL,
  `foto_profile_url` text DEFAULT NULL,
  `foto_profile_source` varchar(20) DEFAULT 'EXTERNAL_URL',
  `pengalaman_tahun` int(11) DEFAULT 0,
  `jumlah_project` int(11) DEFAULT 0,
  -- Background settings integrated
  `bg_image_url` text DEFAULT NULL,
  `bg_position_x` int(11) DEFAULT 50,
  `bg_position_y` int(11) DEFAULT 50,
  `bg_scale` int(11) DEFAULT 100,
  `bg_opacity` int(11) DEFAULT 40,
  `bg_brightness` int(11) DEFAULT 100,
  `bg_contrast` int(11) DEFAULT 100,
  `bg_blur` int(11) DEFAULT 0,
  `bg_overlay_opacity` int(11) DEFAULT 30,
  `bg_overlay_color` varchar(20) DEFAULT '#1b1c23',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hero` (`id`, `nama`, `nama_pendek`, `kalimat_pembuka`, `headline_utama`, `headline_kedua`, `visual_text`, `foto_profile_url`, `foto_profile_source`, `pengalaman_tahun`, `jumlah_project`) VALUES
(1, 'Alya Pratama', 'AYA', 'Halo, saya Alya Pratama alias AYA', 'Creative', 'Designer', 'Visual', '', 'EXTERNAL_URL', 5, 60);


-- 3. hero_badges Table
CREATE TABLE `hero_badges` (
  `id` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `warna_background` varchar(50) NOT NULL DEFAULT 'mint',
  `warna_text` varchar(50) NOT NULL DEFAULT '#1b1c23',
  `posisi` int(11) NOT NULL DEFAULT 1,
  `visibility` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hero_badges` (`id`, `nama`, `warna_background`, `warna_text`, `posisi`, `visibility`) VALUES
('b1', 'Brand Designer', 'mint', '#1b1c23', 1, 1),
('b2', 'Product Designer', 'coral', '#1b1c23', 2, 1),
('b3', 'UI/UX Designer', 'violet', '#1b1c23', 3, 1);


-- 4. profile Table
CREATE TABLE `profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `bio` text NOT NULL,
  `foto_profil_url` text DEFAULT NULL,
  `cv_summary` text NOT NULL,
  `highlights` text NOT NULL, -- JSON or serialized string array
  `informasi_profesional` text NOT NULL, -- JSON format key-value pairs
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `profile` (`id`, `nama`, `deskripsi`, `bio`, `foto_profil_url`, `cv_summary`, `highlights`, `informasi_profesional`) VALUES
(1, 'Alya Pratama', 'Saya membuat antarmuka yang tidak konvensional namun fungsional dan enak dipakai, untuk mobile dan web.', 'Desainer produk yang senang merancang pengalaman digital yang terasa sederhana dan hidup. Dengan latar belakang desain grafis dan riset pengguna, saya menerjemahkan ide menjadi antarmuka yang intuitif dan indah dipakai. Pendekatan saya berakar pada empati, ketelitian pada detail, dan komitmen untuk terus belajar.', '', 'Desainer Visual & Produk dengan 5+ tahun pengalaman dalam membangun aplikasi mobile, sistem informasi, dan brand digital.', '["Senior Product Designer — Creative Studio (2023 - Sekarang)","UI/UX Designer — Digital Agency (2021 - 2023)","Visual Designer — Freelance & Open Source (2019 - 2021)"]', '[{"key":"Keahlian","value":"Figma, UI Animation, Design Systems, User Research, Mobile App Design"},{"key":"Bahasa","value":"Bahasa Indonesia (Native), English (Professional)"},{"key":"Lokasi","value":"Jakarta, Indonesia (Available for Remote/Hybrid)"}]');


-- 5. skills Table
CREATE TABLE `skills` (
  `id` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `level` int(11) NOT NULL DEFAULT 0,
  `icon` varchar(50) NOT NULL,
  `deskripsi` varchar(255) NOT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  `status` varchar(20) NOT NULL DEFAULT 'PUBLISHED',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `skills` (`id`, `nama`, `kategori`, `level`, `icon`, `deskripsi`, `urutan`, `status`) VALUES
('s1', 'Figma & Design Systems', 'Design', 95, 'Palette', 'Merancang komponen reusable, variable, auto-layout, dan library berskala besar.', 1, 'PUBLISHED'),
('s2', 'UI Animation', 'Design', 88, 'Activity', 'Membuat animasi transisi mikro dan prototype interaktif berpresisi tinggi.', 2, 'PUBLISHED'),
('s3', 'User Research & Wireframing', 'Research', 82, 'Search', 'Melakukan wawancara pengguna, usability testing, dan pemetaan alur pengguna.', 3, 'PUBLISHED'),
('s4', 'React & Tailwind CSS', 'Development', 78, 'Code2', 'Mengimplementasikan UI design ke dalam baris kode frontend modern yang responsif.', 4, 'PUBLISHED');


-- 6. portfolios Table
CREATE TABLE `portfolios` (
  `id` varchar(50) NOT NULL,
  `judul` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL UNIQUE,
  `kategori` varchar(100) NOT NULL,
  `thumbnail_url` text NOT NULL,
  `cover_url` text NOT NULL,
  `deskripsi` text NOT NULL,
  `client` varchar(100) DEFAULT NULL,
  `tahun` int(11) NOT NULL,
  `role` varchar(100) NOT NULL,
  `tools` text NOT NULL, -- JSON array of tools used
  `project_url` varchar(255) DEFAULT NULL,
  `prototype_url` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PUBLISHED',
  `urutan` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `portfolios` (`id`, `judul`, `slug`, `kategori`, `thumbnail_url`, `cover_url`, `deskripsi`, `client`, `tahun`, `role`, `tools`, `project_url`, `prototype_url`, `status`, `urutan`) VALUES
('p1', 'Kopi Senja App', 'kopi-senja-app', 'Mobile App', 'green-phone', 'green-phone', 'Proyek Kopi Senja App berfokus pada perancangan sistem visual, pengalaman pengguna yang intuitif, serta arsitektur antarmuka modern yang fungsional.', 'Kopi Senja Co.', 2024, 'Lead Visual & UI/UX Designer', '["Figma","Prototyping","Design System"]', 'https://kopisenja.example.com', 'https://figma.example.com/kopi-senja', 'PUBLISHED', 1),
('p2', 'Rumah Denim', 'rumah-denim', 'E-Commerce Website', 'blue-layers', 'blue-layers', 'Website e-commerce premium untuk produk denim berkualitas tinggi, mengedepankan editorial visual yang estetik dan minimalis.', 'Rumah Denim Inc.', 2023, 'UI Designer & Brand Strategy', '["Figma","UI Animation","Tailwind CSS"]', 'https://rumahdenim.example.com', '', 'PUBLISHED', 2),
('p3', 'Portal Iklim Daerah', 'portal-iklim-daerah', 'Sistem Informasi', 'gold-charts', 'gold-charts', 'Sistem informasi pemantauan iklim, kualitas udara, dan kelestarian lingkungan hidup regional secara real-time dan interaktif.', 'Badan Lingkungan Hidup', 2024, 'Lead Dashboard & UI Designer', '["Data Visualization","Figma","React"]', 'https://iklim.example.org', '', 'PUBLISHED', 3),
('p4', 'Kelas Pintar', 'kelas-pintar', 'EdTech App', 'blue-laptop', 'blue-laptop', 'Platform mobile pembelajaran interaktif untuk anak sekolah dengan gamifikasi dan visual learning yang menyenangkan.', 'Yayasan Indonesia Pintar', 2023, 'Product Designer', '["User Research","Mobile Layout","Figma"]', '', 'https://figma.example.com/kelas-pintar', 'PUBLISHED', 4);


-- 7. portfolio_images Table (Gallery images)
CREATE TABLE `portfolio_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `portfolio_id` varchar(50) NOT NULL,
  `image_url` text NOT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8. works Table (Hasil Karya)
CREATE TABLE `works` (
  `id` varchar(50) NOT NULL,
  `judul` varchar(150) NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `gambar_url` text NOT NULL,
  `deskripsi` text NOT NULL,
  `tahun` int(11) NOT NULL,
  `tools` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  `status` varchar(20) NOT NULL DEFAULT 'PUBLISHED',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `works` (`id`, `judul`, `kategori`, `gambar_url`, `deskripsi`, `tahun`, `tools`, `link`, `urutan`, `status`) VALUES
('k1', 'Senja Mountains Contour', 'ilustrasi', 'scenery-card', 'Karya seni pemandangan gunung dengan gradasi warna langit senja yang menenangkan.', 2024, 'Adobe Illustrator', '', 1, 'PUBLISHED'),
('k2', 'Organic Geometry Pattern', 'mockup', 'contour-card', 'Eksperimen pola geometris elips berlapis untuk desain packaging premium.', 2023, 'Figma', '', 2, 'PUBLISHED'),
('k3', 'Neon Phone Interface', 'UI design', 'phone-card', 'Eksplorasi antarmuka ponsel bernuansa gradasi cerah neon dengan dark background.', 2024, 'Figma, Spline', '', 3, 'PUBLISHED');


-- 9. work_images Table
CREATE TABLE `work_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `work_id` varchar(50) NOT NULL,
  `image_url` text NOT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`work_id`) REFERENCES `works` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 10. process_steps Table (Proses Kerja)
CREATE TABLE `process_steps` (
  `id` varchar(50) NOT NULL,
  `nomor` varchar(10) NOT NULL,
  `judul` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `icon` varchar(50) NOT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  `status` varchar(20) NOT NULL DEFAULT 'PUBLISHED',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `process_steps` (`id`, `nomor`, `judul`, `deskripsi`, `icon`, `urutan`, `status`) VALUES
('pk1', '01', 'Pahami', 'Riset pengguna / Wawancara mendalam', 'HelpCircle', 1, 'PUBLISHED'),
('pk2', '02', 'Rumuskan', 'User story / Alur pengguna', 'Compass', 2, 'PUBLISHED'),
('pk3', '03', 'Rancang', 'Panduan gaya / Wireframe & prototipe', 'Layers', 3, 'PUBLISHED'),
('pk4', '04', 'Serahkan', 'Handoff ke developer / Uji kegunaan', 'CheckCircle2', 4, 'PUBLISHED');


-- 11. contacts Table
CREATE TABLE `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `telepon` varchar(50) NOT NULL,
  `whatsapp` varchar(50) NOT NULL,
  `cta_utama` varchar(100) NOT NULL,
  `cta_kedua` varchar(100) NOT NULL,
  `teks_kontak` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `contacts` (`id`, `email`, `telepon`, `whatsapp`, `cta_utama`, `cta_kedua`, `teks_kontak`) VALUES
(1, 'halo@namakamu.com', '+62 812-0000-0000', '6281200000000', 'Kirim pesan', 'Diskusi proyek', 'Ayo bekerja sama.');


-- 12. social_links Table
CREATE TABLE `social_links` (
  `id` varchar(50) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `url` text NOT NULL,
  `icon` varchar(50) NOT NULL,
  `urutan` int(11) NOT NULL DEFAULT 1,
  `visibility` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `social_links` (`id`, `nama`, `username`, `url`, `icon`, `urutan`, `visibility`) VALUES
('sm1', 'Instagram', '@namakamu', 'https://instagram.com', 'instagram', 1, 1),
('sm2', 'LinkedIn', '/in/namakamu', 'https://linkedin.com', 'linkedin', 2, 1),
('sm3', 'Behance', '/namakamu', 'https://behance.net', 'behance', 3, 1),
('sm4', 'Dribbble', '/namakamu', 'https://dribbble.com', 'dribbble', 4, 1);


-- 13. media Table (Media Library)
CREATE TABLE `media` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `size` int(11) NOT NULL,
  `upload_date` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `in_use` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `media` (`id`, `name`, `type`, `size`, `upload_date`, `url`, `in_use`) VALUES
('ml1', 'avatar_alya.png', 'image/png', 142000, '2026-09-21', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 1),
('ml2', 'coffee_app_thumbnail.png', 'image/png', 423000, '2026-09-20', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400', 1),
('ml3', 'resume_alya_pratama.pdf', 'application/pdf', 1045000, '2026-09-18', '#', 1);


-- 14. site_settings Table (Background settings)
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bg_type` varchar(20) NOT NULL DEFAULT 'solid',
  `bg_solid_color` varchar(50) NOT NULL DEFAULT '#1b1c23',
  `bg_gradient_colors` varchar(100) NOT NULL DEFAULT '#1b1c23, #23242c',
  `bg_image_url` text DEFAULT NULL,
  `bg_video_url` text DEFAULT NULL,
  `bg_position` varchar(50) NOT NULL DEFAULT 'center',
  `bg_size` varchar(50) NOT NULL DEFAULT 'cover',
  `bg_opacity` int(11) NOT NULL DEFAULT 100,
  `bg_blur` int(11) NOT NULL DEFAULT 0,
  `bg_brightness` int(11) NOT NULL DEFAULT 100,
  `bg_contrast` int(11) NOT NULL DEFAULT 100,
  `bg_overlay` varchar(100) NOT NULL DEFAULT 'rgba(27, 28, 35, 0.4)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`id`, `bg_type`, `bg_solid_color`, `bg_gradient_colors`, `bg_image_url`, `bg_video_url`, `bg_position`, `bg_size`, `bg_opacity`, `bg_blur`, `bg_brightness`, `bg_contrast`, `bg_overlay`) VALUES
(1, 'solid', '#1b1c23', '#1b1c23, #23242c', '', '', 'center', 'cover', 100, 0, 100, 100, 'rgba(27, 28, 35, 0.4)');


-- 15. appearance_settings Table
CREATE TABLE `appearance_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bg_color` varchar(50) NOT NULL DEFAULT '#1b1c23',
  `secondary_bg` varchar(50) NOT NULL DEFAULT '#23242c',
  `text_color` varchar(50) NOT NULL DEFAULT '#f6f6f8',
  `muted_text` varchar(50) NOT NULL DEFAULT '#8e8f9b',
  `accent_color` varchar(50) NOT NULL DEFAULT '#25d0a4',
  `border_color` varchar(50) NOT NULL DEFAULT '#3a3b45',
  `border_radius` varchar(20) NOT NULL DEFAULT '12px',
  `typography_weight` varchar(20) NOT NULL DEFAULT '300',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `appearance_settings` (`id`, `bg_color`, `secondary_bg`, `text_color`, `muted_text`, `accent_color`, `border_color`, `border_radius`, `typography_weight`) VALUES
(1, '#1b1c23', '#23242c', '#f6f6f8', '#8e8f9b', '#25d0a4', '#3a3b45', '12px', '300');


-- 16. animation_settings Table (Motion)
CREATE TABLE `animation_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `speed` decimal(3,2) NOT NULL DEFAULT 1.00,
  `reveal_intensity` decimal(3,2) NOT NULL DEFAULT 1.00,
  `blur_intensity` decimal(3,2) NOT NULL DEFAULT 1.00,
  `parallax_intensity` decimal(3,2) NOT NULL DEFAULT 1.00,
  `hover_movement` decimal(3,2) NOT NULL DEFAULT 1.00,
  `page_transition` varchar(50) NOT NULL DEFAULT 'fade',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `animation_settings` (`id`, `enabled`, `speed`, `reveal_intensity`, `blur_intensity`, `parallax_intensity`, `hover_movement`, `page_transition`) VALUES
(1, 1, 1.00, 1.00, 1.00, 1.00, 1.00, 'fade');
