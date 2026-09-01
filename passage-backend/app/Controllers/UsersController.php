<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Authorizer;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\UserModel;

final class UsersController extends Controller
{
    private UserModel $users;
    public function __construct() { $this->users = new UserModel(); }

    public function index(Request $request): never
    {
        $page = $this->page($request);
        $result = $this->users->paginate($page['limit'], $page['offset'], is_string($request->input('role')) ? $request->input('role') : null);
        Response::paginated('Users retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']);
    }

    public function show(Request $request): never
    {
        $actor = $this->user($request);
        $id = $this->id($request);
        Authorizer::assertOwnerOrPrivileged($actor, $id);
        $user = $this->users->find($id);
        if ($user === null) { throw new ApiException('User not found.', 404, 'NOT_FOUND'); }
        Response::success('User retrieved successfully', $this->users->withoutSecrets($user));
    }

    public function update(Request $request): never
    {
        $actor = $this->user($request);
        $id = $this->id($request);
        Authorizer::assertOwnerOrPrivileged($actor, $id);
        $body = $request->body();
        unset($body['role'], $body['status'], $body['password_hash'], $body['otp_code']);
        if (isset($body['email'])) { $body['email'] = strtolower((string) $body['email']); }
        $user = $this->users->updateUser($id, $body);
        if ($user === null) { throw new ApiException('User not found.', 404, 'NOT_FOUND'); }
        Response::success('User updated successfully', $this->users->withoutSecrets($user));
    }

    public function delete(Request $request): never
    {
        $id = $this->id($request);
        if (!$this->users->deleteUser($id)) { throw new ApiException('User not found.', 404, 'NOT_FOUND'); }
        Response::success('User deleted successfully', ['id' => $id]);
    }
}
