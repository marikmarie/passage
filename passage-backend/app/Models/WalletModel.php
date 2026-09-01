<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\ApiException;
use PDO;

final class WalletModel extends BaseModel
{
    /** @return array<string, mixed> */
    public function summary(int $userId): array
    {
        $wallet = $this->wallet($userId);
        return [
            'wallet' => $wallet,
            'transactions' => $this->all('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [$userId]),
            'payouts' => $this->all('SELECT * FROM payout_requests WHERE rider_user_id = ? ORDER BY created_at DESC LIMIT 50', [$userId]),
        ];
    }

    /** @return array<string, mixed> */
    public function payout(int $userId, float $amount, string $phone, string $provider): array
    {
        if ($amount <= 0) { throw new ApiException('amount must be greater than zero.', 422, 'VALIDATION_ERROR'); }
        if (!in_array($provider, ['mtn', 'airtel'], true)) { throw new ApiException('provider must be mtn or airtel.', 422, 'VALIDATION_ERROR'); }
        $wallet = $this->wallet($userId);
        if ((float) $wallet['balance'] < $amount) { throw new ApiException('Insufficient wallet balance.', 409, 'INSUFFICIENT_BALANCE'); }

        $reference = 'payout-' . bin2hex(random_bytes(12));
        $db = $this->db();
        $db->beginTransaction();
        try {
            $this->execute('UPDATE wallets SET balance = balance - ? WHERE id = ? AND balance >= ?', [$amount, (int) $wallet['id'], $amount]);
            $this->execute("INSERT INTO wallet_transactions (wallet_id, user_id, direction, type, amount, status, reference, description) VALUES (?, ?, 'debit', 'payout', ?, 'pending', ?, ?)", [(int) $wallet['id'], $userId, $amount, $reference, 'Payout request reserved']);
            $this->execute("INSERT INTO payout_requests (rider_user_id, amount, phone, provider, status, reference) VALUES (?, ?, ?, ?, 'pending', ?)", [$userId, $amount, $phone, $provider, $reference]);
            $db->commit();
        } catch (\Throwable $exception) {
            $db->rollBack();
            throw $exception;
        }
        return $this->one('SELECT * FROM payout_requests WHERE reference = ?', [$reference]) ?? throw new \RuntimeException('Payout creation failed.');
    }

    public function creditPayment(int $paymentId, int $userId, float $amount, string $reference, PDO $db): void
    {
        $wallet = $this->wallet($userId);
        $updated = $this->execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', [$amount, (int) $wallet['id']]);
        if ($updated !== 1) { throw new ApiException('Could not credit wallet.', 500, 'WALLET_ERROR'); }
        $this->execute("INSERT INTO wallet_transactions (wallet_id, user_id, payment_id, direction, type, amount, status, reference, description) VALUES (?, ?, ?, 'credit', 'topup', ?, 'completed', ?, ?)", [(int) $wallet['id'], $userId, $paymentId, $amount, $reference, 'Payment top-up']);
    }

    public function settleFare(PDO $db, int $parentUserId, int $riderUserId, int $tripId, float $amount): void
    {
        $parentWallet = $this->wallet($parentUserId);
        $riderWallet = $this->wallet($riderUserId);
        if ((float) $parentWallet['balance'] < $amount) { throw new ApiException('Parent wallet has insufficient balance to settle this trip.', 409, 'INSUFFICIENT_BALANCE'); }
        $reference = 'fare-' . $tripId;
        $this->execute('UPDATE wallets SET balance = balance - ? WHERE id = ? AND balance >= ?', [$amount, (int) $parentWallet['id'], $amount]);
        $this->execute('UPDATE wallets SET balance = balance + ? WHERE id = ?', [$amount, (int) $riderWallet['id']]);
        $this->execute("INSERT INTO wallet_transactions (wallet_id, user_id, direction, type, amount, status, reference, description) VALUES (?, ?, 'debit', 'fare', ?, 'completed', ?, ?)", [(int) $parentWallet['id'], $parentUserId, $amount, $reference . '-debit', "Trip {$tripId} fare"]);
        $this->execute("INSERT INTO wallet_transactions (wallet_id, user_id, direction, type, amount, status, reference, description) VALUES (?, ?, 'credit', 'earning', ?, 'completed', ?, ?)", [(int) $riderWallet['id'], $riderUserId, $amount, $reference . '-credit', "Trip {$tripId} fare earnings"]);
    }

    /** @return array<string, mixed> */
    private function wallet(int $userId): array
    {
        $this->execute("INSERT INTO wallets (user_id, currency, balance) VALUES (?, 'UGX', 0) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)", [$userId]);
        return $this->one('SELECT * FROM wallets WHERE user_id = ?', [$userId]) ?? throw new \RuntimeException('Wallet not found.');
    }
}
