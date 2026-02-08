export interface Cliente {
  clienteId: string;
  nombre: string;
  identidad: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
