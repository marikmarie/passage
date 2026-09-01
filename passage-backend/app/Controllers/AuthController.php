<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Config;
use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Jwt;
use App\Core\Request;
use App\Core\Response;
use App\Models\UserModel;

final class AuthController extends Controller
{
    private UserModel $users;
    public function __construct() { $this->users = new UserModel(); }

    public function register(Request $request): never
    {
        $this->requireFields($request, ['name']);
        $name = trim((string) $request->input('name'));
        $email = $request->input('email') !== null ? strtolower(trim((string) $request->input('email'))) : null;
        $phone = $request->input('phone_number', $request->input('phone'));
        $password = $request->input('password');
        $role = (string) $request->input('role', 'parent');
        if ($email === null && ($phone === null || $phone === '')) { throw new ApiException('Name and either email or phone_number are required.', 422, 'VALIDATION_ERROR'); }
        if (!in_array($role, ['parent', 'rider', 'admin', 'support'], true)) { throw new ApiException('Invalid user role.', 422, 'VALIDATION_ERROR'); }
        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) { throw new ApiException('email must be valid.', 422, 'VALIDATION_ERROR'); }
        if ($email !== null && $password === null) { throw new ApiException('Password is required when registering with email.', 422, 'VALIDATION_ERROR'); }
        if ($role === 'admin' && ($email === null || $password === null)) { throw new ApiException('Admins must register with email and password.', 422, 'VALIDATION_ERROR'); }
        if ($email !== null && $this->users->findByEmail($email) !== null) { throw new ApiException('User already exists with this email.', 409, 'CONFLICT'); }
        if ($phone !== null && $phone !== '' && $this->users->findByPhone((string) $phone) !== null) { throw new ApiException('User already exists with this phone number.', 409, 'CONFLICT'); }

        $user = $this->users->create([
            'name' => $name, 'email' => $email, 'phone_number' => $phone ?: null, 'role' => $role, 'status' => 'active',
            'alternative_phone_number' => $request->input('alternative_phone_number'), 'national_id_number' => $request->input('national_id_number'),
            'terms_accepted_at' => filter_var($request->input('terms_accepted', false), FILTER_VALIDATE_BOOLEAN) ? date('Y-m-d H:i:s') : null,
            'privacy_consent_at' => filter_var($request->input('privacy_consent', false), FILTER_VALIDATE_BOOLEAN) ? date('Y-m-d H:i:s') : null,
            'password_hash' => $password === null ? null : password_hash((string) $password, PASSWORD_DEFAULT),
        ]);
        Response::success('User registered successfully', ['token' => $this->token($user), 'user' => $this->users->withoutSecrets($user)], 201);
    }

    public function login(Request $request): never
    {
        $this->requireFields($request, ['email', 'password']);
        $user = $this->users->findByEmail((string) $request->input('email'));
        if ($user === null || $user['password_hash'] === null || !password_verify((string) $request->input('password'), (string) $user['password_hash'])) {
            throw new ApiException('Invalid username or password.', 401, 'INVALID_CREDENTIALS');
        }
        if ($user['status'] !== 'active') { throw new ApiException('User account is not active.', 403, 'ACCOUNT_INACTIVE'); }
        Response::success('Login successful', ['token' => $this->token($user), 'user' => $this->users->withoutSecrets($user)]);
    }

    public function requestOtp(Request $request): never
    {
        $this->requireFields($request, ['phone_number']);
        $phone = (string) $request->input('phone_number');
        $user = $this->users->findByPhone($phone);
        if ($user !== null && $user['status'] !== 'active') { throw new ApiException('User account is not active.', 403, 'ACCOUNT_INACTIVE'); }
        $otp = $user === null ? '123456' : (string) random_int(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', time() + 600);
        if ($user !== null) { $this->users->updateUser((int) $user['id'], ['otp_code' => $otp, 'otp_expires_at' => $expiresAt]); }
        $response = ['phone_number' => $phone, 'role' => $request->input('role', 'parent'), 'expires_at' => gmdate(DATE_ATOM, time() + 600), 'delivery_status' => $user === null ? 'mocked' : 'pending_provider'];
        if (!Config::isProduction()) { $response['otp_code'] = $otp; }
        Response::success('OTP sent successfully', $response);
    }

    public function verifyOtp(Request $request): never
    {
        $this->requireFields($request, ['phone_number', 'otp_code']);
        $phone = (string) $request->input('phone_number');
        $otp = (string) $request->input('otp_code');
        $user = $this->users->findByPhone($phone);
        if ($user === null) {
            if ($otp !== '123456') { throw new ApiException('Invalid or expired OTP code.', 401, 'INVALID_OTP'); }
            Response::success('OTP verified successfully', ['verified' => true, 'phone_number' => $phone, 'registration_required' => true]);
        }
        if ($user['otp_code'] === null || $user['otp_code'] !== $otp || strtotime((string) $user['otp_expires_at']) < time()) { throw new ApiException('Invalid or expired OTP code.', 401, 'INVALID_OTP'); }
        if ($user['status'] !== 'active') { throw new ApiException('User account is not active.', 403, 'ACCOUNT_INACTIVE'); }
        $this->users->updateUser((int) $user['id'], ['otp_code' => null, 'otp_expires_at' => null]);
        Response::success('OTP verified successfully', ['token' => $this->token($user), 'user' => $this->users->withoutSecrets($user)]);
    }

    public function me(Request $request): never
    {
        $user = $this->users->find((int) $this->user($request)['id']);
        if ($user === null) { throw new ApiException('User not found.', 404, 'NOT_FOUND'); }
        Response::success('User retrieved successfully', $this->users->withoutSecrets($user));
    }

    public function logout(Request $request): never { $this->user($request); Response::success('Logout successful', ['logged_out' => true]); }

    /** @param array<string, mixed> $user */
    private function token(array $user): string { return Jwt::encode(['id' => (int) $user['id'], 'email' => $user['email'], 'role' => $user['role']]); }
}
