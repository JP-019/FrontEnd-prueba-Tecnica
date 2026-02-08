import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../services/orden.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { Orden, DetalleOrden } from '../../models/orden.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.css'
})
export class OrdenesComponent implements OnInit {
  ordenes = signal<Orden[]>([]);
  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  detallesActuales = signal<DetalleOrden[]>([]);

  mostrarFormularioOrden = signal(false);
  mostrarDetalles = signal(false);
  mostrarAgregarProducto = signal(false);
  cargando = signal(false);
  error = signal<string | null>(null);
  ordenSeleccionadaId = signal<string | null>(null);

  formularioOrden = signal({
    clienteId: ''
  });

  formularioProducto = signal({
    productoId: '',
    cantidad: 1
  });

  constructor(
    private ordenService: OrdenService,
    private clienteService: ClienteService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.clienteService.getClientes().subscribe({
      next: (response) => this.clientes.set(response.data || []),
      error: () => this.error.set('Error al cargar clientes')
    });

    this.productoService.getProductos().subscribe({
      next: (response) => this.productos.set(response.data || []),
      error: () => this.error.set('Error al cargar productos')
    });

    this.ordenService.getOrdenes().subscribe({
      next: (response) => {
        this.ordenes.set(response.data || []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar órdenes');
        this.cargando.set(false);
      }
    });
  }

  abrirFormularioOrden() {
    this.mostrarFormularioOrden.set(true);
    this.formularioOrden.set({ clienteId: '' });
  }

  cerrarFormularioOrden() {
    this.mostrarFormularioOrden.set(false);
  }

  crearOrden() {
    const datos = this.formularioOrden();
    if (!datos.clienteId) {
      this.error.set('Selecciona un cliente');
      return;
    }

    this.ordenService.crearOrden({
      clienteId: datos.clienteId,
      subtotal: 0,
      impuesto: 0,
      total: 0
    }).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarFormularioOrden();
      },
      error: (err) => {
        this.error.set('Error al crear orden');
        console.error(err);
      }
    });
  }

  verDetalles(ordenId: string) {
    this.ordenSeleccionadaId.set(ordenId);
    this.mostrarDetalles.set(true);
    this.obtenerDetalles(ordenId);
  }

  cerrarDetalles() {
    this.mostrarDetalles.set(false);
    this.mostrarAgregarProducto.set(false);
    this.ordenSeleccionadaId.set(null);
  }

  obtenerDetalles(ordenId: string) {
    this.ordenService.getDetallesPorOrden(ordenId).subscribe({
      next: (response) => this.detallesActuales.set(response.data || []),
      error: (err) => {
        this.error.set('Error al cargar detalles');
        console.error(err);
      }
    });
  }

  abrirAgregarProducto() {
    this.mostrarAgregarProducto.set(true);
    this.formularioProducto.set({ productoId: '', cantidad: 1 });
  }

  cerrarAgregarProducto() {
    this.mostrarAgregarProducto.set(false);
  }

  agregarProductoAOrden() {
    const datos = this.formularioProducto();
    const ordenId = this.ordenSeleccionadaId();

    if (!datos.productoId || !ordenId || datos.cantidad <= 0) {
      this.error.set('Completa los datos correctamente');
      return;
    }

    const producto = this.productos().find(p => p.productoId === datos.productoId);
    if (!producto) {
      this.error.set('Producto no encontrado');
      return;
    }

    if (producto.exitencia < datos.cantidad) {
      this.error.set(`Existencia insuficiente. Disponible: ${producto.exitencia}`);
      return;
    }

    this.ordenService.agregarProductoAOrden(ordenId, datos.productoId, datos.cantidad).subscribe({
      next: () => {
        this.obtenerDetalles(ordenId);
        this.cargarDatos();
        this.cerrarAgregarProducto();
      },
      error: (err) => {
        this.error.set('Error al agregar producto');
        console.error(err);
      }
    });
  }

  actualizarCantidad(detalleId: string, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.error.set('La cantidad debe ser mayor a 0');
      return;
    }

    this.ordenService.actualizarCantidadDetalle(detalleId, nuevaCantidad).subscribe({
      next: () => {
        const ordenId = this.ordenSeleccionadaId();
        if (ordenId) {
          this.obtenerDetalles(ordenId);
          this.cargarDatos();
        }
      },
      error: (err) => {
        this.error.set('Error al actualizar cantidad');
        console.error(err);
      }
    });
  }

  removerProducto(detalleId: string) {
    if (confirm('¿Seguro que deseas remover este producto?')) {
      this.ordenService.removerProductoDeOrden(detalleId).subscribe({
        next: () => {
          const ordenId = this.ordenSeleccionadaId();
          if (ordenId) {
            this.obtenerDetalles(ordenId);
            this.cargarDatos();
          }
        },
        error: (err) => {
          this.error.set('Error al remover producto');
          console.error(err);
        }
      });
    }
  }

  eliminarOrden(ordenId: string) {
    if (confirm('¿Seguro que deseas eliminar esta orden?')) {
      this.ordenService.eliminarOrden(ordenId).subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          this.error.set('Error al eliminar orden');
          console.error(err);
        }
      });
    }
  }

  getNombreCliente(clienteId: string): string {
    return this.clientes().find(c => c.clienteId === clienteId)?.nombre || 'Desconocido';
  }

  getNombreProducto(productoId: string): string {
    return this.productos().find(p => p.productoId === productoId)?.nombre || 'Desconocido';
  }

  getOrdenActual(): Orden | undefined {
    return this.ordenes().find(o => o.ordenId === this.ordenSeleccionadaId());
  }
}
