import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ApiResponse } from '../models/cliente.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private apiService: ApiService) {}

  getClientes(): Observable<ApiResponse<Cliente[]>> {
    return this.apiService.get<Cliente[]>('/clientes');
  }

  getClienteById(id: string): Observable<ApiResponse<Cliente>> {
    return this.apiService.get<Cliente>(`/clientes/${id}`);
  }

  crearCliente(cliente: Omit<Cliente, 'clienteId'>): Observable<ApiResponse<Cliente>> {
    const clienteConId = {
      clienteId: `CLI-${Date.now()}`,
      ...cliente
    };
    return this.apiService.post<Cliente>('/clientes', clienteConId);
  }

  actualizarCliente(id: string, cliente: Cliente): Observable<ApiResponse<Cliente>> {
    return this.apiService.put<Cliente>(`/clientes/${id}`, cliente);
  }

  eliminarCliente(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete(`/clientes/${id}`);
  }
}
