export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type MealName = "Pequeno-Almoço" | "Almoço" | "Lanche da Tarde" | "Jantar";

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
  mealType: MealName; // Tornando obrigatório para melhor tipagem
}

export interface Meal {
  id: string;
  name: string;
  plates: Plate[];
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  totalNutrition: NutritionalInfo;
}