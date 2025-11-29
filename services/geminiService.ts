import { GoogleGenAI, Type } from "@google/genai";
import { DisasterResponse, SensorData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an advanced Real-Time Disaster Evacuation & Risk Guidance System. Your job is to analyze dynamic environmental data and provide the safest possible evacuation path, risk levels, and alerts.

Your responsibilities:
1. Read and analyze incoming data: weather, fire alerts, flood levels, map routes, GPS coordinates, and population density.
2. Predict real-time danger probability (0–100 risk score).
3. Generate safe evacuation routes with step-by-step guidance.
4. Provide dynamic voice-style alerts for emergency conditions.
5. Detect crowd density and avoid congested routes.
6. Identify and recommend nearest safe zones.
7. Trigger SOS message suggestions if risk is extremely high.

Always respond in structured JSON. Never guess—always reason based on data provided.
If exact location data is missing, infer general safe strategies based on the environmental conditions described.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    risk_level: { type: Type.NUMBER, description: "0-100 risk score" },
    danger_type: { type: Type.STRING, enum: ["flood", "fire", "landslide", "cyclone", "earthquake", "unknown"] },
    risk_description: { type: Type.STRING },
    safe_zones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          distance_km: { type: Type.NUMBER },
          eta_min: { type: Type.NUMBER },
        },
        required: ["name", "distance_km", "eta_min"],
      },
    },
    recommended_route: {
      type: Type.OBJECT,
      properties: {
        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
        total_distance_km: { type: Type.NUMBER },
        eta_min: { type: Type.NUMBER },
      },
      required: ["steps", "total_distance_km", "eta_min"],
    },
    crowd_density: { type: Type.STRING, enum: ["low", "medium", "high"] },
    alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
    sos_recommendation: { type: Type.STRING, enum: ["yes", "no"] },
  },
  required: [
    "risk_level",
    "danger_type",
    "risk_description",
    "safe_zones",
    "recommended_route",
    "crowd_density",
    "alerts",
    "sos_recommendation",
  ],
};

export const analyzeSituation = async (data: SensorData): Promise<DisasterResponse> => {
  try {
    const prompt = `
    CURRENT SENSOR TELEMETRY:
    - GPS Location: ${data.latitude ? `${data.latitude}, ${data.longitude}` : "Signal Lost / Unknown"}
    - Temperature: ${data.temperature}°C
    - Wind Speed: ${data.windSpeed} km/h
    - Water Level: ${data.waterLevel} meters (Normal: < 1m)
    - Seismic Activity (Richter): ${data.seismicActivity}
    - Air Quality Index (AQI): ${data.airQualityIndex}
    - Precipitation Rate: ${data.precipitation} mm/h

    Analyze this telemetry immediately. Identify threats. Calculate risk. Provide evacuation protocols.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DisasterResponse;
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Analysis Failed:", error);
    // Fallback safe state
    return {
      risk_level: 0,
      danger_type: "unknown",
      risk_description: "System error. Unable to process telemetry.",
      safe_zones: [],
      recommended_route: { steps: [], total_distance_km: 0, eta_min: 0 },
      crowd_density: "low",
      alerts: ["SYSTEM MALFUNCTION - SEEK SHELTER"],
      sos_recommendation: "no",
    };
  }
};