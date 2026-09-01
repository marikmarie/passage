<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlatformModel;

final class GeofencesController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }
    public function index(Request $request): never { $user = $this->user($request); Response::success('Geofences retrieved successfully', $this->platform->geofences((int) $user['id'])); }
    public function show(Request $request): never
    {
        $user = $this->user($request); $fence = $this->platform->geofence($this->id($request));
        if ($fence === null) { throw new ApiException('Geofence not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $fence['parent_user_id']); Response::success('Geofence retrieved successfully', $fence);
    }
    public function create(Request $request): never
    {
        $user = $this->user($request); $this->requireFields($request, ['name', 'lat', 'lng']);
        $fence = $this->platform->createGeofence(['parent_user_id' => (int) $user['id'], ...$request->body()]); Response::success('Geofence created successfully', $fence, 201);
    }
    public function update(Request $request): never
    {
        $user = $this->user($request); $id = $this->id($request); $fence = $this->platform->geofence($id);
        if ($fence === null) { throw new ApiException('Geofence not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $fence['parent_user_id']); Response::success('Geofence updated successfully', $this->platform->updateGeofence($id, $request->body()));
    }
    public function delete(Request $request): never
    {
        $user = $this->user($request); $id = $this->id($request); $fence = $this->platform->geofence($id);
        if ($fence === null) { throw new ApiException('Geofence not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $fence['parent_user_id']); $this->platform->deleteGeofence($id); Response::success('Geofence deleted successfully', ['id' => $id]);
    }
}
