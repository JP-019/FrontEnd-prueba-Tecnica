import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  clientes = signal<Cliente[]>([]);
  mostrarFormulario = signal(false);
  cargando = signal(false);
  error = signal<string | null>(null);
  clienteEditandoId = signal<string | null>(null);

  formularioCliente = signal({
    nombre: '',
    identidad: ''
  });

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando.set(true);
    this.clienteService.getClientes().subscribe({
      next: (response) => {
        this.clientes.set(response.data || []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar clientes');
        this.cargando.set(false);
        console.error(err);
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.clienteEditandoId.set(null);
    this.formularioCliente.set({ nombre: '', identidad: '' });
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
    this.clienteEditandoId.set(null);
  }

  guardarCliente() {
    const datos = this.formularioCliente();
    if (!datos.nombre || !datos.identidad) {
      this.error.set('Completa todos los campos');
      return;
    }

    if (this.clienteEditandoId()) {
      // Actualizar
      const clienteId = this.clienteEditandoId()!;
      const clienteActual = this.clientes().find(c => c.clienteId === clienteId);
      if (clienteActual) {
        this.clienteService.actualizarCliente(clienteId, {
          ...clienteActual,
          ...datos
        }).subscribe({
          next: () => {
            this.cargarClientes();
            this.cerrarFormulario();
          },
          error: (err) => {
            this.error.set('Error al actualizar cliente');
            console.error(err);
          }
        });
      }
    } else {
      // Crear
      this.clienteService.crearCliente(datos).subscribe({
        next: () => {
          this.cargarClientes();
          this.cerrarFormulario();
        },
        error: (err) => {
          this.error.set('Error al crear cliente');
          console.error(err);
        }
      });
    }
  }

  editarCliente(cliente: Cliente) {
    this.clienteEditandoId.set(cliente.clienteId);
    this.formularioCliente.set({
      nombre: cliente.nombre,
      identidad: cliente.identidad
    });
    this.mostrarFormulario.set(true);
  }

  eliminarCliente(clienteId: string) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clienteService.eliminarCliente(clienteId).subscribe({
        next: () => {
          this.cargarClientes();
        },
        error: (err) => {
          this.error.set('Error al eliminar cliente');
          console.error(err);
        }
      });
    }
  }
}
