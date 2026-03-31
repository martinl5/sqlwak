export interface Bird {
  id: number;
  species: string;
  name: string;
  age: number;
  wingspan: number;
  color: string;
}

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  region: string;
}

export interface WeatherPattern {
  id: number;
  pattern_name: string;
  intensity: number;
  temperature: number;
  wind_speed: number;
}

export interface FlightLog {
  id: number;
  bird_id: number;
  location_id: number;
  timestamp: string;
  distance: number;
  duration: number;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  hint: string;
  seedQuery: string;
  solutionQuery: string;
  epoch: 'Foundational' | 'Intermediate' | 'Advanced' | 'Expert';
  difficulty: number;
}

export interface QueryResult {
  columns: string[];
  values: unknown[][];
  rowCount?: number;
}

export interface Boid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number;
  species: string;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
}
