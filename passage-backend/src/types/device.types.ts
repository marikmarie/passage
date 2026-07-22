export type DeviceStatus = 'active' | 'inactive' | 'maintenance' | 'lost' | 'damaged' | 'offline';

export type WatchState =
  | 'IDLE_READY'
  | 'RIDE_ASSIGNED'
  | 'DRIVER_NEARBY'
  | 'AWAITING_VERIFICATION'
  | 'PICKUP_CONFIRMED'
  | 'IN_TRANSIT'
  | 'DROPOFF_CONFIRMED'
  | 'SOS_ACTIVE'
  | 'LOW_BATTERY'
  | 'OFFLINE';

export interface Device {
  id: number;
  imei: string;
  sim_number: string;
  firmware_version: string;
  battery_level: number;
  device_token?: string | null;
  status: DeviceStatus;
  current_state?: WatchState | null;
  last_online_at?: Date | null;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeviceDTO {
  imei: string;
  sim_number: string;
  firmware_version: string;
}

export interface UpdateDeviceDTO {
  imei?: string;
  sim_number?: string;
  firmware_version?: string;
  battery_level?: number;
  device_token?: string | null;
  status?: DeviceStatus;
  current_state?: WatchState;
  last_online_at?: Date | null;
  last_seen?: Date;
}
