import { NutrientInfo } from '@/types';

export function calculateDailyCalories(
  gender: 'male' | 'female',
  age: number,
  height: number,
  weight: number
): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  // Sedentary activity level
  return Math.round(bmr * 1.4);
}

export function calculateDailyMacroGoals(calories: number) {
  return {
    protein: Math.round((calories * 0.25) / 4), // 25% from protein, 4cal/g
    carbs: Math.round((calories * 0.50) / 4),    // 50% from carbs, 4cal/g
    sugar: Math.round((calories * 0.10) / 4),    // 10% max from sugar
    fat: Math.round((calories * 0.25) / 9),      // 25% from fat, 9cal/g
    sodium: 2300, // mg recommended
  };
}

// Simple food database for manual entry
const FOOD_DB: Record<string, NutrientInfo> = {
  'arroz': { calories: 130, protein: 2.7, carbs: 28, sugar: 0.1, fat: 0.3, sodium: 1, fiber: 0.4 },
  'feijão': { calories: 77, protein: 5, carbs: 14, sugar: 0.3, fat: 0.5, sodium: 2, fiber: 5 },
  'frango': { calories: 165, protein: 31, carbs: 0, sugar: 0, fat: 3.6, sodium: 74, fiber: 0 },
  'peito de frango': { calories: 165, protein: 31, carbs: 0, sugar: 0, fat: 3.6, sodium: 74, fiber: 0 },
  'carne': { calories: 250, protein: 26, carbs: 0, sugar: 0, fat: 15, sodium: 72, fiber: 0 },
  'carne moída': { calories: 250, protein: 26, carbs: 0, sugar: 0, fat: 15, sodium: 72, fiber: 0 },
  'ovo': { calories: 155, protein: 13, carbs: 1.1, sugar: 1.1, fat: 11, sodium: 124, fiber: 0 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, sugar: 12, fat: 0.3, sodium: 1, fiber: 2.6 },
  'maçã': { calories: 52, protein: 0.3, carbs: 14, sugar: 10, fat: 0.2, sodium: 1, fiber: 2.4 },
  'pão': { calories: 265, protein: 9, carbs: 49, sugar: 5, fat: 3.2, sodium: 491, fiber: 2.7 },
  'pão francês': { calories: 265, protein: 9, carbs: 49, sugar: 5, fat: 3.2, sodium: 491, fiber: 2.7 },
  'leite': { calories: 42, protein: 3.4, carbs: 5, sugar: 5, fat: 1, sodium: 44, fiber: 0 },
  'queijo': { calories: 350, protein: 25, carbs: 1.3, sugar: 0.5, fat: 27, sodium: 621, fiber: 0 },
  'batata': { calories: 77, protein: 2, carbs: 17, sugar: 0.8, fat: 0.1, sodium: 6, fiber: 2.2 },
  'macarrão': { calories: 131, protein: 5, carbs: 25, sugar: 0.6, fat: 1.1, sodium: 1, fiber: 1.8 },
  'salada': { calories: 15, protein: 1.3, carbs: 2.9, sugar: 1.3, fat: 0.2, sodium: 28, fiber: 1.3 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, sugar: 2.6, fat: 0.2, sodium: 5, fiber: 1.2 },
  'abacate': { calories: 160, protein: 2, carbs: 9, sugar: 0.7, fat: 15, sodium: 7, fiber: 7 },
  'iogurte': { calories: 59, protein: 10, carbs: 3.6, sugar: 3.2, fat: 0.4, sodium: 36, fiber: 0 },
  'suco de laranja': { calories: 45, protein: 0.7, carbs: 10, sugar: 8.4, fat: 0.2, sodium: 1, fiber: 0.2 },
  'café': { calories: 2, protein: 0.3, carbs: 0, sugar: 0, fat: 0, sodium: 2, fiber: 0 },
  'chocolate': { calories: 546, protein: 5, carbs: 60, sugar: 48, fat: 31, sodium: 24, fiber: 7 },
  'pizza': { calories: 266, protein: 11, carbs: 33, sugar: 3.6, fat: 10, sodium: 598, fiber: 2.3 },
  'hambúrguer': { calories: 295, protein: 17, carbs: 24, sugar: 5, fat: 14, sodium: 562, fiber: 1.3 },
  'salmão': { calories: 208, protein: 20, carbs: 0, sugar: 0, fat: 13, sodium: 59, fiber: 0 },
  'atum': { calories: 132, protein: 28, carbs: 0, sugar: 0, fat: 1.3, sodium: 47, fiber: 0 },
};

export function parseFoodInput(input: string): { name: string; grams: number } | null {
  const text = input.toLowerCase().trim();
  
  // Try to extract grams: "100g de arroz", "200 gramas de frango", "arroz 150g"
  const patterns = [
    /(\d+)\s*(?:g|gramas?)\s+(?:de\s+)?(.+)/,
    /(.+?)\s+(\d+)\s*(?:g|gramas?)/,
    /(\d+)\s*(?:g|gramas?)\s*(.+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const isFirstPattern = pattern === patterns[0] || pattern === patterns[2];
      const grams = parseInt(isFirstPattern ? match[1] : match[2]);
      const name = (isFirstPattern ? match[2] : match[1]).trim();
      if (grams > 0 && grams <= 5000 && name.length > 0) {
        return { name, grams };
      }
    }
  }

  // No grams specified, assume 100g
  if (text.length > 0) {
    return { name: text, grams: 100 };
  }
  
  return null;
}

export function lookupFood(name: string, grams: number): NutrientInfo | null {
  const key = Object.keys(FOOD_DB).find(k => name.includes(k) || k.includes(name));
  if (!key) return null;
  
  const base = FOOD_DB[key];
  const factor = grams / 100;
  
  return {
    calories: Math.round(base.calories * factor),
    protein: Math.round(base.protein * factor * 10) / 10,
    carbs: Math.round(base.carbs * factor * 10) / 10,
    sugar: Math.round(base.sugar * factor * 10) / 10,
    fat: Math.round(base.fat * factor * 10) / 10,
    sodium: Math.round(base.sodium * factor),
    fiber: base.fiber ? Math.round(base.fiber * factor * 10) / 10 : 0,
  };
}

export function getAvailableFoods(): string[] {
  return Object.keys(FOOD_DB);
}
