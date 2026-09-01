<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Core\ApiException;
use App\Models\PlatformModel;

final class NotificationsController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }
    public function index(Request $request): never { Response::success('Notifications retrieved successfully', $this->platform->notifications((int) $this->user($request)['id'])); }
    public function read(Request $request): never { $user = $this->user($request); if (!$this->platform->markNotification($this->id($request), (int) $user['id'])) { throw new ApiException('Notification not found.', 404, 'NOT_FOUND'); } Response::success('Notification marked as read', null); }
    public function readAll(Request $request): never { $count = $this->platform->markAllNotifications((int) $this->user($request)['id']); Response::success('Notifications marked as read', ['updated' => $count]); }
    public function create(Request $request): never { $this->requireFields($request, ['user_id', 'title']); Response::success('Notification sent successfully', $this->platform->createNotification($request->body()), 201); }
}
