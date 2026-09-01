<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\KidModel;

final class KidsController extends Controller
{
    private KidModel $kids;
    public function __construct() { $this->kids = new KidModel(); }

    public function index(Request $request): never
    {
        $page = $this->page($request);
        $result = $this->kids->paginate($page['limit'], $page['offset']);
        Response::paginated('Children retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function byParent(Request $request): never
    {
        $user = $this->user($request);
        Response::success('Children retrieved successfully', $this->kids->forParent((int) $user['id']));
    }

    public function byDevice(Request $request): never
    {
        $user = $this->user($request);
        $deviceId = $this->id($request, 'deviceId');
        Authorizer::assertDevice($user, $deviceId);
        $kid = $this->kids->findByDevice($deviceId);
        if ($kid === null) { throw new ApiException('Child not found.', 404, 'NOT_FOUND'); }
        Response::success('Child retrieved successfully', $user['role'] === 'rider' ? $this->kids->riderSafe($kid) : $kid);
    }

    public function show(Request $request): never
    {
        $user = $this->user($request);
        $kid = $this->kids->find($this->id($request));
        if ($kid === null) { throw new ApiException('Child not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $kid['parent_user_id']);
        Response::success('Child retrieved successfully', $kid);
    }

    public function create(Request $request): never
    {
        $user = $this->user($request);
        $this->requireFields($request, ['name']);
        $data = $request->body();
        if ($user['role'] === 'parent') { $data['parent_user_id'] = (int) $user['id']; }
        if (!isset($data['parent_user_id'])) { throw new ApiException('parent_user_id is required.', 422, 'VALIDATION_ERROR'); }
        $kid = $this->kids->createKid($data);
        Response::success('Child created successfully', $kid, 201);
    }

    public function update(Request $request): never
    {
        $user = $this->user($request);
        $id = $this->id($request);
        $existing = $this->kids->find($id);
        if ($existing === null) { throw new ApiException('Child not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $existing['parent_user_id']);
        $data = $request->body();
        unset($data['parent_user_id']);
        $kid = $this->kids->updateKid($id, $data);
        Response::success('Child updated successfully', $kid);
    }

    public function delete(Request $request): never
    {
        $user = $this->user($request);
        $id = $this->id($request);
        $kid = $this->kids->find($id);
        if ($kid === null) { throw new ApiException('Child not found.', 404, 'NOT_FOUND'); }
        Authorizer::assertOwnerOrPrivileged($user, (int) $kid['parent_user_id']);
        $this->kids->deleteKid($id);
        Response::success('Child deleted successfully', ['id' => $id]);
    }
}
