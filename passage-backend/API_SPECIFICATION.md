# PASSAGE API Specification v1.0

## Overview
The PASSAGE API is a comprehensive RESTful backend for a school bus tracking and management system. It provides endpoints for authentication, user management, rider tracking, device management, trip monitoring, geofencing, alerts, notifications, payments, subscriptions, reports, and admin operations.

**Base URL:** `http://localhost:3000/api/v1` (or deployed domain)

**Health Check:** `GET /api/health` → Returns `{ status: "ok", message: "PASSAGE API is running" }`

---

## Authentication

All endpoints (except registration and login) require Bearer token authentication via the `Authorization` header.

```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication Flow
1. User registers or logs in
2. Server returns a JWT token
3. Client includes token in all subsequent requests
4. Token must be refreshed upon expiration

---

## Global Response Format

### Success Response
```json
{
  "success": true,
  "message": "Description of success",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Description of error"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Description",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## API Endpoints

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 Register User
**POST** `/api/v1/auth/register`

**Description:** Register a new user account

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "parent"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name of the user |
| email | string | Yes | Email address (must be unique) |
| password | string | Yes | Password (min 8 characters recommended) |
| phone | string | No | Phone number |
| role | string | No | User role (default: 'parent', options: 'parent', 'admin', 'support', 'rider') |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "parent",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Missing required fields or invalid input

---

#### 1.2 Login User
**POST** `/api/v1/auth/login`

**Description:** Authenticate user and obtain JWT token

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

**Error Responses:**
- 400: Missing email or password
- 401: Invalid credentials

---

#### 1.3 Get Current User Profile
**GET** `/api/v1/auth/me`

**Description:** Get the authenticated user's profile information

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "parent",
    "created_at": "2026-05-25T10:30:00Z",
    "updated_at": "2026-05-25T10:30:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized (invalid/missing token)
- 404: User not found

---

### 2. USERS ENDPOINTS

#### 2.1 Get All Users
**GET** `/api/v1/users`

**Description:** Retrieve paginated list of all users

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |
| role | string | - | Filter by user role (optional) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "parent",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

#### 2.2 Get User By ID
**GET** `/api/v1/users/:id`

**Description:** Retrieve a specific user by ID

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "parent",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

**Error Responses:**
- 404: User not found

---

#### 2.3 Update User
**PUT** `/api/v1/users/:id`

**Description:** Update user information

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+0987654321"
}
```

**Updatable Fields:**
| Field | Type | Description |
|-------|------|-------------|
| name | string | User's full name |
| phone | string | User's phone number |
| email | string | User's email address |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "john@example.com",
    "phone": "+0987654321",
    "role": "parent",
    "updated_at": "2026-05-25T11:00:00Z"
  }
}
```

**Error Responses:**
- 404: User not found

---

#### 2.4 Delete User
**DELETE** `/api/v1/users/:id`

**Description:** Delete a user (Admin only)

**Authentication:** Required (Admin role required)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Error Responses:**
- 403: Insufficient permissions
- 404: User not found

---

### 3. RIDERS ENDPOINTS

#### 3.1 Get Rider By ID
**GET** `/api/v1/riders/:id`

**Description:** Retrieve a specific rider's information

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Rider ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rider retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 5,
    "parent_user_id": 1,
    "school": "Lincoln High School",
    "grade": "10th",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 3.2 Get Riders By Parent ID
**GET** `/api/v1/riders/by-parent`

**Description:** Retrieve all riders associated with the authenticated parent user

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Riders retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "parent_user_id": 1,
      "school": "Lincoln High School",
      "grade": "10th",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

#### 3.3 Create Rider
**POST** `/api/v1/riders`

**Description:** Create a new rider profile

**Authentication:** Required

**Request Body:**
```json
{
  "user_id": 5,
  "parent_user_id": 1,
  "school": "Lincoln High School",
  "grade": "10th"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | integer | Yes | User ID of the rider |
| parent_user_id | integer | Yes | Parent user ID |
| school | string | Yes | School name |
| grade | string | Yes | Grade level |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Rider created successfully",
  "data": {
    "id": 1,
    "user_id": 5,
    "parent_user_id": 1,
    "school": "Lincoln High School",
    "grade": "10th",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 3.4 Update Rider
**PUT** `/api/v1/riders/:id`

**Description:** Update rider information

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Rider ID |

**Request Body:**
```json
{
  "school": "Lincoln High School",
  "grade": "11th"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rider updated successfully",
  "data": {
    "id": 1,
    "user_id": 5,
    "parent_user_id": 1,
    "school": "Lincoln High School",
    "grade": "11th",
    "updated_at": "2026-05-25T11:00:00Z"
  }
}
```

---

#### 3.5 Delete Rider
**DELETE** `/api/v1/riders/:id`

**Description:** Delete a rider

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Rider ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rider deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 4. DEVICES ENDPOINTS

#### 4.1 Get All Devices
**GET** `/api/v1/devices`

**Description:** Retrieve paginated list of all devices

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": [
    {
      "id": 1,
      "rider_id": 1,
      "device_type": "GPS",
      "device_id": "DEV001",
      "status": "active",
      "battery_level": 85,
      "last_seen": "2026-05-25T10:30:00Z",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

#### 4.2 Get Device By ID
**GET** `/api/v1/devices/:id`

**Description:** Retrieve a specific device

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device retrieved successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_type": "GPS",
    "device_id": "DEV001",
    "status": "active",
    "battery_level": 85,
    "last_seen": "2026-05-25T10:30:00Z",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 4.3 Get Devices By Rider ID
**GET** `/api/v1/devices/rider/:riderId`

**Description:** Get all devices assigned to a specific rider

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| riderId | integer | Rider ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": [
    {
      "id": 1,
      "rider_id": 1,
      "device_type": "GPS",
      "device_id": "DEV001",
      "status": "active",
      "battery_level": 85,
      "last_seen": "2026-05-25T10:30:00Z",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ]
}
```

---

#### 4.4 Create Device
**POST** `/api/v1/devices`

**Description:** Create and assign a new device

**Authentication:** Required

**Request Body:**
```json
{
  "rider_id": 1,
  "device_type": "GPS",
  "device_id": "DEV001"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rider_id | integer | Yes | Rider ID |
| device_type | string | Yes | Type of device (e.g., "GPS") |
| device_id | string | Yes | Device identifier |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Device created successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_type": "GPS",
    "device_id": "DEV001",
    "status": "active",
    "battery_level": 100,
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 4.5 Update Device
**PUT** `/api/v1/devices/:id`

**Description:** Update device information

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Device ID |

**Request Body:**
```json
{
  "status": "inactive",
  "battery_level": 50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_type": "GPS",
    "device_id": "DEV001",
    "status": "inactive",
    "battery_level": 50,
    "updated_at": "2026-05-25T11:00:00Z"
  }
}
```

---

#### 4.6 Delete Device
**DELETE** `/api/v1/devices/:id`

**Description:** Delete a device

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Device deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 5. TRACKING ENDPOINTS

#### 5.1 Get Latest Location
**GET** `/api/v1/tracking/latest/:deviceId`

**Description:** Get the latest GPS location for a device

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| deviceId | integer | Device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location retrieved successfully",
  "data": {
    "id": 1,
    "device_id": 1,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 25.5,
    "accuracy": 10.0,
    "timestamp": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 5.2 Get Location History
**GET** `/api/v1/tracking/history/:deviceId`

**Description:** Get historical location data for a device

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| deviceId | integer | Device ID |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | ISO date (e.g., 2026-05-25) |
| endDate | string | ISO date (e.g., 2026-05-25) |
| limit | integer | Number of records (default: 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Location history retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "speed": 25.5,
      "accuracy": 10.0,
      "timestamp": "2026-05-25T10:30:00Z"
    }
  ]
}
```

---

#### 5.3 Get Route Playback
**GET** `/api/v1/tracking/playback/:deviceId`

**Description:** Get playback route for tracking visualization

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| deviceId | integer | Device ID |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date | string | ISO date (e.g., 2026-05-25) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Route playback retrieved successfully",
  "data": {
    "device_id": 1,
    "date": "2026-05-25",
    "route": [
      {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "speed": 25.5,
        "timestamp": "2026-05-25T10:30:00Z"
      }
    ],
    "totalDistance": 15.5,
    "duration": 3600
  }
}
```

---

#### 5.4 Log Location
**POST** `/api/v1/tracking/log`

**Description:** Log/record a GPS location (typically from device)

**Authentication:** Required

**Request Body:**
```json
{
  "device_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "speed": 25.5,
  "accuracy": 10.0
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| device_id | integer | Yes | Device ID |
| latitude | float | Yes | Latitude coordinate |
| longitude | float | Yes | Longitude coordinate |
| speed | float | No | Speed in km/h |
| accuracy | float | No | GPS accuracy in meters |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Location logged successfully",
  "data": {
    "id": 1,
    "device_id": 1,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "speed": 25.5,
    "accuracy": 10.0,
    "timestamp": "2026-05-25T10:30:00Z"
  }
}
```

---

### 6. TRIPS ENDPOINTS

#### 6.1 Get Trip By ID
**GET** `/api/v1/trips/:id`

**Description:** Retrieve a specific trip

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Trip ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip retrieved successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_id": 1,
    "start_location": "School Address",
    "end_location": "Home Address",
    "start_time": "2026-05-25T08:00:00Z",
    "end_time": "2026-05-25T08:30:00Z",
    "distance": 5.2,
    "status": "completed",
    "created_at": "2026-05-25T08:00:00Z"
  }
}
```

---

#### 6.2 Get Trips By Rider ID
**GET** `/api/v1/trips/rider/:riderId`

**Description:** Retrieve all trips for a specific rider

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| riderId | integer | Rider ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |
| status | string | - | Filter by trip status |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trips retrieved successfully",
  "data": [
    {
      "id": 1,
      "rider_id": 1,
      "device_id": 1,
      "start_location": "School Address",
      "end_location": "Home Address",
      "start_time": "2026-05-25T08:00:00Z",
      "end_time": "2026-05-25T08:30:00Z",
      "distance": 5.2,
      "status": "completed",
      "created_at": "2026-05-25T08:00:00Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

#### 6.3 Create Trip
**POST** `/api/v1/trips`

**Description:** Start a new trip

**Authentication:** Required

**Request Body:**
```json
{
  "rider_id": 1,
  "device_id": 1,
  "start_location": "School Address"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rider_id | integer | Yes | Rider ID |
| device_id | integer | Yes | Device ID |
| start_location | string | Yes | Starting location |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_id": 1,
    "start_location": "School Address",
    "start_time": "2026-05-25T08:00:00Z",
    "status": "active",
    "created_at": "2026-05-25T08:00:00Z"
  }
}
```

---

#### 6.4 End Trip
**PUT** `/api/v1/trips/:id/end`

**Description:** Mark a trip as completed

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Trip ID |

**Request Body:**
```json
{
  "end_location": "Home Address"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": {
    "id": 1,
    "rider_id": 1,
    "device_id": 1,
    "start_location": "School Address",
    "end_location": "Home Address",
    "start_time": "2026-05-25T08:00:00Z",
    "end_time": "2026-05-25T08:30:00Z",
    "distance": 5.2,
    "status": "completed",
    "updated_at": "2026-05-25T08:30:00Z"
  }
}
```

---

#### 6.5 Cancel Trip
**PUT** `/api/v1/trips/:id/cancel`

**Description:** Cancel an active trip

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Trip ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled",
    "updated_at": "2026-05-25T08:30:00Z"
  }
}
```

---

### 7. GEOFENCES ENDPOINTS

#### 7.1 Get Geofence By ID
**GET** `/api/v1/geofences/:id`

**Description:** Retrieve a specific geofence

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Geofence ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Geofence retrieved successfully",
  "data": {
    "id": 1,
    "parent_user_id": 1,
    "name": "School Zone",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 500,
    "type": "safe",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 7.2 Get Geofences By Parent
**GET** `/api/v1/geofences`

**Description:** Get all geofences created by authenticated parent

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Geofences retrieved successfully",
  "data": [
    {
      "id": 1,
      "parent_user_id": 1,
      "name": "School Zone",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "radius": 500,
      "type": "safe",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

#### 7.3 Create Geofence
**POST** `/api/v1/geofences`

**Description:** Create a new geofence

**Authentication:** Required

**Request Body:**
```json
{
  "name": "School Zone",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 500,
  "type": "safe"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Geofence name |
| latitude | float | Yes | Center latitude |
| longitude | float | Yes | Center longitude |
| radius | integer | Yes | Radius in meters |
| type | string | No | Type (e.g., "safe", "danger", "school") |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Geofence created successfully",
  "data": {
    "id": 1,
    "parent_user_id": 1,
    "name": "School Zone",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 500,
    "type": "safe",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 7.4 Update Geofence
**PUT** `/api/v1/geofences/:id`

**Description:** Update geofence details

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Geofence ID |

**Request Body:**
```json
{
  "radius": 600
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Geofence updated successfully",
  "data": {
    "id": 1,
    "parent_user_id": 1,
    "name": "School Zone",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 600,
    "type": "safe",
    "updated_at": "2026-05-25T11:00:00Z"
  }
}
```

---

#### 7.5 Delete Geofence
**DELETE** `/api/v1/geofences/:id`

**Description:** Delete a geofence

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Geofence ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Geofence deleted successfully",
  "data": {
    "id": 1
  }
}
```

---

### 8. ALERTS ENDPOINTS

#### 8.1 Get All Alerts
**GET** `/api/v1/alerts`

**Description:** Retrieve paginated list of all alerts

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Items per page |
| status | string | - | Filter by status (active/resolved) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerts retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "rider_id": 1,
      "alert_type": "geofence_exit",
      "message": "Rider exited school zone",
      "severity": "high",
      "status": "active",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

#### 8.2 Get Alerts By Device ID
**GET** `/api/v1/alerts/device/:deviceId`

**Description:** Get all alerts for a specific device

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| deviceId | integer | Device ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerts retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "rider_id": 1,
      "alert_type": "geofence_exit",
      "message": "Rider exited school zone",
      "severity": "high",
      "status": "active",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ]
}
```

---

#### 8.3 Create Alert
**POST** `/api/v1/alerts`

**Description:** Create a new alert (typically triggered by system)

**Authentication:** Required

**Request Body:**
```json
{
  "device_id": 1,
  "rider_id": 1,
  "alert_type": "geofence_exit",
  "message": "Rider exited school zone",
  "severity": "high"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| device_id | integer | Yes | Device ID |
| rider_id | integer | Yes | Rider ID |
| alert_type | string | Yes | Type of alert |
| message | string | Yes | Alert message |
| severity | string | No | Severity level (low/medium/high) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alert created successfully",
  "data": {
    "id": 1,
    "device_id": 1,
    "rider_id": 1,
    "alert_type": "geofence_exit",
    "message": "Rider exited school zone",
    "severity": "high",
    "status": "active",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 8.4 Resolve Alert
**PUT** `/api/v1/alerts/:id/resolve`

**Description:** Mark an alert as resolved

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Alert ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert resolved successfully",
  "data": {
    "id": 1,
    "status": "resolved",
    "resolved_at": "2026-05-25T11:00:00Z"
  }
}
```

---

### 9. NOTIFICATIONS ENDPOINTS

#### 9.1 Get Notifications
**GET** `/api/v1/notifications`

**Description:** Get all notifications for authenticated user

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Rider Arrived at School",
      "message": "Your child has arrived safely at school",
      "type": "trip_alert",
      "read": false,
      "created_at": "2026-05-25T08:30:00Z"
    }
  ]
}
```

---

#### 9.2 Send Notification
**POST** `/api/v1/notifications`

**Description:** Send a notification to user(s)

**Authentication:** Required

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Rider Arrived at School",
  "message": "Your child has arrived safely at school",
  "type": "trip_alert"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | integer | Yes | Recipient user ID |
| title | string | Yes | Notification title |
| message | string | Yes | Notification message |
| type | string | No | Notification type |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Rider Arrived at School",
    "message": "Your child has arrived safely at school",
    "type": "trip_alert",
    "read": false,
    "created_at": "2026-05-25T08:30:00Z"
  }
}
```

---

### 10. PAYMENTS ENDPOINTS

#### 10.1 Get User Payments
**GET** `/api/v1/payments`

**Description:** Get all payments for authenticated user

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN001",
      "payment_method": "credit_card",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ]
}
```

---

#### 10.2 Initiate Payment
**POST** `/api/v1/payments`

**Description:** Initiate a new payment

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 9.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "subscription_type": "monthly"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | Yes | Payment amount |
| currency | string | No | Currency code (default: USD) |
| payment_method | string | Yes | Payment method type |
| subscription_type | string | No | Associated subscription type |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": 9.99,
    "currency": "USD",
    "status": "pending",
    "transaction_id": "TXN001",
    "payment_url": "https://payment-gateway.com/checkout/TXN001",
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 10.3 Verify Payment
**GET** `/api/v1/payments/verify/:transactionId`

**Description:** Verify payment status

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| transactionId | string | Transaction ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 1,
    "transaction_id": "TXN001",
    "status": "completed",
    "amount": 9.99,
    "verified_at": "2026-05-25T10:35:00Z"
  }
}
```

---

### 11. SUBSCRIPTIONS ENDPOINTS

#### 11.1 Get User Subscription
**GET** `/api/v1/subscriptions`

**Description:** Get current subscription for authenticated user

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "start_date": "2026-05-01",
    "end_date": "2026-06-01",
    "auto_renew": true,
    "price": 9.99,
    "created_at": "2026-05-01T10:30:00Z"
  }
}
```

---

#### 11.2 Get All Subscriptions
**GET** `/api/v1/subscriptions/all`

**Description:** Get all subscriptions (Admin only)

**Authentication:** Required (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "plan_type": "premium",
      "status": "active",
      "start_date": "2026-05-01",
      "end_date": "2026-06-01",
      "price": 9.99,
      "created_at": "2026-05-01T10:30:00Z"
    }
  ]
}
```

---

#### 11.3 Create Subscription
**POST** `/api/v1/subscriptions`

**Description:** Create a new subscription

**Authentication:** Required

**Request Body:**
```json
{
  "plan_type": "premium",
  "billing_cycle": "monthly"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| plan_type | string | Yes | Plan type (basic/premium/enterprise) |
| billing_cycle | string | No | Billing cycle (monthly/yearly) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "start_date": "2026-05-25",
    "end_date": "2026-06-25",
    "auto_renew": true,
    "price": 9.99,
    "created_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 11.4 Upgrade Subscription
**PUT** `/api/v1/subscriptions/:id/upgrade`

**Description:** Upgrade to a higher plan

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Subscription ID |

**Request Body:**
```json
{
  "new_plan": "enterprise"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "data": {
    "id": 1,
    "plan_type": "enterprise",
    "status": "active",
    "price": 29.99,
    "updated_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 11.5 Renew Subscription
**PUT** `/api/v1/subscriptions/:id/renew`

**Description:** Renew an expiring subscription

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Subscription ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "id": 1,
    "status": "active",
    "end_date": "2026-06-25",
    "renewed_at": "2026-05-25T10:30:00Z"
  }
}
```

---

### 12. REPORTS ENDPOINTS

#### 12.1 Get Daily Trips Report
**GET** `/api/v1/reports/daily-trips`

**Description:** Get daily trips analytics (Admin/Support only)

**Authentication:** Required (Admin or Support role)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date | string | ISO date (e.g., 2026-05-25) |
| rider_id | integer | Filter by rider (optional) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Daily trips report retrieved successfully",
  "data": {
    "date": "2026-05-25",
    "total_trips": 150,
    "completed_trips": 145,
    "active_trips": 5,
    "average_distance": 5.2,
    "total_distance": 780
  }
}
```

---

#### 12.2 Get SOS Frequency Report
**GET** `/api/v1/reports/sos-frequency`

**Description:** Get SOS alerts frequency report (Admin/Support only)

**Authentication:** Required (Admin or Support role)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | ISO date |
| endDate | string | ISO date |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "SOS frequency report retrieved successfully",
  "data": {
    "period": "2026-05-20 to 2026-05-25",
    "total_sos_alerts": 15,
    "average_per_day": 2.5,
    "top_locations": [
      {
        "location": "Downtown Area",
        "count": 5
      }
    ]
  }
}
```

---

#### 12.3 Get Revenue Report
**GET** `/api/v1/reports/revenue`

**Description:** Get revenue analytics (Admin only)

**Authentication:** Required (Admin role)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | ISO date |
| endDate | string | ISO date |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Revenue report retrieved successfully",
  "data": {
    "period": "2026-05-20 to 2026-05-25",
    "total_revenue": 5000.00,
    "currency": "USD",
    "subscription_revenue": 4500.00,
    "payment_transactions": 120,
    "average_transaction": 41.67
  }
}
```

---

#### 12.4 Get Analytics
**GET** `/api/v1/reports/analytics`

**Description:** Get system-wide analytics (Admin only)

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "total_users": 5000,
    "active_users": 3500,
    "total_riders": 8000,
    "total_devices": 8100,
    "active_devices": 7950,
    "daily_active_trips": 450,
    "system_uptime": 99.95
  }
}
```

---

### 13. ADMIN ENDPOINTS

#### 13.1 Get System Stats
**GET** `/api/v1/admin/stats`

**Description:** Get overall system statistics (Admin only)

**Authentication:** Required (Admin role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "System statistics retrieved successfully",
  "data": {
    "total_users": 5000,
    "total_riders": 8000,
    "total_devices": 8100,
    "active_trips": 450,
    "active_alerts": 25,
    "system_health": "healthy",
    "uptime_percentage": 99.95
  }
}
```

---

#### 13.2 Get All Users (Admin)
**GET** `/api/v1/admin/users`

**Description:** Get all users with admin details (Admin only)

**Authentication:** Required (Admin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| role | string | - | Filter by role |
| status | string | - | Filter by status |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "parent",
      "status": "active",
      "created_at": "2026-05-25T10:30:00Z",
      "last_login": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5000,
    "page": 1,
    "limit": 20,
    "pages": 250
  }
}
```

---

#### 13.3 Update User Status
**PUT** `/api/v1/admin/users/:userId/status`

**Description:** Update user account status (Admin only)

**Authentication:** Required (Admin role)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | integer | User ID |

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status (active/inactive/suspended) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "status": "inactive",
    "updated_at": "2026-05-25T10:30:00Z"
  }
}
```

---

#### 13.4 Get All Devices (Admin)
**GET** `/api/v1/admin/devices`

**Description:** Get all devices with admin details (Admin only)

**Authentication:** Required (Admin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| status | string | - | Filter by status |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_id": "DEV001",
      "rider_id": 1,
      "status": "active",
      "battery_level": 85,
      "last_seen": "2026-05-25T10:30:00Z",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 8100,
    "page": 1,
    "limit": 20,
    "pages": 405
  }
}
```

---

#### 13.5 Get All Alerts (Admin)
**GET** `/api/v1/admin/alerts`

**Description:** Get all system alerts (Admin only)

**Authentication:** Required (Admin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| status | string | - | Filter by status |
| severity | string | - | Filter by severity |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerts retrieved successfully",
  "data": [
    {
      "id": 1,
      "device_id": 1,
      "rider_id": 1,
      "alert_type": "geofence_exit",
      "message": "Rider exited school zone",
      "severity": "high",
      "status": "active",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5000,
    "page": 1,
    "limit": 20,
    "pages": 250
  }
}
```

---

#### 13.6 Get All Payments (Admin)
**GET** `/api/v1/admin/payments`

**Description:** Get all system payments (Admin only)

**Authentication:** Required (Admin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| status | string | - | Filter by status |
| date_from | string | - | Filter by start date |
| date_to | string | - | Filter by end date |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "amount": 9.99,
      "currency": "USD",
      "status": "completed",
      "transaction_id": "TXN001",
      "payment_method": "credit_card",
      "created_at": "2026-05-25T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15000,
    "page": 1,
    "limit": 20,
    "pages": 750
  }
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server-side error |

---

## Error Handling

All errors follow the standard error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Error Scenarios:**
- Missing authentication token: 401
- Invalid token: 403
- Resource not found: 404
- Invalid input data: 400
- Server errors: 500

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Headers Returned:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

For endpoints that support pagination:

```
GET /api/v1/users?page=1&limit=10&sortBy=name&sortOrder=asc
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Field to sort by
- `sortOrder`: Sort order (asc/desc)

**Response includes pagination metadata:**
```json
"pagination": {
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

---

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| parent | View own riders, devices, trips; create/manage geofences |
| rider | View own profile and trips |
| admin | Full system access, user management, reports, analytics |
| support | View users, devices, alerts; generate reports |

---

## WebSocket Events (Socket.IO)

Real-time tracking via WebSocket connection at `ws://localhost:3000/tracking`

**Emitted Events:**
- `location_update`: Device location changed
- `alert_triggered`: System alert generated
- `trip_started`: Trip initiated
- `trip_ended`: Trip completed
- `device_status`: Device status changed

---

## Future Enhancements

- Two-factor authentication (2FA)
- OAuth/Social login integration
- Advanced analytics dashboard
- Machine learning for anomaly detection
- Multi-language support
- Mobile app synchronization

---

**Last Updated:** May 25, 2026  
**Version:** 1.0.0  
**Maintained by:** PASSAGE Development Team
