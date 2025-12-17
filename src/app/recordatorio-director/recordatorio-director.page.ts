import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ReunionesService, Reunion } from '../services/reuniones.service';
import { Subscription } from 'rxjs';
import { IonButton, IonHeader } from "@ionic/angular/standalone";

@Component({
  standalone: false,
  selector: 'app-recordatorio-director',
  templateUrl: './recordatorio-director.page.html',
  styleUrls: ['./recordatorio-director.page.scss']
})
export class RecordatorioDirectorPage implements OnInit, OnDestroy {

  // =========================
  // 🔑 ID DEL DIRECTOR
  // =========================
  userDocID!: string;

  // =========================
  // 📅 FECHA SELECCIONADA
  // =========================
  diaSeleccionado!: number;
  mesSeleccionado!: string;
  diaNombre!: string;

  // =========================
  // 📌 RECORDATORIO
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

    // ID del director
    this.userDocID = this.route.snapshot.paramMap.get('id')!;

    // Fecha enviada desde calendario-director
    const fecha = this.route.snapshot.queryParamMap.get('fecha');
    if (!fecha) {
      console.warn('⚠️ No se recibió fecha');
      return;
    }

    // Procesar fecha (día / mes / nombre)
    this.procesarFecha(fecha);

    // 🔥 Obtener reuniones del día
    this.sub = this.reunionesService
      .obtenerReunionesPorFecha(fecha, this.userDocID)
      .subscribe(reuniones => {
        this.reuniones = reuniones;
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
    // Evita desfases de zona horaria
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
    this.navCtrl.navigateBack(['/', this.userDocID, 'calendario-director']);
  }

  goNotificaciones() {
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }
}
