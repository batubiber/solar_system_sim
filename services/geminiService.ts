import { GoogleGenAI, Type } from "@google/genai";
import { BodyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model constants
const MODEL_NAME = 'gemini-3-flash-preview';

export interface GeneratedPlanetData {
  name: string;
  mass: number;
  radius: number;
  color: string;
  distance: number;
  flavorText: string;
}

export const generatePlanetFromDescription = async (description: string): Promise<GeneratedPlanetData | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a fictional or realistic planet based on this description: "${description}". 
      Return JSON suitable for a solar system simulation.
      The output should include:
      - name: Creative name
      - mass: Relative to Earth (Earth = 1). Range 0.1 to 500.
      - radius: Relative to Earth (Earth = 1). Range 0.5 to 5.
      - color: Hex color code representing its surface.
      - distance: Distance from sun in arbitrary units (Earth is at 25, Jupiter at 60). Range 10 to 100.
      - flavorText: A short 1-sentence description.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            mass: { type: Type.NUMBER },
            radius: { type: Type.NUMBER },
            color: { type: Type.STRING },
            distance: { type: Type.NUMBER },
            flavorText: { type: Type.STRING },
          },
          required: ["name", "mass", "radius", "color", "distance", "flavorText"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeneratedPlanetData;

  } catch (error) {
    console.error("Gemini Planet Generation Error:", error);
    return null;
  }
};

export const askAstronomer = async (question: string, context: string): Promise<string> => {
  if (!process.env.API_KEY) return "I need an API key to answer that!";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Context: User is viewing a 3D solar system simulation.
      Current simulation state: ${context}
      
      User Question: "${question}"
      
      Answer briefly (max 2 sentences) and scientifically accurate but accessible.`,
    });
    return response.text || "The stars are silent today.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Communication interference detected.";
  }
};