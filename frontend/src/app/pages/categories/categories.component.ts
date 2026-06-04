import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { extractErrorMessage } from '../../utils/error-utils';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  editingId: number | null = null;

  readonly displayedColumns = ['name', 'actions'];

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de charger les categories.')
        );
      }
    });
  }

  submitForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const name = this.categoryForm.value.name?.trim();
    if (!name) {
      return;
    }

    if (this.editingId) {
      this.categoryService.update(this.editingId, { name }).subscribe({
        next: () => {
          this.loadCategories();
          this.cancelEdit();
        },
        error: (error) => {
          this.notifications.showError(
            extractErrorMessage(error, 'Impossible de modifier la categorie.')
          );
        }
      });
      return;
    }

    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.loadCategories();
        this.categoryForm.reset({ name: '' });
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de creer la categorie.')
        );
      }
    });
  }

  editCategory(category: Category): void {
    this.editingId = category.id;
    this.categoryForm.patchValue({ name: category.name });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.categoryForm.reset({ name: '' });
  }

  deleteCategory(category: Category): void {
    const confirmed = window.confirm('Supprimer cette categorie ?');
    if (!confirmed) {
      return;
    }
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de supprimer la categorie.')
        );
      }
    });
  }
}
