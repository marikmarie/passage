<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Config;
use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\RideRequestModel;

final class RoutePlanningController extends Controller
{
    public function directions(Request $request): never
    {
        $start = $request->input('start'); $end = $request->input('end');
        if (!is_array($start) || !is_array($end) || !isset($start['lat'], $start['lng'], $end['lat'], $end['lng'])) { throw new ApiException('start and end coordinates are required.', 422, 'VALIDATION_ERROR'); }
        $result = $this->directionsFor($start, $end, (string) $request->input('profile', 'driving-car'));
        Response::success('Directions retrieved successfully', $result);
    }
    public function nearestRider(Request $request): never
    {
        $this->requireFields($request, ['vehicle_type', 'lat', 'lng']);
        $rider = (new RideRequestModel())->approvedAvailableRider((string) $request->input('vehicle_type'), (float) $request->input('lat'), (float) $request->input('lng'));
        Response::success($rider === null ? 'No available rider found' : 'Nearest rider retrieved successfully', $rider);
    }

    /** @param array<string, mixed> $start @param array<string, mixed> $end @return array<string, mixed> */
    private function directionsFor(array $start, array $end, string $profile): array
    {
        $fallback = ['route_points' => [['lat' => (float) $start['lat'], 'lng' => (float) $start['lng']], ['lat' => (float) $end['lat'], 'lng' => (float) $end['lng']]], 'distance_meters' => null, 'duration_seconds' => null, 'source' => 'fallback'];
        $apiKey = (string) Config::get('ORS_API_KEY', '');
        if ($apiKey === '' || !function_exists('curl_init')) { return $fallback; }
        $url = rtrim((string) Config::get('ORS_BASE_URL', 'https://api.openrouteservice.org'), '/') . '/v2/directions/' . rawurlencode($profile) . '?start=' . rawurlencode($start['lng'] . ',' . $start['lat']) . '&end=' . rawurlencode($end['lng'] . ',' . $end['lat']);
        $curl = curl_init($url);
        curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_HTTPHEADER => ['Authorization: ' . $apiKey]]);
        $body = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
        $data = is_string($body) ? json_decode($body, true) : null;
        if ($status >= 200 && $status < 300 && is_array($data) && isset($data['features'][0]['geometry']['coordinates'])) {
            return ['route_points' => array_map(static fn (array $point): array => ['lat' => (float) $point[1], 'lng' => (float) $point[0]], $data['features'][0]['geometry']['coordinates']), 'distance_meters' => $data['features'][0]['properties']['summary']['distance'] ?? null, 'duration_seconds' => $data['features'][0]['properties']['summary']['duration'] ?? null, 'source' => 'openrouteservice'];
        }
        return $fallback;
    }
}
