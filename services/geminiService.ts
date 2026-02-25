
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMovieInsights = async (movieTitle: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Proporciona una descripción breve y fascinante (máximo 3 párrafos) de la película "${movieTitle}". Incluye género, año aproximado y por qué es conocida. Responde en Español.`,
    });
    return response.text || "No se pudo obtener información de la IA.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con el cerebro de la IA.";
  }
};

export const getSmartSuggestions = async (query: string): Promise<string[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `El usuario buscó la película "${query}" pero no se encontró en su base de datos local. Sugiere 3 películas similares o populares que podrían interesarle. Devuelve solo los nombres de las películas separados por comas.`,
    });
    const text = response.text || "";
    return text.split(',').map(s => s.trim());
  } catch (error) {
    return [];
  }
};
