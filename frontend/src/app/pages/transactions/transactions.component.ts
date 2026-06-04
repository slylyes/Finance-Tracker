import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { Category } from '../../models/category.model';
import { Transaction, TransactionFilter, TransactionRequest, TransactionType } from '../../models/transaction.model';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { TransactionService } from '../../services/transaction.service';
import { extractErrorMessage } from '../../utils/error-utils';

@Component({
  selector: 'app-transactions',
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
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  isLoading = false;
  editingId: number | null = null;

  readonly displayedColumns = ['date', 'type', 'category', 'amount', 'description', 'actions'];
  readonly types: TransactionType[] = ['INCOME', 'EXPENSE'];

  transactionForm = this.fb.group({
    type: ['EXPENSE' as TransactionType, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    description: [''],
    categoryId: [null as number | null, Validators.required]
  });

  filterForm = this.fb.group({
    startDate: [null as Date | null],
    endDate: [null as Date | null],
    minAmount: [null as number | null],
    maxAmount: [null as number | null],
    categoryId: [null as number | null],
    type: [null as TransactionType | null],
    query: ['']
  });

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private transactionService: TransactionService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      categories: this.categoryService.getAll(),
      transactions: this.transactionService.search({})
    }).subscribe({
      next: ({ categories, transactions }) => {
        this.categories = categories;
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de charger les transactions.')
        );
      }
    });
  }

  applyFilters(): void {
    const filter = this.buildFilter();
    this.isLoading = true;
    this.transactionService.search(filter).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de filtrer les transactions.')
        );
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      categoryId: null,
      type: null,
      query: ''
    });
    this.applyFilters();
  }

  submitForm(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const request = this.buildRequest();
    if (!request) {
      return;
    }

    if (this.editingId) {
      this.transactionService.update(this.editingId, request).subscribe({
        next: () => {
          this.applyFilters();
          this.cancelEdit();
        },
        error: (error) => {
          this.notifications.showError(
            extractErrorMessage(error, 'Impossible de modifier la transaction.')
          );
        }
      });
      return;
    }

    this.transactionService.create(request).subscribe({
      next: () => {
        this.applyFilters();
        this.transactionForm.reset({
          type: 'EXPENSE',
          amount: null,
          date: new Date(),
          description: '',
          categoryId: null
        });
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de creer la transaction.')
        );
      }
    });
  }

  editTransaction(transaction: Transaction): void {
    this.editingId = transaction.id;
    this.transactionForm.patchValue({
      type: transaction.type,
      amount: transaction.amount,
      date: new Date(transaction.date),
      description: transaction.description ?? '',
      categoryId: transaction.categoryId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.transactionForm.reset({
      type: 'EXPENSE',
      amount: null,
      date: new Date(),
      description: '',
      categoryId: null
    });
  }

  deleteTransaction(transaction: Transaction): void {
    const confirmed = window.confirm('Supprimer cette transaction ?');
    if (!confirmed) {
      return;
    }
    this.transactionService.delete(transaction.id).subscribe({
      next: () => {
        this.applyFilters();
      },
      error: (error) => {
        this.notifications.showError(
          extractErrorMessage(error, 'Impossible de supprimer la transaction.')
        );
      }
    });
  }

  private buildRequest(): TransactionRequest | null {
    const value = this.transactionForm.value;
    const date = this.formatDate(value.date);
    if (!date || !value.type || !value.amount || !value.categoryId) {
      return null;
    }
    return {
      type: value.type,
      amount: value.amount,
      date,
      description: value.description?.trim() || null,
      categoryId: value.categoryId
    };
  }

  private buildFilter(): TransactionFilter {
    const value = this.filterForm.value;
    return {
      startDate: this.formatDate(value.startDate) || undefined,
      endDate: this.formatDate(value.endDate) || undefined,
      minAmount: value.minAmount ?? undefined,
      maxAmount: value.maxAmount ?? undefined,
      categoryId: value.categoryId ?? undefined,
      type: value.type ?? undefined,
      query: value.query?.trim() || undefined
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
