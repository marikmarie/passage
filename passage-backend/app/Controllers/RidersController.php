<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\RiderModel;

final class RidersController extends Controller
{
    private RiderModel $riders;
    public function __construct() { $this->riders = new RiderModel(); }

    public function me(Request $request): never
    {
        $rider = $this->riders->findByUser((int) $this->user($request)['id']);
        if ($rider === null) { throw new ApiException('Rider profile not found.', 404, 'NOT_FOUND'); }
        Response::success('Rider profile retrieved successfully', $rider);
    }

    public function upsertMe(Request $request): never
    {
        $user = $this->user($request);
        if ($user['role'] !== 'rider') { throw new ApiException('Only riders can manage a rider profile.', 403, 'FORBIDDEN'); }
        $data = $request->body();
        unset($data['user_id'], $data['approval_status'], $data['reviewed_by'], $data['reviewed_at'], $data['review_notes']);
        if (($data['verification_consent_accepted'] ?? false) && ($data['training_accepted'] ?? false) && ($data['safeguarding_accepted'] ?? false)) {
            $data['approval_status'] = 'pending_review';
            $data['submitted_at'] = date('Y-m-d H:i:s');
        }
        $rider = $this->riders->upsertForUser((int) $user['id'], $data);
        Response::success('Rider profile saved successfully', $rider);
    }

    public function byParent(Request $request): never
    {
        $user = $this->user($request);
        Response::success('Riders retrieved successfully', $this->riders->forParent((int) $user['id']));
    }

    public function show(Request $request): never
    {
        $rider = $this->riders->find($this->id($request));
        if ($rider === null) { throw new ApiException('Rider not found.', 404, 'NOT_FOUND'); }
        $user = $this->user($request);
        Authorizer::assertOwnerOrPrivileged($user, (int) $rider['user_id']);
        Response::success('Rider retrieved successfully', $rider);
    }

    public function create(Request $request): never
    {
        $this->requireFields($request, ['user_id']);
        $rider = $this->riders->createRider($request->body());
        Response::success('Rider created successfully', $rider, 201);
    }

    public function update(Request $request): never
    {
        $id = $this->id($request);
        $rider = $this->riders->find($id);
        if ($rider === null) { throw new ApiException('Rider not found.', 404, 'NOT_FOUND'); }
        $actor = $this->user($request);
        Authorizer::assertOwnerOrPrivileged($actor, (int) $rider['user_id']);
        $updated = $this->riders->updateRider($id, $request->body());
        Response::success('Rider updated successfully', $updated);
    }

    public function delete(Request $request): never
    {
        $id = $this->id($request);
        if (!$this->riders->deleteRider($id)) { throw new ApiException('Rider not found.', 404, 'NOT_FOUND'); }
        Response::success('Rider deleted successfully', ['id' => $id]);
    }
}
