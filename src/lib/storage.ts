import { UserProfile, FoodEntry, NutrientInfo } from '@/types';

const KEYS = {
  PROFILE: 'calorie_app_profile',
  ENTRIES: 'calorie_app_entries',
  AD_COUNT: 'calorie_app_ad_count',
  PREMIUM: 'calorie_app_premium',
};

export function getProfile(): UserProfile | null {
  const data = localStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getEntries(): FoodEntry[] {
  const data = localStorage.getItem(KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
}

export function saveEntry(entry: FoodEntry) {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

export function deleteEntry(id: string) {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

export function getTodayEntries(): FoodEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getEntries().filter(e => e.date === today);
}

export function getTodayTotals(): NutrientInfo {
  const entries = getTodayEntries();
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.nutrients.calories,
      protein: acc.protein + e.nutrients.protein,
      carbs: acc.carbs + e.nutrients.carbs,
      sugar: acc.sugar + e.nutrients.sugar,
      fat: acc.fat + e.nutrients.fat,
      sodium: acc.sodium + e.nutrients.sodium,
      fiber: (acc.fiber || 0) + (e.nutrients.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, sodium: 0, fiber: 0 }
  );
}

export function getEntriesForWeek(): FoodEntry[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getEntries().filter(e => new Date(e.date) >= weekAgo);
}

export function getAdCount(): number {
  return parseInt(localStorage.getItem(KEYS.AD_COUNT) || '0');
}

export function incrementAdCount(): number {
  const count = getAdCount() + 1;
  localStorage.setItem(KEYS.AD_COUNT, count.toString());
  return count;
}

export function resetAdCount() {
  localStorage.setItem(KEYS.AD_COUNT, '0');
}

export function isPremium(): boolean {
  return localStorage.getItem(KEYS.PREMIUM) === 'true';
}

export function setPremium(value: boolean) {
  localStorage.setItem(KEYS.PREMIUM, value.toString());
}
