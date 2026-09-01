<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\ApiException;

final class WebController
{
    public function home(Request $request): never { Response::view('pages/home'); }
    public function admin(Request $request): never { Response::view('admin/login'); }
    public function adminDashboard(Request $request): never { Response::view('admin/dashboard'); }

    public function adminPartial(Request $request): never
    {
        $page = (string) $request->param('page');
        $allowedPages = ['dashboard', 'tracking', 'users', 'kids', 'riders', 'devices', 'routes', 'geofences', 'alerts', 'payments'];
        if (!in_array($page, $allowedPages, true)) {
            throw new ApiException('Admin page not found.', 404, 'NOT_FOUND');
        }
        Response::view('admin/partials/' . $page);
    }
    public function health(Request $request): never { Response::json(['success' => true, 'status' => 'healthy', 'platform' => 'PASSAGE', 'message' => 'PASSAGE API is running', 'timestamp' => gmdate(DATE_ATOM)]); }
}
