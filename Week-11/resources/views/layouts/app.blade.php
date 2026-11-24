<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Program Prioritas') - CyberShield</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 font-sans text-gray-800">

    <header class="bg-slate-900 px-8 py-5 text-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between">
            <h1 class="text-2xl font-bold">CyberShield</h1>
            <a href="{{ url('/legacy/Index.html') }}"
               class="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-700">
                Kembali ke Home
            </a>
        </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-12">
        @if (session('success'))
            <div class="mb-6 rounded-lg bg-green-100 px-4 py-3 text-green-700">
                {{ session('success') }}
            </div>
        @endif

        @yield('content')
    </main>

    <footer class="bg-slate-900 p-6 text-center text-white">
        <p>&copy; {{ date('Y') }} CyberShield</p>
    </footer>

</body>
</html>
