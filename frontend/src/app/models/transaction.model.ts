export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string | null;
  categoryId: number;
  categoryName: string;
}

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  date: string;
  description?: string | null;
  categoryId: number;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  categoryId?: number;
  type?: TransactionType;
  query?: string;
}
