<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\DeviceModel;
use App\Models\PlatformModel;

final class DevicesController extends Controller
{
    private DeviceModel $devices;
    private PlatformModel $platform;
    public function __construct() { $this->devices = new DeviceModel(); $this->platform = new PlatformModel(); }

    public function index(Request $request): never
    {
        $page = $this->page($request);
        $result = $this->devices->paginate($page['limit'], $page['offset']);
        Response::paginated('Devices retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function show(Request $request): never
    {
        $user = $this->user($request); $id = $this->id($request);
        Authorizer::assertDevice($user, $id);
        $device = $this->devices->find($id);
        if ($device === null) { throw new ApiException('Device not found.', 404, 'NOT_FOUND'); }
        Response::success('Device retrieved successfully', $device);
    }

    public function create(Request $request): never
    {
        $this->requireFields($request, ['imei']);
        $data = $request->body();
        $data['status'] ??= 'active';
        $data['battery_level'] ??= 100;
        if (($data['device_token'] ?? '') === '') { $data['device_token'] = bin2hex(random_bytes(32)); }
        $device = $this->devices->createDevice($data);
        Response::success('Device created successfully', $device, 201);
    }

    public function update(Request $request): never
    {
        $device = $this->devices->updateDevice($this->id($request), $request->body());
        if ($device === null) { throw new ApiException('Device not found.', 404, 'NOT_FOUND'); }
        Response::success('Device updated successfully', $device);
    }

    public function delete(Request $request): never
    {
        $id = $this->id($request);
        if (!$this->devices->deleteDevice($id)) { throw new ApiException('Device not found.', 404, 'NOT_FOUND'); }
        Response::success('Device deleted successfully', ['id' => $id]);
    }

    public function state(Request $request): never
    {
        $device = $request->device();
        if ($device === null) { throw new ApiException('Authenticated device was not found.', 401, 'NO_DEVICE_TOKEN'); }
        Response::json($this->devices->watchState((int) $device['id']));
    }

    public function location(Request $request): never
    {
        $device = $request->device();
        if ($device === null) { throw new ApiException('Authenticated device was not found.', 401, 'NO_DEVICE_TOKEN'); }
        $this->requireFields($request, ['lat', 'lng']);
        $lat = (float) $request->input('lat'); $lng = (float) $request->input('lng');
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) { throw new ApiException('Location must include valid lat and lng values.', 422, 'VALIDATION_ERROR'); }
        $tripId = $request->input('tripId');
        if ($tripId !== null) {
            $trip = (new \App\Models\TripModel())->find((int) $tripId);
            if ($trip === null || (int) $trip['device_id'] !== (int) $device['id'] || !in_array($trip['status'], ['awaiting_pickup', 'active'], true)) { throw new ApiException('Trip does not belong to this device or is not active.', 409, 'INVALID_TRIP'); }
        }
        $this->platform->storeLocation(['device_id' => (int) $device['id'], 'lat' => $lat, 'lng' => $lng, 'accuracy' => $request->input('accuracy'), 'speed' => $request->input('speed'), 'battery' => $request->input('battery'), 'timestamp' => $request->input('timestamp')]);
        Response::json(['success' => true]);
    }

    public function event(Request $request): never
    {
        $device = $request->device();
        if ($device === null) { throw new ApiException('Authenticated device was not found.', 401, 'NO_DEVICE_TOKEN'); }
        $this->requireFields($request, ['eventType']);
        $state = (string) $request->input('eventType');
        if (!in_array($state, ['SOS_ACTIVE', 'LOW_BATTERY', 'OFFLINE'], true)) { throw new ApiException('Unsupported watch event.', 422, 'VALIDATION_ERROR'); }
        $this->devices->updateDevice((int) $device['id'], ['current_state' => $state, 'battery_level' => $request->input('battery'), 'last_online_at' => date('Y-m-d H:i:s')]);
        if (in_array($state, ['SOS_ACTIVE', 'LOW_BATTERY'], true)) { $this->platform->createAlert(['device_id' => (int) $device['id'], 'type' => $state === 'SOS_ACTIVE' ? 'SOS' : 'LOW_BATTERY', 'message' => "Watch event: {$state}"]); }
        Response::json(['success' => true]);
    }

    public function verificationToken(Request $request): never
    {
        $device = $request->device();
        if ($device === null) { throw new ApiException('Authenticated device was not found.', 401, 'NO_DEVICE_TOKEN'); }
        $this->requireFields($request, ['tripId']);
        $trip = (new \App\Models\TripModel())->find((int) $request->input('tripId'));
        if ($trip === null || (int) $trip['device_id'] !== (int) $device['id'] || !in_array($trip['status'], ['awaiting_pickup', 'active'], true)) { throw new ApiException('Trip does not belong to this device or is not active.', 409, 'INVALID_TRIP'); }
        $issuedAt = (int) floor(microtime(true) * 1000);
        $payload = $device['id'] . ':' . $trip['id'] . ':' . $issuedAt . ':' . bin2hex(random_bytes(8));
        $secret = (string) \App\Config\Config::get('TOKEN_SECRET', '');
        if ($secret === '') { throw new ApiException('TOKEN_SECRET must be configured.', 500, 'CONFIGURATION_ERROR'); }
        $token = $payload . '.' . hash_hmac('sha256', $payload, $secret);
        $expires = date('Y-m-d H:i:s', time() + 120);
        $db = \App\Core\Database::connection();
        $statement = $db->prepare(\App\Core\Database::prefixTables('INSERT INTO watch_verification_tokens (trip_id, device_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'));
        $statement->execute([(int) $trip['id'], (int) $device['id'], hash('sha256', $token), $expires]);
        Response::json(['verificationToken' => $token, 'expiresAt' => gmdate(DATE_ATOM, time() + 120)]);
    }
}
