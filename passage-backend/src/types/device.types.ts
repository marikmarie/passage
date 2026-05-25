export type DeviceStatus = 'active' | 'inactive' | 'lost' | 'damaged' | 'offline';

export interface Device {
  id: number;
  rider_id: number;
  imei: string;
  sim_number: string;
  firmware_version: string;
  battery_level: number;
  status: DeviceStatus;
  last_seen?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeviceDTO {
  rider_id: number;
  imei: string;
  sim_number: string;
  firmware_version: string;
}

export interface UpdateDeviceDTO {
  imei?: string;
  sim_number?: string;
  firmware_version?: string;
  battery_level?: number;
  status?: DeviceStatus;
  last_seen?: Date;
}
