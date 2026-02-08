import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  get<T>(endpoint: string): Observable<any> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post<T>(endpoint: string, data: any): Observable<any> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  put<T>(endpoint: string, data: any): Observable<any> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}
