<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlatformModel;
use App\Models\WalletModel;

final class PaymentsController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }
    public function index(Request $request): never { $user = $this->user($request); Response::success('Payments retrieved successfully', $this->platform->payments((int) $user['id'], (string) $user['role'])); }
    public function initiate(Request $request): never
    {
        $this->requireFields($request, ['amount']); $user = $this->user($request);
        $amount = (float) $request->input('amount'); if ($amount <= 0) { throw new ApiException('amount must be greater than zero.', 422, 'VALIDATION_ERROR'); }
        $payment = $this->platform->createPayment(['user_id' => (int) $user['id'], ...$request->body(), 'status' => 'pending']);
        Response::success('Payment initiated successfully', $payment, 201);
    }
    public function verify(Request $request): never
    {
        $user = $this->user($request); $payment = $this->platform->payment($this->id($request, 'paymentId'));
        if ($payment === null) { throw new ApiException('Payment not found.', 404, 'NOT_FOUND'); }
        if ((int) $payment['user_id'] !== (int) $user['id'] && !in_array($user['role'], ['admin', 'support'], true)) { throw new ApiException('You do not have permission to access this payment.', 403, 'FORBIDDEN'); }
        if ($payment['status'] === 'pending' && filter_var($request->input('confirm', false), FILTER_VALIDATE_BOOLEAN)) {
            $db = Database::connection(); $db->beginTransaction();
            try {
                $payment = $this->platform->completePayment((int) $payment['id']);
                (new WalletModel())->creditPayment((int) $payment['id'], (int) $payment['user_id'], (float) $payment['amount'], 'topup-' . $payment['reference'], $db);
                $db->commit();
            } catch (\Throwable $exception) { $db->rollBack(); throw $exception; }
        }
        Response::success('Payment status retrieved successfully', $payment);
    }
}
