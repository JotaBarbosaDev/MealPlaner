export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  baseAmount: number;
  unit: string;
  nutritionalInfo: NutritionalInfo;
}

export interface PlateItem {
  productId: string;
  amount: number;
}

export interface Plate {
  id: string;
  name: string;
  items: PlateItem[];
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  plates: Plate[];
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalNutrition: NutritionalInfo;
}