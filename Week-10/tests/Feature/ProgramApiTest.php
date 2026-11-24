<?php

namespace Tests\Feature;

use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_program_api_supports_crud_operations(): void
    {
        $createResponse = $this->postJson('/api/programs', [
            'nama' => 'Pendidikan',
            'deskripsi' => 'Program di bidang pendidikan.',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Pendidikan')
            ->assertJsonPath('data.deskripsi', 'Program di bidang pendidikan.');

        $programId = $createResponse->json('data.id');

        $this->getJson('/api/programs')
            ->assertOk()
            ->assertJsonPath('data.0.id', $programId);

        $this->getJson('/api/programs/' . $programId)
            ->assertOk()
            ->assertJsonPath('data.nama', 'Pendidikan');

        $this->putJson('/api/programs/' . $programId, [
            'nama' => 'Pendidikan dan Literasi',
            'deskripsi' => 'Program pendidikan terbaru.',
        ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Pendidikan dan Literasi');

        $this->deleteJson('/api/programs/' . $programId)
            ->assertOk()
            ->assertJsonPath('message', 'Program berhasil dihapus.');

        $this->assertDatabaseMissing('programs', ['id' => $programId]);
    }

    public function test_api_requires_program_fields_and_limits_name_length(): void
    {
        $this->postJson('/api/programs', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama', 'deskripsi']);

        $this->postJson('/api/programs', [
            'nama' => str_repeat('a', 101),
            'deskripsi' => 'Deskripsi valid.',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama']);

        $this->assertDatabaseCount('programs', 0);
    }

    public function test_api_rejects_invalid_program_updates(): void
    {
        $program = Program::create([
            'nama' => 'Pendidikan',
            'deskripsi' => 'Deskripsi awal.',
        ]);

        $this->putJson('/api/programs/' . $program->id, [
            'nama' => '',
            'deskripsi' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama', 'deskripsi']);

        $this->assertDatabaseHas('programs', [
            'id' => $program->id,
            'nama' => 'Pendidikan',
            'deskripsi' => 'Deskripsi awal.',
        ]);
    }

    public function test_web_create_and_update_reject_names_over_100_characters(): void
    {
        $longName = str_repeat('a', 101);

        $this->from('/programs/create')
            ->post('/programs', [
                'nama' => $longName,
                'deskripsi' => 'Deskripsi valid.',
                'status' => 'Direncanakan',
            ])
            ->assertSessionHasErrors('nama');

        $program = Program::create([
            'nama' => 'Pendidikan',
            'deskripsi' => 'Deskripsi awal.',
        ]);

        $this->from('/programs/' . $program->id . '/edit')
            ->put('/programs/' . $program->id, [
                'nama' => $longName,
                'deskripsi' => 'Deskripsi baru.',
                'status' => 'Direncanakan',
            ])
            ->assertSessionHasErrors('nama');

        $this->assertDatabaseHas('programs', [
            'id' => $program->id,
            'nama' => 'Pendidikan',
            'deskripsi' => 'Deskripsi awal.',
        ]);
    }
}
