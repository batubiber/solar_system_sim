export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export enum BodyType {
  Star = 'Star',
  Rocky = 'Rocky',
  GasGiant = 'Gas Giant',
  IceGiant = 'Ice Giant',
  EarthLike = 'Earth-like',
}

export interface BodyData {
  id: string;
  name: string;
  type: BodyType;
  color: string;
  radius: number; // Visual size relative to Earth
  mass: number;   // Physics mass relative to Earth
  position: Vector3;
  velocity: Vector3;
  texture?: string;
  description?: string;
}

export interface SimulationState {
  timeScale: number;
  paused: boolean;
  selectedBodyId: string | null;
}
