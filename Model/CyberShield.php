<?php
require_once __DIR__ . '/Program.php';

class CyberShield
{
    private string $nama;
    private string $periode;
    private string $status;
    private array $programs = [];

    public function __construct(string $nama, string $periode, string $status)
    {
        $this->nama = $nama;
        $this->periode = $periode;
        $this->status = $status;
    }

    public function getNama(): string { return $this->nama; }
    public function getPeriode(): string { return $this->periode; }
    public function getStatus(): string { return $this->status; }

    public function getStatusBadge(): string
    {
        return Program::badgeUntuk($this->status);
    }

    public function addProgram(Program $program): void
    {
        $this->programs[] = $program;
    }

    public function getPrograms(): array { return $this->programs; }

    public function getTotalPrograms(): int { return count($this->programs); }

    public static function load(): CyberShield
    {
        $cyberShield = new CyberShield("CyberShield", "2026", "Berjalan");

        $cyberShield->addProgram(new Program(
            "Keamanan Link dan File",
            "Membantu pengguna mengenali tautan dan file yang mencurigakan.",
            "Berjalan"
        ));
        $cyberShield->addProgram(new Program(
            "Edukasi Social Engineering",
            "Meningkatkan pemahaman pengguna tentang phishing, baiting, dan smishing.",
            "Berjalan"
        ));
        $cyberShield->addProgram(new Program(
            "Keamanan Kata Sandi",
            "Memberikan edukasi mengenai kata sandi yang kuat dan perlindungan akun.",
            "Direncanakan"
        ));
        $cyberShield->addProgram(new Program(
            "Edukasi Data Breach",
            "Menyajikan contoh insiden kebocoran data agar pengguna lebih waspada.",
            "Selesai"
        ));

        return $cyberShield;
    }
}