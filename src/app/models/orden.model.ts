export interface Orden {
  ordenId: string;
  clienteId: string;
  subtotal: number;
  impuesto: number;
  total: number;
}

export interface DetalleOrden {
  detalleOrdenId: string;
  ordenId: string;
  productoId: string;
  cantidad: number;
  subtotal: number;
  impuesto: number;
  total: number;
}
