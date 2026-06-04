import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Transaction,
  TransactionFilter,
  TransactionRequest
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly baseUrl = '/api/transactions';

  constructor(private http: HttpClient) {}

  search(filter: TransactionFilter): Observable<Transaction[]> {
    const params = this.buildParams(filter);
    return this.http.get<Transaction[]>(this.baseUrl, { params });
  }

  create(request: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, request);
  }

  update(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private buildParams(filter: TransactionFilter): HttpParams {
    let params = new HttpParams();
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate);
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate);
    }
    if (filter.minAmount !== undefined && filter.minAmount !== null) {
      params = params.set('minAmount', filter.minAmount);
    }
    if (filter.maxAmount !== undefined && filter.maxAmount !== null) {
      params = params.set('maxAmount', filter.maxAmount);
    }
    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId);
    }
    if (filter.type) {
      params = params.set('type', filter.type);
    }
    if (filter.query) {
      params = params.set('query', filter.query);
    }
    return params;
  }
}
