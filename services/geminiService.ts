import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMenuDescription = async (itemName: string, ingredients: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Delicious and fresh.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, mouth-watering, punchy description (max 20 words) for a menu item named "${itemName}" containing "${ingredients}". The tone should be appetizing but sleek.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `A tasty ${itemName} prepared with fresh ingredients.`;
  }
};

export const getFoodRecommendation = async (query: string, menuContext: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I recommend trying our specials!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a food concierge for Axle Delivery.
      Context Menu: ${menuContext}
      User Query: "${query}"
      
      Recommend 1-2 specific items from the menu context above that match the user's mood or query. Keep it brief and helpful.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the AI chef right now.";
  }
};