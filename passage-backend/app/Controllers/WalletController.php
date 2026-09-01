<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\WalletModel;

final class WalletController extends Controller
{
    private WalletModel $wallets;
    public function __construct() { $this->wallets = new WalletModel(); }
    public function summary(Request $request): never { $user = $this->user($request); Response::success('Wallet retrieved successfully', $this->wallets->summary((int) $user['id'])); }
    public function payout(Request $request): never
    {
        $this->requireFields($request, ['amount', 'phone', 'provider']); $user = $this->user($request);
        Response::success('Payout request created successfully', $this->wallets->payout((int) $user['id'], (float) $request->input('amount'), (string) $request->input('phone'), (string) $request->input('provider')), 201);
    }
}
