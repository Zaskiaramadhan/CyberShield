<?php
// =====================================
// CONTROLLER: ProgramController
// Menerima request, memanggil Model,
// lalu mengirim data ke View
// =====================================

require_once __DIR__ . '/../Model/CyberShield.php';

class ProgramController
{
    // Halaman Program Prioritas: request -> controller -> model -> view
    public function index(): void
    {
        $cyberShield = $this->process();   // minta data dari Model
        $this->render('program-page', ['cyberShield' => $cyberShield]);   // kirim ke View
    }

    // PROCESS: mengambil data dari Model
    private function process(): CyberShield
    {
        return CyberShield::load();
    }

    // Meneruskan data ke View
    private function render(string $view, array $data): void
    {
        extract($data);   // $cyberShield tersedia di View
        require __DIR__ . '/../View/' . $view . '.php';
    }
}
