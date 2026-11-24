<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Program::all()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'required|string',
        ]);

        $program = Program::create($data);

        return response()->json([
            'message' => 'Program berhasil dibuat.',
            'data' => $program,
        ], 201);
    }

    public function show(Program $program): JsonResponse
    {
        return response()->json(['data' => $program]);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $data = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'required|string',
        ]);

        $program->update($data);

        return response()->json([
            'message' => 'Program berhasil diperbarui.',
            'data' => $program->refresh(),
        ]);
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();

        return response()->json(['message' => 'Program berhasil dihapus.']);
    }
}
