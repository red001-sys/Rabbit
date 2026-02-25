export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  weight: number; // kg
  dailyCalorieGoal: number;
}

export interface NutrientInfo {
  calories: number;
  protein: number; // g
  carbs: number; // g
  sugar: number; // g
  fat: number; // g
  sodium: number; // mg
  fiber?: number; // g
}

export interface FoodEntry {
  id: string;
  name: string;
  quantity: string;
  nutrients: NutrientInfo;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface DailyLog {
  date: string;
  entries: FoodEntry[];
  totalNutrients: NutrientInfo;
}
