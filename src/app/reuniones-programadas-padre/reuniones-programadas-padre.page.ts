import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ReunionesService } from '../services/reuniones.service';

@Component({
  selector: 'app-reuniones-programadas-padre',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './reuniones-programadas-padre.page.html',
  styleUrls: ['./reuniones-programadas-padre.page.scss'],
})
export class ReunionesProgramadasPadrePage {
  notificationCount = 1;
  userDocID!: string;
  reuniones: any[] = [];

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private reunionesService: ReunionesService
  ) {}

  ngOnInit() {
    // ID del usuario que está navegando en esta vista
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("User ID:", this.userDocID);

    // 🔥 Consulta Firestore: SOLO reuniones donde participantIds contiene este ID
    this.reunionesService
      .obtenerReunionesPorParticipante(this.userDocID)
      .subscribe(data => {
        console.log("Reuniones filtradas:", data);
        this.reuniones = data || [];
      });
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'menu-principal-padre']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-padre']);
  }

  goToSolicitarReunion() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'solicitar-reunion']);
  }

  comenzarReunion(r: any) {
    if (!r.ubicacion) {
      alert("Esta reunión no tiene link de Zoom asignado.");
      return;
    }

    window.open(r.ubicacion, "_blank");
  }

  async eliminarReunion(r: any) {
    const ok = confirm(`¿Eliminar la reunión: "${r.asunto}"?`);
    if (!ok) return;

    try {
      await this.reunionesService.eliminarReunion(r.id);
      console.log("Reunión eliminada");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la reunión");
    }
  }
}
