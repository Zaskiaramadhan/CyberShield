<?php

namespace App\Services;

use App\Models\User;
use DomainException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;
use UnexpectedValueException;

class JwtTokenService
{
    public function issue(User $user): string
    {
        $now = time();

        return JWT::encode([
            'iss' => (string) config('app.url'),
            'sub' => (string) $user->getKey(),
            'iat' => $now,
            'exp' => $now + ($this->ttl() * 60),
        ], $this->secret(), 'HS256');
    }

    public function authenticate(?string $token): ?User
    {
        if ($token === null || $token === '') {
            return null;
        }

        try {
            $payload = JWT::decode($token, new Key($this->secret(), 'HS256'));
        } catch (DomainException | UnexpectedValueException) {
            return null;
        }

        $issuer = (string) config('app.url');
        if (!isset($payload->iss) || !is_string($payload->iss) || !hash_equals($issuer, $payload->iss)) {
            return null;
        }

        if (!isset($payload->sub) || !is_string($payload->sub) || !ctype_digit($payload->sub)) {
            return null;
        }

        return User::query()->find($payload->sub);
    }

    private function secret(): string
    {
        $secret = config('jwt.secret');
        if (!is_string($secret) || $secret === '') {
            throw new RuntimeException('JWT_SECRET or APP_KEY must be configured.');
        }

        if (str_starts_with($secret, 'base64:')) {
            $secret = base64_decode(substr($secret, 7), true);
            if (!is_string($secret)) {
                throw new RuntimeException('The configured JWT secret is invalid base64.');
            }
        }

        if (strlen($secret) < 32) {
            throw new RuntimeException('The JWT signing key must be at least 32 bytes.');
        }

        return hash_hkdf('sha256', $secret, 32, 'CyberShield JWT authentication');
    }

    private function ttl(): int
    {
        $ttl = config('jwt.ttl');
        if (!is_int($ttl) || $ttl < 1) {
            throw new RuntimeException('JWT_TTL must be a positive number of minutes.');
        }

        return $ttl;
    }
}
