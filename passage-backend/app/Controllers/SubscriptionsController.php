<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlatformModel;

final class SubscriptionsController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }
    public function mine(Request $request): never { $subscription = $this->platform->subscription((int) $this->user($request)['id']); Response::success($subscription === null ? 'No subscription found' : 'Subscription retrieved successfully', $subscription); }
    public function index(Request $request): never { Response::success('Subscriptions retrieved successfully', $this->platform->subscriptions()); }
    public function create(Request $request): never
    {
        $user = $this->user($request); $data = $request->body(); $data['user_id'] ??= (int) $user['id'];
        if ((int) $data['user_id'] !== (int) $user['id'] && !in_array($user['role'], ['admin', 'support'], true)) { throw new ApiException('You do not have permission to create this subscription.', 403, 'FORBIDDEN'); }
        Response::success('Subscription created successfully', $this->platform->createSubscription($data), 201);
    }
    public function upgrade(Request $request): never
    {
        $id = $this->id($request); $this->assertOwner($request, $id); $subscription = $this->platform->updateSubscription($id, ['plan' => $request->input('plan')]);
        if ($subscription === null) { throw new ApiException('Subscription not found.', 404, 'NOT_FOUND'); } Response::success('Subscription upgraded successfully', $subscription);
    }
    public function renew(Request $request): never
    {
        $id = $this->id($request); $this->assertOwner($request, $id); $subscription = $this->platform->updateSubscription($id, ['end_date' => $request->input('end_date')]);
        if ($subscription === null) { throw new ApiException('Subscription not found.', 404, 'NOT_FOUND'); } Response::success('Subscription renewed successfully', $subscription);
    }
    private function assertOwner(Request $request, int $id): void
    {
        $subscription = $this->platform->subscriptionById($id); if ($subscription === null) { throw new ApiException('Subscription not found.', 404, 'NOT_FOUND'); }
        $user = $this->user($request); if ((int) $subscription['user_id'] !== (int) $user['id'] && !in_array($user['role'], ['admin', 'support'], true)) { throw new ApiException('You do not have permission to modify this subscription.', 403, 'FORBIDDEN'); }
    }
}
