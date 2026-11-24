@extends('layouts.app')

@section('title', 'Program Prioritas')

@section('content')
    <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-900">Program Prioritas CyberShield</h2>
        <a href="{{ route('programs.create') }}"
           class="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            + Tambah Program
        </a>
    </div>

    <div class="overflow-x-auto rounded-xl bg-white shadow-md">
        <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-700">
                <tr>
                    <th class="px-4 py-3">No</th>
                    <th class="px-4 py-3">Nama Program</th>
                    <th class="px-4 py-3">Deskripsi</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($programs as $program)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $loop->iteration }}</td>
                        <td class="px-4 py-3 font-semibold">{{ $program->nama }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ $program->deskripsi }}</td>
                        <td class="px-4 py-3">
                            <span class="rounded-full px-3 py-1 text-xs font-bold {{ $program->badgeClass() }}">
                                {{ $program->status }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center justify-center gap-2">
                                <a href="{{ route('programs.edit', $program) }}"
                                   class="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-700">Edit</a>

                                <form action="{{ route('programs.destroy', $program) }}" method="POST"
                                      onsubmit="return confirm('Yakin ingin menghapus program ini?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit"
                                            class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">Hapus</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-4 py-6 text-center text-slate-500">Belum ada program.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <p class="mt-6 text-sm text-slate-500">
        Total program: <strong>{{ $programs->count() }} program</strong>
    </p>
@endsection
