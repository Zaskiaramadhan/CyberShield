<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'jwt.secret' => str_repeat('test-secret-', 4),
            'jwt.ttl' => 60,
        ]);
    }

    public function test_program_api_supports_crud_operations(): void
    {
        $token = $this->loginAndGetToken();

        $createResponse = $this->withToken($token)->postJson('/api/programs', [
            'nama' => 'Pendidikan',
            'deskripsi' => 'Program di bidang pendidikan.',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.nama', 'Pendidikan')
            ->assertJsonPath('data.deskripsi', 'Program di bidang pendidikan.');

        $programId = $createResponse->json('data.id');

        $this->withToken($token)->getJson('/api/programs')
            ->assertOk()
            ->assertJsonPath('data.0.id', $programId);

        $this->withToken($token)->getJson('/api/programs/' . $programId)
            ->assertOk()
            ->assertJsonPath('data.nama', 'Pendidikan');

        $this->withToken($token)->putJson('/api/programs/' . $programId, [
            'nama' => 'Pendidikan dan Literasi',
            'deskripsi' => 'Program pendidikan terbaru.',
        ])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Pendidikan dan Literasi');

        $this->withToken($token)->deleteJson('/api/programs/' . $programId)
            ->assertOk()
            ->assertJsonPath('message', 'Program berhasil dihapus.');

        $this->assertDatabaseMissing('programs', ['id' => $programId]);
    }

    public function test_api_requires_program_fields_and_limits_name_length(): void
    {
        $token = $this->loginAndGetToken();

        $this->withToken($token)->postJson('/api/programs', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama', 'deskripsi']);

        $this->withToken($token)->postJson('/api/programs', [
            'nama' => str_repeat('a', 101),
            'deskripsi' => 'Deskripsi valid.',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama']);

        $this->assertDatabaseCount('programs', 0);
    }

    public function test_api_rejects_invalid_program_updates(): void
    {
        $token = $this->loginAndGetToken();
        $program = Program::create([
            'nama' => 'Pendidikan',
            'deskripsi' => 'Deskripsi awal.',
        ]);

        $this->withToken($token)->putJson('/api/programs/' . $program->id, [
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

    public function test_login_returns_a_bearer_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'correct-password',
        ]);

        $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'correct-password',
        ])
            ->assertOk()
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'expires_in',
                'user' => ['id', 'email'],
            ])
            ->assertJsonPath('token_type', 'bearer');
    }

    public function test_login_rejects_unknown_users_and_incorrect_passwords(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'correct-password',
        ]);

        $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized();

        $this->postJson('/api/login', [
            'email' => 'missing@example.com',
            'password' => 'correct-password',
        ])->assertUnauthorized();
    }

    public function test_program_api_rejects_missing_and_invalid_bearer_tokens(): void
    {
        $this->get('/api/programs')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');

        $this->withToken('invalid.token.value')
            ->getJson('/api/programs')
            ->assertUnauthorized();

        $invalidSignature = JWT::encode([
            'iss' => config('app.url'),
            'sub' => '1',
            'iat' => time(),
            'exp' => time() + 60,
        ], str_repeat('wrong-secret-', 4), 'HS256');

        $this->withToken($invalidSignature)
            ->getJson('/api/programs')
            ->assertUnauthorized();
    }

    public function test_valid_login_token_can_access_program_api(): void
    {
        $token = $this->loginAndGetToken();

        $this->withToken($token)
            ->getJson('/api/programs')
            ->assertOk()
            ->assertJsonPath('data', []);
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

    private function loginAndGetToken(): string
    {
        User::factory()->create([
            'email' => 'api-user@example.com',
            'password' => 'correct-password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'api-user@example.com',
            'password' => 'correct-password',
        ])->assertOk();

        return $response->json('access_token');
    }
}
