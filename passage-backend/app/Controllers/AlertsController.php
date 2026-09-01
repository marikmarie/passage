<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Authorizer;
use App\Core\Request;
use App\Core\Response;
use App\Core\ApiException;
use App\Models\PlatformModel;

final class AlertsController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }
    public function index(Request $request): never { $page = $this->page($request); $result = $this->platform->alerts($page['limit'], $page['offset']); Response::paginated('Alerts retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']); }
    public function byDevice(Request $request): never { $deviceId = $this->id($request, 'deviceId'); Authorizer::assertDevice($this->user($request), $deviceId); $page = $this->page($request); $result = $this->platform->alerts($page['limit'], $page['offset'], $deviceId); Response::paginated('Alerts retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']); }
    public function create(Request $request): never { $this->requireFields($request, ['device_id', 'type']); Response::success('Alert created successfully', $this->platform->createAlert($request->body()), 201); }
    public function resolve(Request $request): never { $alert = $this->platform->resolveAlert($this->id($request)); if ($alert === null) { throw new ApiException('Alert not found.', 404, 'NOT_FOUND'); } Response::success('Alert resolved successfully', $alert); }
}
