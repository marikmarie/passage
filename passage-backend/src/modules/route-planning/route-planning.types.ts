export interface CoordinatePoint {
  lat: number;
  lng: number;
}

export interface DirectionsRequest {
  start: CoordinatePoint;
  end: CoordinatePoint;
  profile?: string;
}

export interface RoutePoint extends CoordinatePoint {}

export interface DirectionsResult {
  provider: 'openrouteservice';
  profile: string;
  distance_meters: number;
  duration_seconds: number;
  route_points: RoutePoint[];
  bbox?: number[];
}

export interface RiderCandidate {
  rider_id: number | string;
  display_code?: string;
  vehicle_type?: 'boda' | 'tuktuk' | string;
  lat: number;
  lng: number;
  rating?: number;
}

export interface NearestRiderRequest {
  pickup: CoordinatePoint;
  vehicle_type?: 'boda' | 'tuktuk' | string;
  candidates: RiderCandidate[];
}

export interface NearestRiderResult extends RiderCandidate {
  distance_meters: number;
}
