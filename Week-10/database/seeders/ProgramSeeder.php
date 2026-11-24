<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    // Data awal = 4 program yang sebelumnya hard-code di Model/CyberShield.php (week 7)
    public function run(): void
    {
        $programs = [
            ['nama' => 'Keamanan Link dan File',       'deskripsi' => 'Membantu pengguna mengenali tautan dan file yang mencurigakan.',                      'status' => 'Berjalan'],
            ['nama' => 'Edukasi Social Engineering',   'deskripsi' => 'Meningkatkan pemahaman pengguna tentang phishing, baiting, dan smishing.',            'status' => 'Berjalan'],
            ['nama' => 'Keamanan Kata Sandi',          'deskripsi' => 'Memberikan edukasi mengenai kata sandi yang kuat dan perlindungan akun.',             'status' => 'Direncanakan'],
            ['nama' => 'Edukasi Data Breach',          'deskripsi' => 'Menyajikan contoh insiden kebocoran data agar pengguna lebih waspada.',               'status' => 'Selesai'],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }
    }
}
