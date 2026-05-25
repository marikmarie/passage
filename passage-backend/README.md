# PASSAGE Backend & Admin Dashboard

A comprehensive child safety platform with:
- **Node.js/Express RESTful API** with MySQL database
- **Real-time tracking** via Socket.IO
- **Web-based Admin Dashboard** for management
- **Payment integration** (Collecto)
- **Scheduled jobs** for alerts and monitoring
- **Role-based access control** (Parent, Rider, Admin, Support)

## 📋 Project Structure

```
passage-backend/
├── src/
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── modules/             # Feature modules (MVC pattern)
│   ├── services/            # External services
│   ├── sockets/             # Socket.IO handlers
│   ├── jobs/                # Scheduled tasks
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Utility helpers
│   └── server.ts            # Entry point
├── database/
│   ├── migrations/          # SQL migrations
│   └── seeds/               # Test data
├── admin-dashboard/         # Frontend admin UI
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file from template:**
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=passage_db
PORT=3000
JWT_SECRET=your_secret_key_here
```

4. **Create database:**
```bash
mysql -u root -p < database/migrations/001_create_users.sql
mysql -u root -p < database/migrations/002_create_riders.sql
# ... run all migration files
```

5. **Start development server:**
```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Riders
- `GET /api/v1/riders` - List riders
- `GET /api/v1/riders/:id` - Get rider by ID
- `POST /api/v1/riders` - Create rider
- `PUT /api/v1/riders/:id` - Update rider
- `DELETE /api/v1/riders/:id` - Delete rider

### Devices
- `GET /api/v1/devices` - List devices
- `GET /api/v1/devices/:id` - Get device
- `GET /api/v1/devices/rider/:riderId` - Get device by rider
- `POST /api/v1/devices` - Create device
- `PUT /api/v1/devices/:id` - Update device

### Tracking (Real-time GPS)
- `GET /api/v1/tracking/latest/:deviceId` - Get latest location
- `GET /api/v1/tracking/history/:deviceId` - Get location history
- `GET /api/v1/tracking/playback/:deviceId` - Get route playback
- `POST /api/v1/tracking/log` - Log location update

### Trips
- `GET /api/v1/trips` - List trips
- `GET /api/v1/trips/rider/:riderId` - Get rider trips
- `POST /api/v1/trips` - Create trip
- `PUT /api/v1/trips/:id/end` - End trip
- `PUT /api/v1/trips/:id/cancel` - Cancel trip

### Geofences (Safe Zones)
- `GET /api/v1/geofences` - List geofences
- `GET /api/v1/geofences/:id` - Get geofence
- `POST /api/v1/geofences` - Create geofence
- `PUT /api/v1/geofences/:id` - Update geofence
- `DELETE /api/v1/geofences/:id` - Delete geofence

### Alerts
- `GET /api/v1/alerts` - List all alerts
- `GET /api/v1/alerts/device/:deviceId` - Get device alerts
- `POST /api/v1/alerts` - Create alert
- `PUT /api/v1/alerts/:id/resolve` - Resolve alert

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications` - Send notification

### Payments
- `GET /api/v1/payments` - Get user payments
- `POST /api/v1/payments` - Initiate payment
- `GET /api/v1/payments/verify/:transactionId` - Verify payment

### Subscriptions
- `GET /api/v1/subscriptions` - Get user subscription
- `GET /api/v1/subscriptions/all` - List all subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `PUT /api/v1/subscriptions/:id/upgrade` - Upgrade plan
- `PUT /api/v1/subscriptions/:id/renew` - Renew subscription

### Reports & Analytics
- `GET /api/v1/reports/analytics` - Dashboard analytics
- `GET /api/v1/reports/daily-trips` - Daily trips report
- `GET /api/v1/reports/sos-frequency` - SOS alerts report
- `GET /api/v1/reports/revenue` - Revenue report

### Admin
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/users` - All users (admin only)
- `PUT /api/v1/admin/users/:userId/status` - Update user status
- `GET /api/v1/admin/devices` - All devices (admin only)
- `GET /api/v1/admin/alerts` - All alerts (admin only)
- `GET /api/v1/admin/payments` - All payments (admin only)

## 🔌 WebSocket Events

### Live Tracking Namespace (`/tracking`)
- `location_update` - Send device GPS location
- `live_location` - Receive live location broadcast
- `device_offline` - Notification when device goes offline

### Alerts Namespace (`/alerts`)
- `sos_alert` - Receive SOS alerts in real-time

## 🎛️ Admin Dashboard

Access dashboard at: `http://localhost:3000/admin`

### Features:
- **Dashboard** - KPI metrics and overview
- **User Management** - CRUD operations for users
- **Rider Management** - Manage child profiles
- **Device Management** - Link and manage wearable devices
- **Live Tracking** - Real-time GPS map and location updates
- **Alerts** - SOS and system alerts log
- **Trips** - Trip history and route playback
- **Geofences** - Draw and manage safe zones
- **Payments** - Transaction ledger
- **Subscriptions** - Plan management
- **Reports** - Analytics and charts

### Login
Default admin credentials (create first admin via API):
```
Email: admin@passage.local
Password: (set via API)
```

## 📊 Database Schema

### Users
- id, name, email, password_hash, role, status, created_at, updated_at

### Riders  
- id, user_id, parent_user_id, school, grade, created_at, updated_at

### Devices
- id, rider_id, imei, sim_number, firmware_version, battery_level, status, created_at, updated_at

### Tracking Logs
- id, device_id, lat, lng, accuracy, speed, timestamp

### Trips
- id, rider_id, device_id, start_time, end_time, distance_km, status

### Geofences
- id, parent_user_id, name, lat, lng, radius_m, active

### Alerts
- id, device_id, rider_id, type, resolved_at, created_at

### Notifications
- id, user_id, title, body, channel, sent_at

### Payments
- id, user_id, amount, currency, provider, status, reference

### Subscriptions
- id, user_id, plan, start_date, end_date, payment_id

## 🔐 Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token in header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/v1/users
```

## 👥 User Roles

- **Parent** - Can manage their children and devices
- **Rider** - Child's account, can send SOS
- **Admin** - Full system access
- **Support** - Can view and manage support tickets

## ⏰ Scheduled Jobs

- **Battery Alert Job** (Hourly) - Check for low battery devices
- **Inactive Device Job** (Every 5 min) - Mark devices offline
- **Trip Summary Job** (Daily 11:59 PM) - Generate trip summaries
- **Report Generation Job** (Daily midnight) - Generate daily reports
- **Health Check Job** (Every 30 sec) - Database health monitoring

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options

### External Services Integration
- **Collecto** - Payment processing
- **SMS Gateway** - SMS notifications
- **Firebase** - Push notifications
- **Email Service** - Email notifications

## 📝 Development

### Code Structure
- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic
- **Models** - Database operations
- **Routes** - API endpoints
- **Middleware** - Request processing
- **Types** - TypeScript interfaces
- **Utils** - Helper functions

### TypeScript Compilation
```bash
npm run build      # Compile to JavaScript
npm run dev        # Development with watch mode
```

## 🚨 Error Handling

All errors return standardized response:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - MySQL client
- **socket.io** - Real-time communication
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests
- **helmet** - Security headers
- **morgan** - HTTP logging
- **node-cron** - Scheduled tasks
- **dotenv** - Environment variables

## 📄 License

ISC

## 👨‍💻 Support

For issues and questions, please refer to the architecture documentation.
