export interface Ingredient {
  isim: string;
  miktar: number;
  birim: string;
}

export interface RecipeDurations {
  prep: number;
  cook: number;
  total: number;
}

export interface Recipe {
  title: string;
  servings: number;
  userId: number;
  durations: RecipeDurations;
  ingredients: Ingredient[];
  steps: string[];
  photo?: string;
}
