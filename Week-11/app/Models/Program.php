<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'nama',
        'deskripsi',
        'status',
    ];

    // Pengganti Program::badgeUntuk() di PHP MVC week 7
    public function badgeClass(): string
    {
        return match ($this->status) {
            'Berjalan'     => 'bg-green-100 text-green-700',
            'Direncanakan' => 'bg-amber-100 text-amber-700',
            'Selesai'      => 'bg-sky-100 text-sky-700',
            default        => 'bg-red-100 text-red-700',
        };
    }
}
