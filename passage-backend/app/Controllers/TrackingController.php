<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\PlatformModel;

final class TrackingController extends Controller
{
    private PlatformModel $platform;
    public function __construct() { $this->platform = new PlatformModel(); }

    public function latest(Request $request): never
    {
        $deviceId = $this->id($request, 'deviceId'); Authorizer::assertDevice($this->user($request), $deviceId);
        $location = $this->platform->latestLocation($deviceId);
        if ($location === null) { throw new ApiException('No location data found for this device.', 404, 'NOT_FOUND'); }
        Response::success('Latest location retrieved successfully', $location);
    }

    public function history(Request $request): never
    {
        $deviceId = $this->id($request, 'deviceId'); Authorizer::assertDevice($this->user($request), $deviceId);
        $page = $this->page($request); $result = $this->platform->locationHistory($deviceId, $page['limit'], $page['offset']);
        Response::paginated('Location history retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function playback(Request $request): never
    {
        $deviceId = $this->id($request, 'deviceId'); Authorizer::assertDevice($this->user($request), $deviceId);
        $history = $this->platform->locationHistory($deviceId, 500, 0);
        Response::success('Route playback retrieved successfully', ['device_id' => $deviceId, 'points' => array_reverse($history['items'])]);
    }

    public function log(Request $request): never
    {
        $this->requireFields($request, ['device_id', 'lat', 'lng']);
        $lat = (float) $request->input('lat'); $lng = (float) $request->input('lng');
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) { throw new ApiException('Location must include valid lat and lng values.', 422, 'VALIDATION_ERROR'); }
        $this->platform->storeLocation(['device_id' => (int) $request->input('device_id'), 'lat' => $lat, 'lng' => $lng, 'accuracy' => $request->input('accuracy'), 'speed' => $request->input('speed'), 'timestamp' => $request->input('timestamp')]);
        Response::success('Location logged successfully', null, 201);
    }
}
