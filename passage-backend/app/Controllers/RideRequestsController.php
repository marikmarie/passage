<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\KidModel;
use App\Models\RideRequestModel;
use App\Models\RiderModel;

final class RideRequestsController extends Controller
{
    private RideRequestModel $requests;
    private KidModel $kids;
    private RiderModel $riders;
    public function __construct() { $this->requests = new RideRequestModel(); $this->kids = new KidModel(); $this->riders = new RiderModel(); }

    public function create(Request $request): never
    {
        $user = $this->user($request);
        $this->requireFields($request, ['kid_id', 'vehicle_type']);
        $kid = $this->kids->find((int) $request->input('kid_id'));
        if ($kid === null || (int) $kid['parent_user_id'] !== (int) $user['id']) { throw new ApiException('Child not found.', 404, 'NOT_FOUND'); }
        if ($kid['device_id'] === null) { throw new ApiException('A child must have an active device before a ride can be requested.', 409, 'DEVICE_REQUIRED'); }
        $vehicle = (string) $request->input('vehicle_type');
        if (!in_array($vehicle, ['boda', 'tuktuk'], true)) { throw new ApiException('vehicle_type must be boda or tuktuk.', 422, 'VALIDATION_ERROR'); }
        $pickup = $request->input('pickup', []); $destination = $request->input('destination', []);
        if (!is_array($pickup) || !is_array($destination)) { throw new ApiException('pickup and destination are required.', 422, 'VALIDATION_ERROR'); }
        foreach (['label', 'lat', 'lng'] as $field) { if (!array_key_exists($field, $pickup) || !array_key_exists($field, $destination)) { throw new ApiException('pickup and destination must include label, lat, and lng.', 422, 'VALIDATION_ERROR'); } }
        $lat = (float) $pickup['lat']; $lng = (float) $pickup['lng'];
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) { throw new ApiException('pickup coordinates are invalid.', 422, 'VALIDATION_ERROR'); }
        $estimatedFare = max(0, (float) $request->input('fare_amount', 0));
        $assigned = $this->requests->approvedAvailableRider($vehicle, $lat, $lng);
        $data = [
            'parent_user_id' => (int) $user['id'], 'kid_id' => (int) $kid['id'], 'device_id' => (int) $kid['device_id'],
            'requested_vehicle_type' => $vehicle, 'fare_amount' => $estimatedFare, 'journey_type' => $request->input('journey_type', 'custom'),
            'pickup_label' => $pickup['label'], 'pickup_lat' => $pickup['lat'], 'pickup_lng' => $pickup['lng'],
            'destination_label' => $destination['label'], 'destination_lat' => $destination['lat'], 'destination_lng' => $destination['lng'],
        ];
        if ($assigned !== null) { $data['assigned_rider_id'] = (int) $assigned['id']; $data['status'] = 'assigned'; $data['assigned_at'] = date('Y-m-d H:i:s'); }
        $ride = $this->requests->createRequest($data);
        Response::success('Ride request created successfully', $ride, 201);
    }

    public function active(Request $request): never
    {
        $user = $this->user($request);
        $ride = $this->requests->activeForUser((int) $user['id'], (string) $user['role']);
        Response::success($ride === null ? 'No active ride request found' : 'Active ride request retrieved successfully', $ride);
    }

    public function index(Request $request): never
    {
        $user = $this->user($request); $page = $this->page($request, 50);
        $result = $this->requests->paginateForUser((int) $user['id'], (string) $user['role'], $page['limit'], $page['offset']);
        Response::paginated('Ride requests retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function show(Request $request): never
    {
        $user = $this->user($request); $ride = $this->requests->find($this->id($request));
        if ($ride === null) { throw new ApiException('Ride request not found.', 404, 'NOT_FOUND'); }
        $allowed = ($user['role'] === 'parent' && (int) $ride['parent_user_id'] === (int) $user['id'])
            || ($user['role'] === 'rider' && $ride['assigned_rider_id'] !== null && (int) ($this->riders->find((int) $ride['assigned_rider_id'])['user_id'] ?? 0) === (int) $user['id'])
            || in_array($user['role'], ['admin', 'support'], true);
        if (!$allowed) { throw new ApiException('You do not have permission to access this ride request.', 403, 'FORBIDDEN'); }
        Response::success('Ride request retrieved successfully', $ride);
    }

    public function accept(Request $request): never { $user = $this->user($request); Response::success('Ride request accepted successfully', $this->requests->accept($this->id($request), (int) $user['id'])); }
    public function decline(Request $request): never { $user = $this->user($request); Response::success('Ride request declined successfully', $this->requests->decline($this->id($request), (int) $user['id'])); }
    public function cancel(Request $request): never { $user = $this->user($request); Response::success('Ride request cancelled successfully', $this->requests->cancel($this->id($request), (int) $user['id'])); }

    public function availability(Request $request): never
    {
        $user = $this->user($request); $this->requireFields($request, ['vehicle_type', 'lat', 'lng']);
        $rider = $this->riders->findByUser((int) $user['id']);
        if ($rider === null || $rider['approval_status'] !== 'approved') { throw new ApiException('An approved rider profile is required.', 409, 'RIDER_NOT_APPROVED'); }
        $vehicle = (string) $request->input('vehicle_type');
        if (!in_array($vehicle, ['boda', 'tuktuk'], true)) { throw new ApiException('vehicle_type must be boda or tuktuk.', 422, 'VALIDATION_ERROR'); }
        $availability = $this->requests->setAvailability((int) $rider['id'], ['vehicle_type' => $vehicle, 'lat' => (float) $request->input('lat'), 'lng' => (float) $request->input('lng'), 'is_available' => filter_var($request->input('is_available', true), FILTER_VALIDATE_BOOLEAN)]);
        Response::success('Rider availability updated successfully', $availability);
    }
}
