<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;

final class ReportsController extends Controller
{
    public function dailyTrips(Request $request): never
    {
        $db = Database::connection();
        $sql = "SELECT DATE(created_at) AS date, COUNT(*) AS total, SUM(status = 'completed') AS completed, SUM(status = 'cancelled') AS cancelled FROM trips GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30";
        $rows = $db->query(Database::prefixTables($sql))->fetchAll();
        Response::success('Daily trips report retrieved successfully', $rows);
    }
    public function sos(Request $request): never
    {
        $sql = "SELECT DATE(created_at) AS date, COUNT(*) AS total FROM alerts WHERE type = 'SOS' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30";
        $rows = Database::connection()->query(Database::prefixTables($sql))->fetchAll();
        Response::success('SOS frequency report retrieved successfully', $rows);
    }
    public function revenue(Request $request): never
    {
        $sql = "SELECT DATE(created_at) AS date, currency, SUM(amount) AS amount FROM payments WHERE status = 'completed' GROUP BY DATE(created_at), currency ORDER BY date DESC LIMIT 30";
        $rows = Database::connection()->query(Database::prefixTables($sql))->fetchAll();
        Response::success('Revenue report retrieved successfully', $rows);
    }
    public function analytics(Request $request): never
    {
        $db = Database::connection();
        $data = [
            'trips' => $db->query(Database::prefixTables('SELECT status, COUNT(*) AS total FROM trips GROUP BY status'))->fetchAll(),
            'alerts' => $db->query(Database::prefixTables('SELECT type, COUNT(*) AS total FROM alerts GROUP BY type'))->fetchAll(),
            'device_statuses' => $db->query(Database::prefixTables('SELECT status, COUNT(*) AS total FROM devices GROUP BY status'))->fetchAll(),
        ];
        Response::success('Analytics retrieved successfully', $data);
    }
}
