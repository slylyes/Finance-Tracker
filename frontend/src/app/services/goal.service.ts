import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Goal, GoalRequest } from '../models/goal.model';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private readonly baseUrl = '/api/goals';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.baseUrl);
  }

  create(request: GoalRequest): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, request);
  }

  update(id: number, request: GoalRequest): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
