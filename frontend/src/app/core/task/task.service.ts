import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Task, Category, TasksFilters, TasksResponse } from '../models/task.models';

const API_URL = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

  private _categories = signal<Category[]>([]);
  categories = this._categories.asReadonly();

  private _loading = signal(false);
  loading = this._loading.asReadonly();

  getTasks(filters: TasksFilters): Observable<TasksResponse> {
    this._loading.set(true);
    
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category_id?.length) params = params.set('category_id', filters.category_id.join(','));
    if (filters.priority?.length) params = params.set('priority', filters.priority.join(','));
    if (filters.completed !== undefined && filters.completed !== null) {
      params = params.set('completed', filters.completed.toString());
    }
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.per_page) params = params.set('per_page', filters.per_page.toString());

    return this.http.get<TasksResponse>(`${API_URL}/tasks`, { params }).pipe(
      tap(() => this._loading.set(false))
    );
  }

  getCategories(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(`${API_URL}/categories`).pipe(
      tap(response => this._categories.set(response.data))
    );
  }

  createTask(data: Partial<Task>): Observable<{ data: Task }> {
    return this.http.post<{ data: Task }>(`${API_URL}/tasks`, data);
  }

  updateTask(id: number, data: Partial<Task>): Observable<{ data: Task }> {
    return this.http.put<{ data: Task }>(`${API_URL}/tasks/${id}`, data);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tasks/${id}`);
  }

  toggleComplete(id: number): Observable<{ data: Task }> {
    return this.http.patch<{ data: Task }>(`${API_URL}/tasks/${id}/toggle-complete`, {});
  }

  // Category CRUD
  createCategory(data: Partial<Category>): Observable<{ data: Category }> {
    return this.http.post<{ data: Category }>(`${API_URL}/categories`, data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<{ data: Category }> {
    return this.http.put<{ data: Category }>(`${API_URL}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/categories/${id}`);
  }

  getTaskCountByCategory(categoryId: number): number {
    // This would need the tasks list to compute - for now return 0
    // TODO: implement with tasks list
    return 0;
  }
}