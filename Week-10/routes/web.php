<?php

use App\Http\Controllers\ProgramController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('programs.index'));

Route::resource('programs', ProgramController::class)->except('show');
