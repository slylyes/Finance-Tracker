import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { DashboardService } from '../../services/dashboard.service';
import { GoalService } from '../../services/goal.service';
import { NotificationService } from '../../services/notification.service';
import { CategoryTotal, DashboardOverview, MonthlyTotal } from '../../models/dashboard.model';
import { Goal } from '../../models/goal.model';
import { extractErrorMessage } from '../../utils/error-utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild('monthlyChart') monthlyChart?: ElementRef<HTMLDivElement>;

  overview?: DashboardOverview;
  monthlyTotals: MonthlyTotal[] = [];
  categoryTotals: CategoryTotal[] = [];
  goals: Goal[] = [];
  isLoading = false;
  tooltip?: { x: number; y: number; label: string; value: number };

  rangeForm = this.fb.group({
    startDate: [this.startOfMonth(new Date())],
    endDate: [new Date()]
  });

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private goalService: GoalService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const startDate = this.formatDate(this.rangeForm.value.startDate);
    const endDate = this.formatDate(this.rangeForm.value.endDate);

    this.isLoading = true;
    forkJoin({
      overview: this.dashboardService.getOverview(startDate, endDate),
      monthly: this.dashboardService.getMonthlyExpenses(new Date().getFullYear()),
      categories: this.dashboardService.getExpensesByCategory(startDate, endDate),
      goals: this.goalService.getAll()
    }).subscribe({
      next: ({ overview, monthly, categories, goals }) => {
        this.overview = overview;
        this.monthlyTotals = monthly;
        this.categoryTotals = categories;
        this.goals = goals;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de charger le tableau de bord.')
        );
      }
    });
  }

  get monthlyLinePoints(): string {
    const points = this.buildMonthlyChartPoints();
    return points.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get monthlyLineDots(): Array<{ x: number; y: number; value: number; label: string }> {
    const points = this.buildMonthlyChartPoints();
    return points.map((point) => ({
      x: point.x,
      y: point.y,
      value: point.value,
      label: this.monthLabel(point.month)
    }));
  }

  get monthlyLabels(): string[] {
    return this.monthlyTotals.map((item) => this.monthLabel(item.month));
  }

  get categoryBars(): Array<CategoryTotal & { percent: number }> {
    const max = Math.max(...this.categoryTotals.map((item) => item.totalExpense || 0), 0);
    return this.categoryTotals.map((item) => ({
      ...item,
      percent: max ? (item.totalExpense / max) * 100 : 0
    }));
  }

  private monthLabel(month: number): string {
    const date = new Date(new Date().getFullYear(), month - 1, 1);
    return new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date);
  }

  showTooltip(dot: { x: number; y: number; value: number; label: string }, event: MouseEvent): void {
    const position = this.resolveTooltipPosition(event);
    this.tooltip = { ...dot, ...position };
  }

  updateTooltipPosition(event: MouseEvent): void {
    if (!this.tooltip) {
      return;
    }
    const position = this.resolveTooltipPosition(event);
    this.tooltip = { ...this.tooltip, ...position };
  }

  clearTooltip(): void {
    this.tooltip = undefined;
  }

  private buildMonthlyChartPoints(): Array<{ x: number; y: number; value: number; month: number }> {
    const width = 600;
    const height = 220;
    const padding = 28;
    const max = Math.max(...this.monthlyTotals.map((item) => item.totalExpense || 0), 0);
    const step = this.monthlyTotals.length > 1
      ? (width - padding * 2) / (this.monthlyTotals.length - 1)
      : 0;

    return this.monthlyTotals.map((item, index) => {
      const x = padding + step * index;
      const ratio = max ? item.totalExpense / max : 0;
      const y = height - padding - ratio * (height - padding * 2);
      return { x, y, value: item.totalExpense, month: item.month };
    });
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private formatDate(value: Date | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveTooltipPosition(event: MouseEvent): { x: number; y: number } {
    if (!this.monthlyChart) {
      return { x: event.offsetX, y: event.offsetY };
    }
    const rect = this.monthlyChart.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}
