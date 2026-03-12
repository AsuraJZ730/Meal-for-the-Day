import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, UserInputs } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const imageCache: Record<string, string> = {};

async function generateIllustration(dishName: string): Promise<string> {
  // 1. Check in-memory cache for current session
  if (imageCache[dishName]) return imageCache[dishName];

  // 2. Check LocalStorage for persistence across sessions
  try {
    const saved = localStorage.getItem(`dish_img_${dishName}`);
    if (saved) {
      imageCache[dishName] = saved;
      return saved;
    }
  } catch (e) {
    console.warn("LocalStorage access failed", e);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ text: `Minimalist cute food icon: "${dishName}". Simple shapes, flat colors, white background. No text.` }],
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = `data:image/png;base64,${part.inlineData.data}`;
        // Save to caches
        imageCache[dishName] = base64;
        try {
          localStorage.setItem(`dish_img_${dishName}`, base64);
        } catch (e) {
          // If storage is full, clear old ones or just ignore
          console.warn("Failed to save image to LocalStorage", e);
        }
        return base64;
      }
    }
  } catch (e) {
    console.error("Failed to generate illustration for", dishName, e);
  }
  return `https://picsum.photos/seed/${encodeURIComponent(dishName)}/800/600`;
}

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
            reason: { type: Type.STRING, description: "Why this recipe was recommended based on user inputs" }
          },
          required: ["name", "cuisine", "calories", "ingredients", "steps", "reason"]
        }
      }
    }
  });

  try {
    const recipesData = JSON.parse(response.text || "[]");
    // Return recipes with a placeholder image initially for speed
    return recipesData.map((r: any) => ({
      ...r,
      imageUrl: "" // Empty initially, will be fetched by the component
    }));
  } catch (e) {
    console.error("Failed to parse recipes", e);
    return [];
  }
}

export async function getRecipeImage(dishName: string): Promise<string> {
  return generateIllustration(dishName);
}
