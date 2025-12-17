import { Component, OnDestroy } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReportesService, Reporte } from '../services/reportes.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

type ReporteUI = Reporte & { id?: string; titulo?: string; tipo?: string };

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './reportes-asistencia.page.html',
  styleUrls: ['./reportes-asistencia.page.scss'],
})
export class ReportesAsistenciaPage implements OnDestroy {
  notificationCount = 1;

  mostrarBuscador = false;
  textoBusqueda = '';

  reportesOriginales: ReporteUI[] = [];
  reportes: ReporteUI[] = [];

  userDocID!: string;

  private sub?: Subscription;

  constructor(
    private navCtrl: NavController, 
    private reportesService: ReportesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("ID recibido en reportes-asistencia:", this.userDocID);

    this.sub = this.reportesService.getReportes().subscribe(list => {
      const mapped: ReporteUI[] = (list || []).map(item => {
        const anyItem = item as any;  // acceso seguro

        const tituloGenerado =
          anyItem.titulo ??
          `${item.tipoReporte ?? ''} - ${item.gradoSeccion ?? ''}`.trim();

        return {
          ...(item as Reporte),
          id: anyItem.id ?? undefined,
          titulo: tituloGenerado,
          tipo: anyItem.tipo ?? item.tipoReporte ?? '',
        } as ReporteUI;
      });

      this.reportesOriginales = mapped;
      this.aplicarFiltro();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'menu-principal']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }

  buscarReportes() {
    this.mostrarBuscador = !this.mostrarBuscador;
    if (!this.mostrarBuscador) {
      // si se oculta, limpiar filtro
      this.textoBusqueda = '';
      this.aplicarFiltro();
    }
  }

  filtrarReportes(event: any) {
    const texto = event.detail?.value ?? '';
    this.textoBusqueda = texto.toLowerCase();
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    if (!this.textoBusqueda) {
      this.reportes = [...this.reportesOriginales];
      return;
    }
    const t = this.textoBusqueda;
    this.reportes = this.reportesOriginales.filter(r => {
      const titulo = (r.titulo ?? '').toLowerCase();
      const tipo = (r.tipo ?? '').toLowerCase();
      const fecha = (r.fecha ?? '').toLowerCase();
      const grado = (r.gradoSeccion ?? '').toLowerCase();
      return titulo.includes(t) || tipo.includes(t) || fecha.includes(t) || grado.includes(t);
    });
  }

  goToNuevoReporte() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'nuevo-reporte']);
  }

  verDetalle(id?: string) {
    if (!id) {
      console.warn('ID de reporte no disponible para ver detalle');
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'detalle-reporte', id]);
  }
}
