export interface SafeZone {
  name: string;
  distance_km: number;
  eta_min: number;
}

export interface RecommendedRoute {
  steps: string[];
  total_distance_km: number;
  eta_min: number;
}

export interface DisasterResponse {
  risk_level: number; // 0-100
  danger_type: "flood" | "fire" | "landslide" | "cyclone" | "earthquake" | "unknown";
  risk_description: string;
  safe_zones: SafeZone[];
  recommended_route: RecommendedRoute;
  crowd_density: "low" | "medium" | "high";
  alerts: string[];
  sos_recommendation: "yes" | "no";
}

export interface SensorData {
  temperature: number;
  windSpeed: number;
  waterLevel: number;
  seismicActivity: number;
  airQualityIndex: number;
  precipitation: number;
  latitude?: number;
  longitude?: number;
}

export enum SimulationPreset {
  CLEAR = "CLEAR",
  WILDFIRE = "WILDFIRE",
  FLOOD = "FLOOD",
  EARTHQUAKE = "EARTHQUAKE"
}