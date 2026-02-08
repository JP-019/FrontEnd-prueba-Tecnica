import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos = signal<Producto[]>([]);
  mostrarFormulario = signal(false);
  cargando = signal(false);
  error = signal<string | null>(null);
  productoEditandoId = signal<string | null>(null);

  formularioProducto = signal({
    nombre: '',
    precio: 0,
    exitencia: 0
  });

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.productoService.getProductos().subscribe({
      next: (response) => {
        this.productos.set(response.data || []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar productos');
        this.cargando.set(false);
        console.error(err);
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.productoEditandoId.set(null);
    this.formularioProducto.set({ nombre: '', precio: 0, exitencia: 0 });
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.productoEditandoId.set(null);
  }

  guardarProducto() {
    const datos = this.formularioProducto();
    if (!datos.nombre || datos.precio <= 0 || datos.exitencia < 0) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    if (this.productoEditandoId()) {
      const productoId = this.productoEditandoId()!;
      const productoActual = this.productos().find(p => p.productoId === productoId);
      if (productoActual) {
        this.productoService.actualizarProducto(productoId, {
          ...productoActual,
          ...datos
        }).subscribe({
          next: () => {
            this.cargarProductos();
            this.cerrarFormulario();
          },
          error: (err) => {
            this.error.set('Error al actualizar producto');
            console.error(err);
          }
        });
      }
    } else {
      this.productoService.crearProducto(datos).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          this.error.set('Error al crear producto');
          console.error(err);
        }
      });
    }
  }
contarProductosStockBajo(): number {
  return this.productos().filter(p => p.exitencia < 5).length;
}
  editarProducto(producto: Producto) {
    this.productoEditandoId.set(producto.productoId);
    this.formularioProducto.set({
      nombre: producto.nombre,
      precio: producto.precio,
      exitencia: producto.exitencia
    });
    this.mostrarFormulario.set(true);
  }

  eliminarProducto(productoId: string) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productoService.eliminarProducto(productoId).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (err) => {
          this.error.set('Error al eliminar producto');
          console.error(err);
        }
      });
    }
  }
}
