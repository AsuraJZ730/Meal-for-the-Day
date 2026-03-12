export interface Recipe {
  name: string;
  cuisine: string;
  calories: string;
  ingredients: string[];
  steps: string[];
  reason: string;
  imageUrl: string;
  emojis: string;
}

export interface UserInputs {
  taste: string;
  ingredients: string;
  calories: string;
  mood: string;
}
