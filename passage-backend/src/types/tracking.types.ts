export interface TrackingLog {
  id: number;
  device_id: number;
  lat: number;
  lng: number;
  accuracy: number;
  speed: number;
  timestamp: Date;
}

export interface CreateTrackingLogDTO {
  device_id: number;
  lat: number;
  lng: number;
  accuracy: number;
  speed: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface GeofenceData {
  id: number;
  parent_user_id: number;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  active: boolean;
}
