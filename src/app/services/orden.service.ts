import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Orden, DetalleOrden } from '../models/orden.model';
import { ApiResponse } from '../models/cliente.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  constructor(private apiService: ApiService) {}

  // Órdenes
  getOrdenes(): Observable<ApiResponse<Orden[]>> {
    return this.apiService.get<Orden[]>('/ordenes');
  }

  getOrdenById(id: string): Observable<ApiResponse<Orden>> {
    return this.apiService.get<Orden>(`/ordenes/${id}`);
  }

  crearOrden(orden: Omit<Orden, 'ordenId'>): Observable<ApiResponse<Orden>> {
    const ordenConId = {
      ordenId: `ORD-${Date.now()}`,
      ...orden
    };
    return this.apiService.post<Orden>('/ordenes', ordenConId);
  }

  actualizarOrden(id: string, orden: Orden): Observable<ApiResponse<Orden>> {
    return this.apiService.put<Orden>(`/ordenes/${id}`, orden);
  }

  eliminarOrden(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete(`/ordenes/${id}`);
  }

  // Detalles de Órdenes
  getDetallesPorOrden(ordenId: string): Observable<ApiResponse<DetalleOrden[]>> {
    return this.apiService.get<DetalleOrden[]>(`/ordenes/${ordenId}/detalles`);
  }

  getTodosDetalles(): Observable<ApiResponse<DetalleOrden[]>> {
    return this.apiService.get<DetalleOrden[]>('/detalles');
  }

  agregarProductoAOrden(ordenId: string, productoId: string, cantidad: number): Observable<ApiResponse<DetalleOrden>> {
    return this.apiService.post<DetalleOrden>(
      `/ordenes/${ordenId}/productos/${productoId}`,
      { cantidad }
    );
  }

  actualizarCantidadDetalle(detalleId: string, cantidad: number): Observable<ApiResponse<DetalleOrden>> {
    return this.apiService.put<DetalleOrden>(`/detalles/${detalleId}`, { cantidad });
  }

  removerProductoDeOrden(detalleId: string): Observable<ApiResponse<void>> {
    return this.apiService.delete(`/detalles/${detalleId}`);
  }
}
