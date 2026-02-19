import { BodyData, BodyType } from './types';

// Gravitational Constant (Tweaked for visualization stability with new masses)
export const G = 0.01;

// Simulation Scale Constants
export const SUN_MASS = 5000;

// Helper to calculate circular orbit velocity: v = sqrt(GM / r)
const getOrbitalVelocity = (r: number) => {
  return Math.sqrt((G * SUN_MASS) / r);
};

export const INITIAL_BODIES: BodyData[] = [
  {
    id: 'sun',
    name: 'Sun',
    type: BodyType.Star,
    color: '#FDB813',
    radius: 12, // Visual scale only, not physical
    mass: SUN_MASS,
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    description: "The G-type main-sequence star at the center of our system.",
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: BodyType.Rocky,
    color: '#A5A5A5',
    radius: 0.8,
    mass: 0.055,
    position: { x: 25, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(25) },
    description: "The smallest planet, scorched by the Sun and cratered like the Moon.",
  },
  {
    id: 'venus',
    name: 'Venus',
    type: BodyType.Rocky,
    color: '#E3BB76',
    radius: 1.8,
    mass: 0.815,
    position: { x: 40, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(40) },
    description: "A toxic world with a thick atmosphere and runaway greenhouse effect.",
  },
  {
    id: 'earth',
    name: 'Earth',
    type: BodyType.EarthLike,
    color: '#22A6B3',
    radius: 2,
    mass: 1,
    position: { x: 60, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(60) },
    description: "Our home. The only known celestial body to support life.",
  },
  {
    id: 'mars',
    name: 'Mars',
    type: BodyType.Rocky,
    color: '#E05030',
    radius: 1.2,
    mass: 0.107,
    position: { x: 85, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(85) },
    description: "The Red Planet. Dusty, cold, and home to the largest volcano in the system.",
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: BodyType.GasGiant,
    color: '#D4A86A',
    radius: 7,
    mass: 317.8,
    position: { x: 160, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(160) },
    description: "The King of Planets. A massive gas giant with a Great Red Spot.",
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: BodyType.GasGiant,
    color: '#E8D8A8',
    radius: 6,
    mass: 95.2,
    position: { x: 240, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(240) },
    description: "Famous for its spectacular ring system, composed mostly of ice particles.",
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: BodyType.IceGiant,
    color: '#83D6DE',
    radius: 4,
    mass: 14.5,
    position: { x: 320, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(320) },
    description: "An ice giant that rotates on its side, likely due to a massive ancient collision.",
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: BodyType.IceGiant,
    color: '#4B70DD',
    radius: 3.9,
    mass: 17.1,
    position: { x: 400, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: getOrbitalVelocity(400) },
    description: "The windiest planet, a deep blue ice giant far from the Sun.",
  },
];

export const MAX_TRAIL_LENGTH = 300;