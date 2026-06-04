export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  startDate: string;
  endDate?: string | null;
  currentAmount: number;
  progressPercent: number;
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  startDate: string;
  endDate?: string | null;
}
