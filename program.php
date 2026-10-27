```php
<?php
// =====================================
// 1. VARIABEL PHP
// =====================================

$CyberShield = "CyberShield";
$periode = "2026";
$statusprogram = "Berjalan";

// =====================================
// 2. ARRAY MULTIDIMENSI
// =====================================

$programprioritas = [
    [
        "nama" => "Keamanan Link dan File",
        "deskripsi" => "Membantu pengguna mengenali tautan dan file yang mencurigakan.",
        "status" => "Berjalan"
    ],
    [
        "nama" => "Edukasi Social Engineering",
        "deskripsi" => "Meningkatkan pemahaman pengguna tentang phishing, baiting, dan smishing.",
        "status" => "Berjalan"
    ],
    [
        "nama" => "Keamanan Kata Sandi",
        "deskripsi" => "Memberikan edukasi mengenai kata sandi yang kuat dan perlindungan akun.",
        "status" => "Direncanakan"
    ],
    [
        "nama" => "Edukasi Data Breach",
        "deskripsi" => "Menyajikan contoh insiden kebocoran data agar pengguna lebih waspada.",
        "status" => "Selesai"
    ]
];

// =====================================
// 3. MENENTUKAN BADGE STATUS
// =====================================

function statusBadge($status)
{
    if ($status === "Berjalan") {
        return "bg-green-100 text-green-700";
    } elseif ($status === "Direncanakan") {
        return "bg-amber-100 text-amber-700";
    } elseif ($status === "Selesai") {
        return "bg-sky-100 text-sky-700";
    } else {
        return "bg-red-100 text-red-700";
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Program Prioritas - <?= htmlspecialchars($CyberShield) ?></title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-slate-50 font-sans text-gray-800">

    <!-- HEADER -->
    <header class="bg-slate-900 px-8 py-5 text-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between">
            <h1 class="text-2xl font-bold">
                <?= htmlspecialchars($CyberShield) ?>
            </h1>

            <a href="Index.html"
               class="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-700">
                Kembali ke Home
            </a>
        </div>
    </header>

    <!-- INFORMASI PROGRAM -->
    <main class="mx-auto max-w-6xl px-6 py-12">

        <section class="mb-10 rounded-2xl bg-sky-100 p-8">
            <p class="mb-2 font-semibold text-sky-700">
                PROGRAM CYBERSHIELD
            </p>

            <h2 class="mb-4 text-3xl font-bold text-slate-900">
                Program Prioritas <?= htmlspecialchars($periode) ?>
            </h2>

            <p class="mb-4">
                Daftar program prioritas untuk meningkatkan
                kesadaran dan keamanan pengguna di dunia digital.
            </p>

            <p>
                Status keseluruhan:
                <span class="rounded-full px-3 py-1 text-sm font-bold
                    <?= statusBadge($statusprogram) ?>">
                    <?= htmlspecialchars($statusprogram) ?>
                </span>
            </p>
        </section>

        <!-- DYNAMIC GRID CARDS -->
        <section>
            <h2 class="mb-6 text-2xl font-bold text-slate-900">
                Daftar Program Prioritas
            </h2>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <?php foreach ($programprioritas as $index => $program): ?>

                    <article class="flex flex-col rounded-xl bg-white p-6 shadow-md">

                        <!-- NOMOR URUT -->
                        <span class="mb-4 flex h-10 w-10 items-center justify-center
                                     rounded-full bg-sky-100 font-bold text-sky-700">
                            <?= $index + 1 ?>
                        </span>

                        <!-- NAMA PROGRAM -->
                        <h3 class="mb-3 text-xl font-bold text-sky-700">
                            <?= htmlspecialchars($program["nama"]) ?>
                        </h3>

                        <!-- DESKRIPSI -->
                        <p class="mb-5 flex-grow text-sm leading-6 text-slate-600">
                            <?= htmlspecialchars($program["deskripsi"]) ?>
                        </p>

                        <!-- BADGE STATUS -->
                        <div>
                            <span class="inline-block rounded-full px-3 py-1
                                         text-sm font-bold
                                <?= statusBadge($program["status"]) ?>">
                                <?= htmlspecialchars($program["status"]) ?>
                            </span>
                        </div>

                    </article>

                <?php endforeach; ?>

            </div>
        </section>

        <!-- INFORMASI JUMLAH PROGRAM -->
        <p class="mt-8 text-sm text-slate-500">
            Total program prioritas:
            <strong><?= count($programprioritas) ?> program</strong>
        </p>

    </main>

    <!-- FOOTER -->
    <footer class="bg-slate-900 p-6 text-center text-white">
        <p>&copy; <?= htmlspecialchars($periode) ?>
            <?= htmlspecialchars($CyberShield) ?>
        </p>
    </footer>

</body>
</html>
