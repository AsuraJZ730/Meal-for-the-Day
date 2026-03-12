import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserInputs } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateRecipes(inputs: UserInputs): Promise<Recipe[]> {
  const prompt = `
    Based on the following user preferences, recommend EXACTLY 3 recipes.
    Taste: ${inputs.taste || "Any"}
    Ingredients: ${inputs.ingredients || "Any"}
    Calories: ${inputs.calories || "Any"}
    Mood: ${inputs.mood || "Any"}
 
    Requirements:
    - Recommend EXACTLY 3 recipes.
    - Approximately 70% should be Chinese cuisine, 30% other international cuisines.
    - Provide a detailed reason for each recommendation based on the inputs.
    - Include simple cooking steps.
    - For each recipe, provide 1-3 relevant food/ingredient emojis that represent the dish (e.g., "🍅 🥚" for Tomato Scrambled Eggs).
    - The response must be in Chinese.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            cuisine: { type: Type.STRING, description: "e.g. 中餐, 意大利菜, etc." },
            calories: { type: Type.STRING, description: "e.g. 约350 kcal" },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            reason: { type: Type.STRING, description: "Why this recipe was recommended based on user inputs" },
            emojis: { type: Type.STRING, description: "1-3 relevant food emojis" }
          },
          required: ["name", "cuisine", "calories", "ingredients", "steps", "reason", "emojis"]
        }
      }
    }
  });

  try {
    const recipesData = JSON.parse(response.text || "[]");
    return recipesData.map((r: any) => ({
      ...r,
      imageUrl: "" // No longer used but kept for type compatibility
    }));
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
}
