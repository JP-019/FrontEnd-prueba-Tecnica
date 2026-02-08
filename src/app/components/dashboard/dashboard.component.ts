import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { OrdenService } from '../../services/orden.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Signals para las estadísticas
  totalClientes = signal(0);
  totalProductos = signal(0);
  totalOrdenes = signal(0);
  totalVentas = signal(0);
  productosBajoStock = signal(0);
  cargando = signal(true);
  error = signal<string | null>(null);

  // Signals computados para métricas adicionales
  promedioVentasPorOrden = computed(() => {
    const total = this.totalOrdenes();
    return total > 0 ? this.totalVentas() / total : 0;
  });

  porcentajeProductosBajoStock = computed(() => {
    const total = this.totalProductos();
    return total > 0 ? (this.productosBajoStock() / total) * 100 : 0;
  });

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private ordenService: OrdenService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  /**
   * Carga todas las estadísticas del dashboard de forma paralela
   */
  cargarEstadisticas() {
    this.cargando.set(true);
    this.error.set(null);

    // Usar forkJoin para cargar todos los datos en paralelo
    forkJoin({
      clientes: this.clienteService.getClientes(),
      productos: this.productoService.getProductos(),
      ordenes: this.ordenService.getOrdenes()
    })
    .pipe(
      finalize(() => this.cargando.set(false))
    )
    .subscribe({
      next: (response) => {
        // Procesar clientes
        this.totalClientes.set(response.clientes.data?.length || 0);

        // Procesar productos
        const productos = response.productos.data || [];
        this.totalProductos.set(productos.length);
        this.productosBajoStock.set(
          productos.filter(p => p.exitencia < 5).length
        );

        // Procesar órdenes
        const ordenes = response.ordenes.data || [];
        this.totalOrdenes.set(ordenes.length);
        this.totalVentas.set(
          ordenes.reduce((sum, o) => sum + (o.total || 0), 0)
        );
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error.set('Error al cargar las estadísticas. Por favor, intente nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Obtiene el saludo según la hora del día
   */
  obtenerSaludo(): string {
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 12) {
      return 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  /**
   * Obtiene la fecha y hora actual formateada
   */
  obtenerFechaActual(): string {
    const ahora = new Date();
    return ahora.toLocaleDateString('es-HN', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Formatea un número como moneda en Lempiras
   */
  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Obtiene el ícono de tendencia basado en el porcentaje
   */
  obtenerTendencia(porcentaje: number): 'up' | 'down' | 'neutral' {
    if (porcentaje > 0) return 'up';
    if (porcentaje < 0) return 'down';
    return 'neutral';
  }

  /**
   * Recarga las estadísticas manualmente
   */
  recargarEstadisticas() {
    this.cargarEstadisticas();
  }

  /**
   * Obtiene el estado del stock
   */
  obtenerEstadoStock(): 'crítico' | 'advertencia' | 'normal' {
    const porcentaje = this.porcentajeProductosBajoStock();
    if (porcentaje >= 20) return 'crítico';
    if (porcentaje >= 10) return 'advertencia';
    return 'normal';
  }

  /**
   * Obtiene un mensaje motivacional aleatorio
   */
  obtenerMensajeMotivacional(): string {
    const mensajes = [
      '¡Excelente trabajo!',
      '¡Sigue así!',
      '¡Vas muy bien!',
      '¡Gran desempeño!',
      '¡Mantén el ritmo!'
    ];
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  }

  /**
   * Verifica si hay alertas importantes
   */
  hayAlertas(): boolean {
    return this.productosBajoStock() > 0;
  }

  /**
   * Obtiene el número total de alertas
   */
  totalAlertas(): number {
    let alertas = 0;
    if (this.productosBajoStock() > 0) alertas++;
    // Aquí puedes agregar más condiciones de alerta
    return alertas;
  }

  /**
   * Formatea un porcentaje
   */
  formatearPorcentaje(valor: number): string {
    return `${valor.toFixed(1)}%`;
  }

  /**
   * Calcula el crecimiento (simulado para demo)
   * En producción, esto debería comparar con datos históricos
   */
  calcularCrecimiento(tipo: 'clientes' | 'productos' | 'ordenes' | 'ventas'): number {
    // Simulación - en producción debería comparar con mes anterior
    const rangos = {
      clientes: [5, 15],
      productos: [2, 8],
      ordenes: [8, 20],
      ventas: [15, 30]
    };
    
    const [min, max] = rangos[tipo];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Exporta las estadísticas a CSV (función futura)
   */
  exportarEstadisticas() {
    // TODO: Implementar exportación a CSV o PDF
    console.log('Exportando estadísticas...');
  }
}