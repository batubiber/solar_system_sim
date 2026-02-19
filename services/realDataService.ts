import * as AstronomyModule from "astronomy-engine";
import { BodyData } from "../types";
import { INITIAL_BODIES, G, SUN_MASS } from "../constants";

export const getRealPlanetaryData = (): BodyData[] => {
  const date = new Date();

  // Robustly extract the library object from the import
  // esm.sh/CommonJS interop can result in nested defaults
  let Lib: any = AstronomyModule;
  if (Lib.default) Lib = Lib.default;
  if (Lib.default) Lib = Lib.default; // Double unwrap just in case

  const { Body, HeliocentricCoordinates } = Lib;
  
  // If we still don't have Body, return initial data to prevent crash
  if (!Body) {
    console.warn("Could not load Astronomy Engine data. Using defaults.", AstronomyModule);
    return INITIAL_BODIES;
  }

  return INITIAL_BODIES.map(body => {
    // Skip the Sun or non-mapped bodies
    if (body.id === 'sun') return body;

    let astroBody;
    try {
      switch (body.id) {
        case 'mercury': astroBody = Body.Mercury; break;
        case 'venus': astroBody = Body.Venus; break;
        case 'earth': astroBody = Body.Earth; break;
        case 'mars': astroBody = Body.Mars; break;
        case 'jupiter': astroBody = Body.Jupiter; break;
        case 'saturn': astroBody = Body.Saturn; break;
        case 'uranus': astroBody = Body.Uranus; break;
        case 'neptune': astroBody = Body.Neptune; break;
        default: return body;
      }
    } catch (e) {
      console.warn(`Error mapping body ${body.id}`, e);
      return body;
    }
    
    // If no mapping found in astronomy engine
    if (!astroBody) return body;

    try {
      // Get real heliocentric coordinates (in AU)
      const coords = HeliocentricCoordinates(astroBody, date);
      
      // Calculate the heliocentric longitude (angle in the ecliptic plane)
      const angle = Math.atan2(coords.y, coords.x);
      
      // Determine the simulation distance.
      // We preserve the simplified distances from constants.ts to keep the visualization 
      // user-friendly (otherwise outer planets are too far away to see).
      // We assume the initial defined position.x is the orbital radius.
      const simDistance = Math.sqrt(body.position.x ** 2 + body.position.z ** 2);
      
      // Map the real angle to the simulation X-Z plane (Sim Y is up)
      const newX = simDistance * Math.cos(angle);
      const newZ = simDistance * Math.sin(angle);
      
      // Calculate circular orbital velocity magnitude for stability: v = sqrt(GM/r)
      const vMag = Math.sqrt((G * SUN_MASS) / simDistance);
      
      // Velocity vector tangent to the orbit
      // Tangent to circle at angle theta is (-sin(theta), cos(theta))
      const vX = -vMag * Math.sin(angle);
      const vZ = vMag * Math.cos(angle);
      
      return {
        ...body,
        position: { x: newX, y: 0, z: newZ },
        velocity: { x: vX, y: 0, z: vZ }
      };
    } catch (err) {
      console.error("Error calculating orbit for", body.name, err);
      return body;
    }
  });
};