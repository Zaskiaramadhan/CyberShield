@csrf

<div class="mb-4">
    <label for="nama" class="mb-1 block font-semibold">Nama Program</label>
    <input type="text" id="nama" name="nama" value="{{ old('nama', $program->nama ?? '') }}"
           class="w-full rounded-lg border px-3 py-2">
    @error('nama') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
</div>

<div class="mb-4">
    <label for="deskripsi" class="mb-1 block font-semibold">Deskripsi</label>
    <textarea id="deskripsi" name="deskripsi" rows="4"
              class="w-full rounded-lg border px-3 py-2">{{ old('deskripsi', $program->deskripsi ?? '') }}</textarea>
    @error('deskripsi') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
</div>

<div class="mb-6">
    <label for="status" class="mb-1 block font-semibold">Status</label>
    <select id="status" name="status" class="w-full rounded-lg border px-3 py-2">
        @foreach ($statuses as $status)
            <option value="{{ $status }}" @selected(old('status', $program->status ?? 'Direncanakan') === $status)>
                {{ $status }}
            </option>
        @endforeach
    </select>
    @error('status') <p class="mt-1 text-sm text-red-600">{{ $message }}</p> @enderror
</div>

<div class="flex gap-3">
    <button type="submit" class="rounded-lg bg-sky-600 px-5 py-2 font-semibold text-white hover:bg-sky-700">
        {{ $submit }}
    </button>
    <a href="{{ route('programs.index') }}" class="rounded-lg bg-slate-200 px-5 py-2 font-semibold hover:bg-slate-300">
        Batal
    </a>
</div>
