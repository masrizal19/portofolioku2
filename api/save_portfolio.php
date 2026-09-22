<?php
// ====================================================================
// API ENDPOINT: SAVE PORTFOLIO DATA (JSON POST)
// Safely updates all relational MySQL tables inside a secure Transaction
// ====================================================================

require_once __DIR__ . '/database.php';

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Use POST."]);
    exit();
}

// 1. Authenticate Request (Basic token checking, can be connected to custom login sessions)
// In production, matching a header or session token validates the admin identity.
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

// Basic session checks as fallback if no custom auth header is set
session_start();
$isAuthenticated = !empty($_SESSION['admin_logged_in']) || ($token === API_SECRET_KEY);

if (!$isAuthenticated && API_SECRET_KEY !== 'API_SECRET_KEY_PLACEHOLDER') {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access. Admin login required."]);
    exit();
}

// 2. Parse CMSData Payload
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

if (!$data || !isset($data['hero']) || !isset($data['profile'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid CMS payload structure."]);
    exit();
}

try {
    $pdo->beginTransaction();

    // -- Update Hero Settings --
    $hero = $data['hero'];
    $bg = $hero['heroBackground'] ?? [];
    $stmt = $pdo->prepare("UPDATE hero SET 
        nama = ?, nama_pendek = ?, kalimat_pembuka = ?, headline_utama = ?, headline_kedua = ?, visual_text = ?, 
        foto_profile_url = ?, foto_profile_source = ?, pengalaman_tahun = ?, jumlah_project = ?,
        bg_image_url = ?, bg_position_x = ?, bg_position_y = ?, bg_scale = ?, bg_opacity = ?, 
        bg_brightness = ?, bg_contrast = ?, bg_blur = ?, bg_overlay_opacity = ?, bg_overlay_color = ? 
        WHERE id = 1");
    $stmt->execute([
        $hero['nama'], $hero['namaPendek'], $hero['kalimatPembuka'], $hero['headlineUtama'], $hero['headlineKedua'], $hero['visualText'],
        is_array($hero['fotoProfile']) ? ($hero['fotoProfile']['url'] ?? '') : ($hero['fotoProfile'] ?? ''),
        is_array($hero['fotoProfile']) ? ($hero['fotoProfile']['source'] ?? 'EXTERNAL_URL') : 'EXTERNAL_URL',
        (int)$hero['statistikPengalaman'], (int)$hero['statistikJumlahProject'],
        $bg['image'] ?? null, (int)($bg['positionX'] ?? 50), (int)($bg['positionY'] ?? 50), (int)($bg['scale'] ?? 100), (int)($bg['opacity'] ?? 40),
        (int)($bg['brightness'] ?? 100), (int)($bg['contrast'] ?? 100), (int)($bg['blur'] ?? 0), (int)($bg['overlayOpacity'] ?? 30), $bg['overlayColor'] ?? '#1b1c23'
    ]);

    // -- Update Hero Badges --
    $pdo->exec("DELETE FROM hero_badges");
    if (isset($hero['badges']) && is_array($hero['badges'])) {
        $stmt = $pdo->prepare("INSERT INTO hero_badges (id, nama, warna_background, warna_text, posisi, visibility) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($hero['badges'] as $b) {
            $stmt->execute([
                $b['id'], $b['nama'], $b['warnaBackground'], $b['warnaText'], (int)$b['posisi'], (int)$b['visibility']
            ]);
        }
    }

    // -- Update Profile Settings --
    $profile = $data['profile'];
    $stmt = $pdo->prepare("UPDATE profile SET 
        nama = ?, deskripsi = ?, bio = ?, foto_profil_url = ?, cv_summary = ?, highlights = ?, informasi_profesional = ? 
        WHERE id = 1");
    $stmt->execute([
        $profile['nama'], $profile['deskripsi'], $profile['bio'],
        is_array($profile['fotoProfil']) ? ($profile['fotoProfil']['url'] ?? '') : ($profile['fotoProfil'] ?? ''),
        $profile['cvSummary'], json_encode($profile['highlights'] ?? []), json_encode($profile['informasiProfesional'] ?? [])
    ]);

    // -- Update Skills --
    $pdo->exec("DELETE FROM skills");
    if (isset($data['skills']) && is_array($data['skills'])) {
        $stmt = $pdo->prepare("INSERT INTO skills (id, nama, kategori, level, icon, deskripsi, urutan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['skills'] as $s) {
            $stmt->execute([
                $s['id'], $s['nama'], $s['kategori'], (int)$s['level'], $s['icon'], $s['deskripsi'], (int)$s['urutan'], $s['status']
            ]);
        }
    }

    // -- Update Portfolios (including Gallery images) --
    // Temporarily turn off foreign keys to easily re-insert
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DELETE FROM portfolio_images");
    $pdo->exec("DELETE FROM portfolios");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    if (isset($data['portfolio']) && is_array($data['portfolio'])) {
        $pStmt = $pdo->prepare("INSERT INTO portfolios (id, judul, slug, kategori, thumbnail_url, cover_url, deskripsi, client, tahun, role, tools, project_url, prototype_url, status, urutan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $gStmt = $pdo->prepare("INSERT INTO portfolio_images (portfolio_id, image_url, urutan) VALUES (?, ?, ?)");

        foreach ($data['portfolio'] as $p) {
            $pStmt->execute([
                $p['id'], $p['judul'], $p['slug'], $p['kategori'],
                is_array($p['thumbnail']) ? ($p['thumbnail']['url'] ?? '') : ($p['thumbnail'] ?? ''),
                is_array($p['cover']) ? ($p['cover']['url'] ?? '') : ($p['cover'] ?? ''),
                $p['deskripsi'], $p['client'] ?? '', (int)$p['tahun'], $p['role'],
                json_encode($p['tools'] ?? []), $p['projectURL'] ?? '', $p['prototypeURL'] ?? '', $p['status'], (int)$p['urutan']
            ]);

            if (isset($p['gallery']) && is_array($p['gallery'])) {
                $idx = 1;
                foreach ($p['gallery'] as $img) {
                    $imgUrl = is_array($img) ? ($img['url'] ?? '') : $img;
                    if (!empty($imgUrl)) {
                        $gStmt->execute([$p['id'], $imgUrl, $idx++]);
                    }
                }
            }
        }
    }

    // -- Update Works (Hasil Karya) --
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DELETE FROM work_images");
    $pdo->exec("DELETE FROM works");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    if (isset($data['hasilKarya']) && is_array($data['hasilKarya'])) {
        $wStmt = $pdo->prepare("INSERT INTO works (id, judul, kategori, gambar_url, deskripsi, tahun, tools, link, urutan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['hasilKarya'] as $wk) {
            $wStmt->execute([
                $wk['id'], $wk['judul'], $wk['kategori'],
                is_array($wk['gambar']) ? ($wk['gambar']['url'] ?? '') : ($wk['gambar'] ?? ''),
                $wk['deskripsi'], (int)$wk['tahun'], $wk['tools'], $wk['link'] ?? '', (int)$wk['urutan'], $wk['status']
            ]);
        }
    }

    // -- Update Process Steps --
    $pdo->exec("DELETE FROM process_steps");
    if (isset($data['prosesKerja']) && is_array($data['prosesKerja'])) {
        $stmt = $pdo->prepare("INSERT INTO process_steps (id, nomor, judul, deskripsi, icon, urutan, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['prosesKerja'] as $pk) {
            $stmt->execute([
                $pk['id'], $pk['nomor'], $pk['judul'], $pk['deskripsi'], $pk['icon'], (int)$pk['urutan'], $pk['status']
            ]);
        }
    }

    // -- Update Contacts --
    $c = $data['kontak'];
    $stmt = $pdo->prepare("UPDATE contacts SET 
        email = ?, telepon = ?, whatsapp = ?, cta_utama = ?, cta_kedua = ?, teks_kontak = ? 
        WHERE id = 1");
    $stmt->execute([
        $c['email'], $c['telepon'], $c['whatsapp'], $c['ctaUtama'], $c['ctaKedua'], $c['teksKontak']
    ]);

    // -- Update Social Links --
    $pdo->exec("DELETE FROM social_links");
    if (isset($data['sosialMedia']) && is_array($data['sosialMedia'])) {
        $stmt = $pdo->prepare("INSERT INTO social_links (id, nama, username, url, icon, urutan, visibility) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($data['sosialMedia'] as $sm) {
            $stmt->execute([
                $sm['id'], $sm['nama'], $sm['username'], $sm['URL'], $sm['icon'], (int)$sm['urutan'], (int)$sm['visibility']
            ]);
        }
    }

    // -- Update Site Settings (Background) --
    $bgData = $data['background'] ?? [];
    $stmt = $pdo->prepare("UPDATE site_settings SET 
        bg_type = ?, bg_solid_color = ?, bg_gradient_colors = ?, bg_image_url = ?, bg_video_url = ?, 
        bg_position = ?, bg_size = ?, bg_opacity = ?, bg_blur = ?, bg_brightness = ?, bg_contrast = ?, bg_overlay = ? 
        WHERE id = 1");
    $stmt->execute([
        $bgData['type'] ?? 'solid', $bgData['solidColor'] ?? '#1b1c23', $bgData['gradientColors'] ?? '#1b1c23, #23242c',
        is_array($bgData['image']) ? ($bgData['image']['url'] ?? '') : ($bgData['image'] ?? ''),
        $bgData['video'] ?? '', $bgData['position'] ?? 'center', $bgData['size'] ?? 'cover',
        (int)($bgData['opacity'] ?? 100), (int)($bgData['blur'] ?? 0), (int)($bgData['brightness'] ?? 100),
        (int)($bgData['contrast'] ?? 100), $bgData['overlay'] ?? 'rgba(27, 28, 35, 0.4)'
    ]);

    // -- Update Appearance Settings --
    $appData = $data['appearance'] ?? [];
    $stmt = $pdo->prepare("UPDATE appearance_settings SET 
        bg_color = ?, secondary_bg = ?, text_color = ?, muted_text = ?, accent_color = ?, 
        border_color = ?, border_radius = ?, typography_weight = ? 
        WHERE id = 1");
    $stmt->execute([
        $appData['backgroundColor'] ?? '#1b1c23', $appData['secondaryBackground'] ?? '#23242c',
        $appData['textColor'] ?? '#f6f6f8', $appData['mutedText'] ?? '#8e8f9b', $appData['accentColor'] ?? '#25d0a4',
        $appData['borderColor'] ?? '#3a3b45', $appData['borderRadius'] ?? '12px', $appData['typographyWeight'] ?? '300'
    ]);

    // -- Update Animation Settings (Motion) --
    $animData = $data['motion'] ?? [];
    $stmt = $pdo->prepare("UPDATE animation_settings SET 
        enabled = ?, speed = ?, reveal_intensity = ?, blur_intensity = ?, parallax_intensity = ?, hover_movement = ?, page_transition = ? 
        WHERE id = 1");
    $stmt->execute([
        (int)($animData['enabled'] ?? true), (float)($animData['speed'] ?? 1.00), (float)($animData['revealIntensity'] ?? 1.00),
        (float)($animData['blurIntensity'] ?? 1.00), (float)($animData['parallaxIntensity'] ?? 1.00),
        (float)($animData['hoverMovement'] ?? 1.00), $animData['pageTransition'] ?? 'fade'
    ]);

    // Commit Transaction
    $pdo->commit();

    echo json_encode(["status" => "success", "message" => "CMS settings saved successfully."]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database save transaction failed.",
        "debug" => $e->getMessage()
    ]);
}
