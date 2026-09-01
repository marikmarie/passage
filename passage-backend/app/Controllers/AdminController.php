<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiException;
use App\Core\Controller;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\DeviceModel;
use App\Models\PlatformModel;
use App\Models\RiderModel;
use App\Models\UserModel;

final class AdminController extends Controller
{
    private PlatformModel $platform;
    private UserModel $users;
    private RiderModel $riders;
    public function __construct() { $this->platform = new PlatformModel(); $this->users = new UserModel(); $this->riders = new RiderModel(); }
    public function stats(Request $request): never { Response::success('System statistics retrieved successfully', $this->platform->systemStats()); }
    public function users(Request $request): never { $page = $this->page($request); $result = $this->users->paginate($page['limit'], $page['offset']); Response::paginated('Users retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']); }
    public function userStatus(Request $request): never
    {
        $this->requireFields($request, ['status']); $status = (string) $request->input('status');
        if (!in_array($status, ['active', 'inactive', 'suspended'], true)) { throw new ApiException('Invalid user status.', 422, 'VALIDATION_ERROR'); }
        $user = $this->users->updateUser($this->id($request, 'userId'), ['status' => $status]); if ($user === null) { throw new ApiException('User not found.', 404, 'NOT_FOUND'); }
        Response::success('User status updated successfully', $this->users->withoutSecrets($user));
    }
    public function devices(Request $request): never { $page = $this->page($request); $result = (new DeviceModel())->paginate($page['limit'], $page['offset']); Response::paginated('Devices retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']); }
    public function alerts(Request $request): never { $page = $this->page($request); $result = $this->platform->alerts($page['limit'], $page['offset']); Response::paginated('Alerts retrieved successfully', $result['items'], $result['total'], $page['page'], $page['limit']); }
    public function payments(Request $request): never { Response::success('Payments retrieved successfully', $this->platform->payments(0, 'admin')); }
    public function riderReviews(Request $request): never
    {
        $sql = "SELECT r.*, u.name, u.email, u.phone_number FROM riders r JOIN users u ON u.id = r.user_id WHERE r.approval_status IN ('pending_review', 'approved', 'rejected', 'suspended') ORDER BY r.updated_at DESC";
        $rows = Database::connection()->query(Database::prefixTables($sql))->fetchAll();
        Response::success('Rider reviews retrieved successfully', $rows);
    }
    public function riderReview(Request $request): never
    {
        $rider = $this->riders->find($this->id($request, 'riderId')); if ($rider === null) { throw new ApiException('Rider not found.', 404, 'NOT_FOUND'); }
        Response::success('Rider review retrieved successfully', $rider);
    }
    public function riderReviewStatus(Request $request): never
    {
        $this->requireFields($request, ['approval_status']); $status = (string) $request->input('approval_status');
        if (!in_array($status, ['draft', 'pending_review', 'approved', 'rejected', 'suspended'], true)) { throw new ApiException('Invalid approval status.', 422, 'VALIDATION_ERROR'); }
        $rider = $this->riders->updateRider($this->id($request, 'riderId'), ['approval_status' => $status, 'reviewed_by' => (int) $this->user($request)['id'], 'reviewed_at' => date('Y-m-d H:i:s'), 'review_note' => $request->input('review_note', $request->input('review_notes'))]);
        if ($rider === null) { throw new ApiException('Rider not found.', 404, 'NOT_FOUND'); }
        Response::success('Rider review status updated successfully', $rider);
    }
}
