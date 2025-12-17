import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ReunionesService, Reunion } from '../services/reuniones.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-recordatorio-padre',
  templateUrl: './recordatorio-padre.page.html',
  styleUrls: ['./recordatorio-padre.page.scss'],
})
export class RecordatorioPadrePage implements OnInit, OnDestroy {

  // =========================
  // 🔑 ID DEL PADRE
  // =========================
  userDocID!: string;

  // =========================
  // 📅 FECHA SELECCIONADA
  // =========================
  fechaSeleccionada!: string;
  diaSeleccionado!: number;
  mesSeleccionado!: string;
  diaNombre!: string;

  // =========================
  // 📌 REUNIONES DEL DÍA
  // =========================
  reuniones: Reunion[] = [];
  sub?: Subscription;

  // =========================
  // 🔔 NOTIFICACIONES
  // =========================
  notificationCount = 0;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private reunionesService: ReunionesService
  ) {}

  // ==================================================
  // INIT
  // ==================================================
  ngOnInit() {

    // ID del padre
    this.userDocID = this.route.snapshot.paramMap.get('id')!;

    // Fecha enviada desde calendario-padre
    const fecha = this.route.snapshot.queryParamMap.get('fecha');
    if (!fecha) {
      console.warn('⚠️ No se recibió fecha');
      return;
    }

    this.fechaSeleccionada = fecha;

    // Procesar fecha para UI
    this.procesarFecha(fecha);

    // 🔥 Obtener SOLO reuniones donde el padre participa
    this.sub = this.reunionesService
    .obtenerReunionesPorParticipante(this.userDocID)
    .subscribe(reuniones => {
      this.reuniones = reuniones.filter(r => r.fecha === fecha);
      console.log('[Recordatorio Padre] reuniones del día:', this.reuniones);
    });
  }

  // ==================================================
  // DESTROY
  // ==================================================
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // ==================================================
  // 📆 FORMATEO DE FECHA
  // ==================================================
  procesarFecha(fecha: string) {
    const [y, m, d] = fecha.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    const dias = [
      'Domingo', 'Lunes', 'Martes',
      'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];

    const meses = [
      'ENE','FEB','MAR','ABR','MAY','JUN',
      'JUL','AGO','SEP','OCT','NOV','DIC'
    ];

    this.diaSeleccionado = date.getDate();
    this.mesSeleccionado = meses[date.getMonth()];
    this.diaNombre = dias[date.getDay()];
  }

  // ==================================================
  // 🔙 NAVEGACIÓN
  // ==================================================
  goBack() {
    this.navCtrl.navigateBack(['/', this.userDocID, 'calendario-padre']);
  }

  goNotificaciones() {
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-padre']);
  }
}
