
import { GoogleGenAI, Type } from "@google/genai";
import { AutoCaptionResponse } from "../types";

export const transcribeVideo = async (base64Media: string, mimeType: string): Promise<AutoCaptionResponse> => {
  // Always create a new instance right before the call as per requirements
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Media,
          mimeType: mimeType
        }
      },
      {
        text: "Analyze this media and extract captions with precise start and end times in seconds. Also translate them to poetic Arabic. Return ONLY a JSON object with a 'captions' array containing 'startTime', 'endTime', 'text', and 'translation'."
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          captions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                startTime: { type: Type.NUMBER },
                endTime: { type: Type.NUMBER },
                text: { type: Type.STRING },
                translation: { type: Type.STRING }
              },
              required: ["startTime", "endTime", "text", "translation"]
            }
          }
        },
        required: ["captions"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text.trim()) as AutoCaptionResponse;
  } catch (error) {
    console.error("Transcription failed:", error);
    throw new Error("Failed to extract captions");
  }
};
