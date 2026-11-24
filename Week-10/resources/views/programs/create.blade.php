@extends('layouts.app')

@section('title', 'Tambah Program')

@section('content')
    <h2 class="mb-6 text-2xl font-bold text-slate-900">Tambah Program</h2>

    <form action="{{ route('programs.store') }}" method="POST" class="max-w-xl rounded-xl bg-white p-6 shadow-md">
        @include('programs._form', ['submit' => 'Simpan'])
    </form>
@endsection
