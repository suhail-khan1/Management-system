import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Ingestion {
  _id?: string;
  sourceType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class IngestionService {
  private baseUrl = `${environment.apiBaseUrl}/ingestions`;

  constructor(private http: HttpClient) {}

  getIngestions(): Observable<Ingestion[]> {
    return this.http.get<Ingestion[]>(this.baseUrl);
  }

  getIngestion(id: string): Observable<Ingestion> {
    return this.http.get<Ingestion>(`${this.baseUrl}/${id}`);
  }

  createIngestion(ingestion: Ingestion): Observable<Ingestion> {
    return this.http.post<Ingestion>(this.baseUrl, ingestion);
  }

  updateIngestion(ingestion: Ingestion): Observable<Ingestion> {
    return this.http.put<Ingestion>(`${this.baseUrl}/${ingestion._id}`, ingestion);
  }

  deleteIngestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}