import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
import { ApiResponse } from '../models/cliente.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  constructor(private apiService: ApiService) {}

  getProductos(): Observable<ApiResponse<Producto[]>> {
    return this.apiService.get<Producto[]>('/productos');
  }

  getProductoById(id: string): Observable<ApiResponse<Producto>> {
    return this.apiService.get<Producto>(`/productos/${id}`);
  }

  crearProducto(producto: Omit<Producto, 'productoId'>): Observable<ApiResponse<Producto>> {
    const productoConId = {
      productoId: `PROD-${Date.now()}`,
      ...producto
    };
    return this.apiService.post<Producto>('/productos', productoConId);
  }

  actualizarProducto(id: string, producto: Producto): Observable<ApiResponse<Producto>> {
    return this.apiService.put<Producto>(`/productos/${id}`, producto);
  }

  eliminarProducto(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete(`/productos/${id}`);
  }
}
