<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public const STATUSES = ['Direncanakan', 'Berjalan', 'Selesai'];

    // READ
    public function index()
    {
        $programs = Program::all();
        return view('programs.index', compact('programs'));
    }

    // CREATE (form)
    public function create()
    {
        return view('programs.create', ['statuses' => self::STATUSES]);
    }

    // CREATE (simpan)
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'status'    => 'required|in:' . implode(',', self::STATUSES),
        ]);

        Program::create($data);

        return redirect()->route('programs.index')->with('success', 'Program berhasil ditambahkan.');
    }

    // UPDATE (form)
    public function edit(Program $program)
    {
        return view('programs.edit', ['program' => $program, 'statuses' => self::STATUSES]);
    }

    // UPDATE (simpan)
    public function update(Request $request, Program $program)
    {
        $data = $request->validate([
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'status'    => 'required|in:' . implode(',', self::STATUSES),
        ]);

        $program->update($data);

        return redirect()->route('programs.index')->with('success', 'Program berhasil diperbarui.');
    }

    // DELETE
    public function destroy(Program $program)
    {
        $program->delete();

        return redirect()->route('programs.index')->with('success', 'Program berhasil dihapus.');
    }
}
