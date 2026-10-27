<?php
class Program
{
    private string $nama;
    private string $deskripsi;
    private string $status;

    public function __construct(string $nama, string $deskripsi, string $status)
    {
        $this->nama = $nama;
        $this->deskripsi = $deskripsi;
        $this->status = $status;
    }

    public function getNama(): string { return $this->nama; }
    public function getDeskripsi(): string { return $this->deskripsi; }
    public function getStatus(): string { return $this->status; }

    public function getStatusBadge(): string
    {
        return Program::badgeUntuk($this->status);
    }

    public static function badgeUntuk(string $status): string
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
}