import { env } from '../../config/env';
import {
  CoordinatePoint,
  DirectionsRequest,
  DirectionsResult,
  NearestRiderRequest,
  NearestRiderResult,
  RiderCandidate,
} from './route-planning.types';

const DEFAULT_PROFILE = 'driving-car';
const ROUTE_CACHE_TTL_MS = 5 * 60 * 1000;
const ALLOWED_PROFILES = new Set([
  'driving-car',
  'driving-hgv',
  'cycling-regular',
  'cycling-road',
  'cycling-mountain',
  'foot-walking',
]);

interface OpenRouteServiceFeatureCollection {
  bbox?: number[];
  features?: Array<{
    bbox?: number[];
    geometry?: {
      coordinates?: number[][];
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
    };
  }>;
  error?: {
    code?: number;
    message?: string;
  };
}

export class RoutePlanningService {
  private readonly directionsCache = new Map<
    string,
    { expiresAt: number; value: DirectionsResult }
  >();

  async getDirections(request: DirectionsRequest): Promise<DirectionsResult> {
    const apiKey = env.ORS_API_KEY;
    const baseUrl = env.ORS_BASE_URL;
    const profile = this.normalizeProfile(request.profile);

    this.assertCoordinate(request.start, 'start');
    this.assertCoordinate(request.end, 'end');

    const cacheKey = this.cacheKey(request.start, request.end, profile);
    const cached = this.directionsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    if (cached) this.directionsCache.delete(cacheKey);

    if (!apiKey) {
      const error = new Error('OpenRouteService is not configured. Set ORS_API_KEY on the backend.');
      (error as any).statusCode = 503;
      throw error;
    }

    const response = await fetch(`${baseUrl}/v2/directions/${profile}/geojson`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json, application/geo+json',
      },
      body: JSON.stringify({
        coordinates: [
          [request.start.lng, request.start.lat],
          [request.end.lng, request.end.lat],
        ],
      }),
    });

    const data = (await response.json().catch(() => ({}))) as OpenRouteServiceFeatureCollection;

    if (!response.ok) {
      const message = data.error?.message || `OpenRouteService request failed with status ${response.status}`;
      const error = new Error(message);
      (error as any).statusCode = response.status >= 500 ? 502 : response.status;
      throw error;
    }

    const feature = data.features?.[0];
    const coordinates = feature?.geometry?.coordinates;

    if (!coordinates || coordinates.length === 0) {
      const error = new Error('OpenRouteService returned no route geometry.');
      (error as any).statusCode = 502;
      throw error;
    }

    const result: DirectionsResult = {
      provider: 'openrouteservice',
      profile,
      distance_meters: feature?.properties?.summary?.distance ?? 0,
      duration_seconds: feature?.properties?.summary?.duration ?? 0,
      route_points: coordinates.map(([lng, lat]) => ({ lat, lng })),
      bbox: feature?.bbox || data.bbox,
    };

    this.directionsCache.set(cacheKey, {
      expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
      value: result,
    });
    return result;
  }

  findNearestRider(request: NearestRiderRequest): NearestRiderResult | null {
    this.assertCoordinate(request.pickup, 'pickup');

    const candidates = request.candidates.filter((candidate) => {
      if (!this.isCoordinate(candidate)) {
        return false;
      }

      if (!request.vehicle_type) {
        return true;
      }

      return candidate.vehicle_type === request.vehicle_type;
    });

    if (candidates.length === 0) {
      return null;
    }

    return candidates
      .map((candidate) => ({
        ...candidate,
        distance_meters: this.distanceMeters(request.pickup, candidate),
      }))
      .sort((a, b) => a.distance_meters - b.distance_meters)[0];
  }

  private normalizeProfile(profile?: string): string {
    const normalized = profile || DEFAULT_PROFILE;

    if (!ALLOWED_PROFILES.has(normalized)) {
      const error = new Error(`Unsupported routing profile: ${normalized}`);
      (error as any).statusCode = 400;
      throw error;
    }

    return normalized;
  }

  private assertCoordinate(point: CoordinatePoint, fieldName: string): void {
    if (!this.isCoordinate(point)) {
      const error = new Error(`${fieldName} must include valid lat and lng values.`);
      (error as any).statusCode = 400;
      throw error;
    }
  }

  private isCoordinate(point: Partial<CoordinatePoint> | RiderCandidate | undefined): point is CoordinatePoint {
    return Boolean(
      point &&
      typeof point.lat === 'number' &&
      Number.isFinite(point.lat) &&
      typeof point.lng === 'number' &&
      Number.isFinite(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180
    );
  }

  private distanceMeters(a: CoordinatePoint, b: CoordinatePoint): number {
    const earthRadiusMeters = 6371000;
    const lat1 = this.toRadians(a.lat);
    const lat2 = this.toRadians(b.lat);
    const deltaLat = this.toRadians(b.lat - a.lat);
    const deltaLng = this.toRadians(b.lng - a.lng);

    const haversine =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return Math.round(earthRadiusMeters * centralAngle);
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private cacheKey(start: CoordinatePoint, end: CoordinatePoint, profile: string): string {
    return [
      profile,
      start.lat.toFixed(6),
      start.lng.toFixed(6),
      end.lat.toFixed(6),
      end.lng.toFixed(6),
    ].join(':');
  }
}

export const routePlanningService = new RoutePlanningService();
