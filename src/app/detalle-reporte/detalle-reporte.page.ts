import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportesService } from '../services/reportes.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-reporte',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './detalle-reporte.page.html',
  styleUrls: ['./detalle-reporte.page.scss'],
})
export class DetalleReportePage implements OnInit, OnDestroy {
  reporte: any;
  notificationCount = 1;

  userDocID!: string;
  reporteID!: string;

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private reportesService: ReportesService
  ) {}

  ngOnInit() {
    // leer parámetros
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    this.reporteID = this.route.snapshot.paramMap.get('rid')!;

    console.log("ID usuario:", this.userDocID);
    console.log("ID reporte:", this.reporteID);

    // cargar reporte
    this.sub = this.reportesService
      .getReporteById(this.reporteID)
      .subscribe(r => {
        this.reporte = r;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'reportes-asistencia']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }

  async generarPDF() {
    const { default: html2canvas } = await import('html2canvas');
    const elemento = document.getElementById('pdf-wrapper');
    if (!elemento) return;

    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('reporte.pdf');
  }
}
