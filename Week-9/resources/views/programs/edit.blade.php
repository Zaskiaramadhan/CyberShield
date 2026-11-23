@extends('layouts.app')

@section('title', 'Edit Program')

@section('content')
    <h2 class="mb-6 text-2xl font-bold text-slate-900">Edit Program</h2>

    <form action="{{ route('programs.update', $program) }}" method="POST" class="max-w-xl rounded-xl bg-white p-6 shadow-md">
        @method('PUT')
        @include('programs._form', ['submit' => 'Update'])
    </form>
@endsection
