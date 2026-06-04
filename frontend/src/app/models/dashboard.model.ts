export interface DashboardOverview {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

export interface MonthlyTotal {
  month: number;
  totalExpense: number;
}

export interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  totalExpense: number;
}
