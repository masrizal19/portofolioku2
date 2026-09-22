<?php
// ====================================================================
// API ENDPOINT: GET ALL PORTFOLIO DATA (JSON)
// Drop-in compatible with frontend CMSData schema
// ====================================================================

require_once __DIR__ . '/database.php';

try {
    // 1. Hero Data
    $stmt = $pdo->query("SELECT * FROM hero LIMIT 1");
    $heroRow = $stmt->fetch();
    
    // Hero Badges
    $stmt = $pdo->query("SELECT * FROM hero_badges ORDER BY posisi ASC");
    $badges = [];
    while($row = $stmt->fetch()) {
        $badges[] = [
            "id" => $row['id'],
            "nama" => $row['nama'],
            "warnaBackground" => $row['warna_background'],
            "warnaText" => $row['warna_text'],
            "posisi" => (int)$row['posisi'],
            "visibility" => (bool)$row['visibility']
        ];
    }
    
    $hero = [
        "nama" => $heroRow['nama'] ?? "Alya Pratama",
        "namaPendek" => $heroRow['nama_pendek'] ?? "AYA",
        "kalimatPembuka" => $heroRow['kalimat_pembuka'] ?? "Halo, saya Alya Pratama alias AYA",
        "headlineUtama" => $heroRow['headline_utama'] ?? "Creative",
        "headlineKedua" => $heroRow['headline_kedua'] ?? "Designer",
        "visualText" => $heroRow['visual_text'] ?? "Visual",
        "fotoProfile" => $heroRow['foto_profile_url'] ?? "",
        "statistikPengalaman" => (int)($heroRow['pengalaman_tahun'] ?? 5),
        "statistikJumlahProject" => (int)($heroRow['jumlah_project'] ?? 60),
        "badges" => $badges,
        "heroBackground" => [
            "image" => $heroRow['bg_image_url'] ?? null,
            "positionX" => (int)($heroRow['bg_position_x'] ?? 50),
            "positionY" => (int)($heroRow['bg_position_y'] ?? 50),
            "scale" => (int)($heroRow['bg_scale'] ?? 100),
            "opacity" => (int)($heroRow['bg_opacity'] ?? 40),
            "brightness" => (int)($heroRow['bg_brightness'] ?? 100),
            "contrast" => (int)($heroRow['bg_contrast'] ?? 100),
            "blur" => (int)($heroRow['bg_blur'] ?? 0),
            "overlayOpacity" => (int)($heroRow['bg_overlay_opacity'] ?? 30),
            "overlayColor" => $heroRow['bg_overlay_color'] ?? '#1b1c23'
        ]
    ];

    // 2. Profile Data
    $stmt = $pdo->query("SELECT * FROM profile LIMIT 1");
    $profileRow = $stmt->fetch();
    $profile = [
        "nama" => $profileRow['nama'] ?? "Alya Pratama",
        "deskripsi" => $profileRow['deskripsi'] ?? "",
        "bio" => $profileRow['bio'] ?? "",
        "fotoProfil" => $profileRow['foto_profil_url'] ?? "",
        "cvSummary" => $profileRow['cv_summary'] ?? "",
        "highlights" => json_decode($profileRow['highlights'] ?? '[]', true),
        "informasiProfesional" => json_decode($profileRow['informasi_profesional'] ?? '[]', true)
    ];

    // 3. Skills Data
    $stmt = $pdo->query("SELECT * FROM skills ORDER BY urutan ASC");
    $skills = [];
    while($row = $stmt->fetch()) {
        $skills[] = [
            "id" => $row['id'],
            "nama" => $row['nama'],
            "kategori" => $row['kategori'],
            "level" => (int)$row['level'],
            "icon" => $row['icon'],
            "deskripsi" => $row['deskripsi'],
            "urutan" => (int)$row['urutan'],
            "status" => $row['status']
        ];
    }

    // 4. Portfolios Data
    $stmt = $pdo->query("SELECT * FROM portfolios ORDER BY urutan ASC");
    $portfolio = [];
    while($row = $stmt->fetch()) {
        // Fetch gallery images
        $gStmt = $pdo->prepare("SELECT image_url FROM portfolio_images WHERE portfolio_id = ? ORDER BY urutan ASC");
        $gStmt->execute([$row['id']]);
        $gallery = $gStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

        $portfolio[] = [
            "id" => $row['id'],
            "judul" => $row['judul'],
            "slug" => $row['slug'],
            "kategori" => $row['kategori'],
            "thumbnail" => $row['thumbnail_url'],
            "cover" => $row['cover_url'],
            "gallery" => $gallery,
            "deskripsi" => $row['deskripsi'],
            "client" => $row['client'] ?? "",
            "tahun" => (int)$row['tahun'],
            "role" => $row['role'],
            "tools" => json_decode($row['tools'] ?? '[]', true),
            "projectURL" => $row['project_url'] ?? "",
            "prototypeURL" => $row['prototype_url'] ?? "",
            "status" => $row['status'],
            "urutan" => (int)$row['urutan']
        ];
    }

    // 5. Hasil Karya Data
    $stmt = $pdo->query("SELECT * FROM works ORDER BY urutan ASC");
    $hasilKarya = [];
    while($row = $stmt->fetch()) {
        $hasilKarya[] = [
            "id" => $row['id'],
            "judul" => $row['judul'],
            "kategori" => $row['kategori'],
            "gambar" => $row['gambar_url'],
            "deskripsi" => $row['deskripsi'],
            "tahun" => (int)$row['tahun'],
            "tools" => $row['tools'],
            "link" => $row['link'] ?? "",
            "urutan" => (int)$row['urutan'],
            "status" => $row['status']
        ];
    }

    // 6. Proses Kerja Data
    $stmt = $pdo->query("SELECT * FROM process_steps ORDER BY urutan ASC");
    $prosesKerja = [];
    while($row = $stmt->fetch()) {
        $prosesKerja[] = [
            "id" => $row['id'],
            "nomor" => $row['nomor'],
            "judul" => $row['judul'],
            "deskripsi" => $row['deskripsi'],
            "icon" => $row['icon'],
            "urutan" => (int)$row['urutan'],
            "status" => $row['status']
        ];
    }

    // 7. Kontak Data
    $stmt = $pdo->query("SELECT * FROM contacts LIMIT 1");
    $contactsRow = $stmt->fetch();
    $kontak = [
        "email" => $contactsRow['email'] ?? "",
        "telepon" => $contactsRow['telepon'] ?? "",
        "whatsapp" => $contactsRow['whatsapp'] ?? "",
        "ctaUtama" => $contactsRow['cta_utama'] ?? "",
        "ctaKedua" => $contactsRow['cta_kedua'] ?? "",
        "teksKontak" => $contactsRow['teks_kontak'] ?? ""
    ];

    // 8. Sosial Media Data
    $stmt = $pdo->query("SELECT * FROM social_links ORDER BY urutan ASC");
    $sosialMedia = [];
    while($row = $stmt->fetch()) {
        $sosialMedia[] = [
            "id" => $row['id'],
            "nama" => $row['nama'],
            "username" => $row['username'],
            "URL" => $row['url'],
            "icon" => $row['icon'],
            "urutan" => (int)$row['urutan'],
            "visibility" => (bool)$row['visibility']
        ];
    }

    // 9. Media Library
    $stmt = $pdo->query("SELECT * FROM media ORDER BY upload_date DESC");
    $mediaLibrary = [];
    while($row = $stmt->fetch()) {
        $mediaLibrary[] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "type" => $row['type'],
            "size" => (int)$row['size'],
            "uploadDate" => $row['upload_date'],
            "url" => $row['url'],
            "inUse" => (bool)$row['in_use']
        ];
    }

    // 10. Background Data (site_settings)
    $stmt = $pdo->query("SELECT * FROM site_settings LIMIT 1");
    $bgRow = $stmt->fetch();
    $background = [
        "type" => $bgRow['bg_type'] ?? "solid",
        "solidColor" => $bgRow['bg_solid_color'] ?? "#1b1c23",
        "gradientColors" => $bgRow['bg_gradient_colors'] ?? "#1b1c23, #23242c",
        "image" => $bgRow['bg_image_url'] ?? "",
        "video" => $bgRow['bg_video_url'] ?? "",
        "position" => $bgRow['bg_position'] ?? "center",
        "size" => $bgRow['bg_size'] ?? "cover",
        "opacity" => (int)($bgRow['bg_opacity'] ?? 100),
        "blur" => (int)($bgRow['bg_blur'] ?? 0),
        "brightness" => (int)($bgRow['bg_brightness'] ?? 100),
        "contrast" => (int)($bgRow['bg_contrast'] ?? 100),
        "overlay" => $bgRow['bg_overlay'] ?? "rgba(27, 28, 35, 0.4)"
    ];

    // 11. Appearance Settings
    $stmt = $pdo->query("SELECT * FROM appearance_settings LIMIT 1");
    $appRow = $stmt->fetch();
    $appearance = [
        "backgroundColor" => $appRow['bg_color'] ?? "#1b1c23",
        "secondaryBackground" => $appRow['secondary_bg'] ?? "#23242c",
        "textColor" => $appRow['text_color'] ?? "#f6f6f8",
        "mutedText" => $appRow['muted_text'] ?? "#8e8f9b",
        "accentColor" => $appRow['accent_color'] ?? "#25d0a4",
        "borderColor" => $appRow['border_color'] ?? "#3a3b45",
        "borderRadius" => $appRow['border_radius'] ?? "12px",
        "typographyWeight" => $appRow['typography_weight'] ?? "300"
    ];

    // 12. Motion Settings
    $stmt = $pdo->query("SELECT * FROM animation_settings LIMIT 1");
    $animRow = $stmt->fetch();
    $motion = [
        "enabled" => (bool)($animRow['enabled'] ?? true),
        "speed" => (float)($animRow['speed'] ?? 1.00),
        "revealIntensity" => (float)($animRow['reveal_intensity'] ?? 1.00),
        "blurIntensity" => (float)($animRow['blur_intensity'] ?? 1.00),
        "parallaxIntensity" => (float)($animRow['parallax_intensity'] ?? 1.00),
        "hoverMovement" => (float)($animRow['hover_movement'] ?? 1.00),
        "pageTransition" => $animRow['page_transition'] ?? "fade"
    ];

    // Output JSON
    echo json_encode([
        "status" => "success",
        "data" => [
            "hero" => $hero,
            "profile" => $profile,
            "skills" => $skills,
            "portfolio" => $portfolio,
            "hasilKarya" => $hasilKarya,
            "prosesKerja" => $prosesKerja,
            "kontak" => $kontak,
            "sosialMedia" => $sosialMedia,
            "mediaLibrary" => $mediaLibrary,
            "background" => $background,
            "appearance" => $appearance,
            "motion" => $motion
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "SQL fetch failure occurred.",
        "debug" => $e->getMessage()
    ]);
}
