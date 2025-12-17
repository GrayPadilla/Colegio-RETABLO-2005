import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ReportesService } from '../services/reportes.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nuevo-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './nuevo-reporte.page.html',
  styleUrls: ['./nuevo-reporte.page.scss'],
})
export class NuevoReportePage implements OnInit {
  notificationCount = 1; // mantener consistencia del header

  tipoReporte: string = '';
  gradoSeccion: string = '';
  fecha: string = '';
  descripcion: string = '';

  guardando = false;

  userDocID!: string;

  constructor(
    private navCtrl: NavController,
    private reportesService: ReportesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("ID recibido en nuevo-reporte:", this.userDocID);
  }

  async guardarReporte() {
    if (!this.tipoReporte || !this.gradoSeccion || !this.fecha) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    this.guardando = true;
    try {
      // creadoPor lo dejamos null por defecto; si tienes usuario logueado, pásalo aquí.
      await this.reportesService.crearReporte({
        tipoReporte: this.tipoReporte,
        gradoSeccion: this.gradoSeccion,
        fecha: this.fecha,
        descripcion: this.descripcion,
        creadoPor: null,
        estado: 'activo'
      });
      // regresar a la lista
      this.navCtrl.navigateBack(['/', this.userDocID, 'reportes-asistencia']);
    } catch (err) {
      console.error('Error guardando reporte', err);
      alert('Error al guardar el reporte.');
    } finally {
      this.guardando = false;
    }
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'reportes-asistencia']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }
}
