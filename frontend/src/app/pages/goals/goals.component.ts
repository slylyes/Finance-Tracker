import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { Goal } from '../../models/goal.model';
import { GoalService } from '../../services/goal.service';
import { NotificationService } from '../../services/notification.service';
import { extractErrorMessage } from '../../utils/error-utils';

@Component({
  selector: 'app-goals',
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
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  editingId: number | null = null;

  goalForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    startDate: [new Date(), Validators.required],
    endDate: [null as Date | null]
  });

  constructor(
    private fb: FormBuilder,
    private goalService: GoalService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.goalService.getAll().subscribe({
      next: (goals) => {
        this.goals = goals;
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de charger les objectifs.')
        );
      }
    });
  }

  submitForm(): void {
    if (this.goalForm.invalid) {
      this.goalForm.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    if (!request) {
      return;
    }

    if (this.editingId) {
      this.goalService.update(this.editingId, request).subscribe({
        next: () => {
          this.loadGoals();
          this.cancelEdit();
        },
        error: (error) => {
          this.notifications.showError(
            extractErrorMessage(error, 'Impossible de modifier l\'objectif.')
          );
        }
      });
      return;
    }

    this.goalService.create(request).subscribe({
      next: () => {
        this.loadGoals();
        this.goalForm.reset({
          name: '',
          targetAmount: null,
          startDate: new Date(),
          endDate: null
        });
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de creer l\'objectif.')
        );
      }
    });
  }

  editGoal(goal: Goal): void {
    this.editingId = goal.id;
    this.goalForm.patchValue({
      name: goal.name,
      targetAmount: goal.targetAmount,
      startDate: new Date(goal.startDate),
      endDate: goal.endDate ? new Date(goal.endDate) : null
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.goalForm.reset({
      name: '',
      targetAmount: null,
      startDate: new Date(),
      endDate: null
    });
  }

  deleteGoal(goal: Goal): void {
    const confirmed = window.confirm('Supprimer cet objectif ?');
    if (!confirmed) {
      return;
    }
    this.goalService.delete(goal.id).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de supprimer l\'objectif.')
        );
      }
    });
  }

  private buildRequest() {
    const value = this.goalForm.value;
    const startDate = this.formatDate(value.startDate);
    if (!startDate || !value.name || !value.targetAmount) {
      return null;
    }

    return {
      name: value.name.trim(),
      targetAmount: value.targetAmount,
      startDate,
      endDate: this.formatDate(value.endDate) || null
    };
  }

  private formatDate(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
