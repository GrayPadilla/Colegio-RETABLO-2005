import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ReunionesService } from '../services/reuniones.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reuniones-programadas-director',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './reuniones-programadas-director.page.html',
  styleUrls: ['./reuniones-programadas-director.page.scss'],
})
export class ReunionesProgramadasDirectorPage {
  notificationCount = 1;
  reuniones: any[] = [];
  userDocID!: string;

  constructor(
    private navCtrl: NavController,
    private reunionesService: ReunionesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("ID recibido en reuniones:", this.userDocID);

    this.reunionesService.obtenerReuniones().subscribe(data => {
      this.reuniones = data;
    });
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'menu-principal']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }

  goToNuevaReunion() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'nueva-reunion']);
  }

  comenzarReunion(r: any) {
    const directorEmail = "aangullasm@ucvvirtual.edu.pe";

    if (!r.ubicacion) {
      alert("Esta reunión no tiene link de Zoom asignado.");
      return;
    }

    console.log(`Iniciando reunión como: ${directorEmail}`);
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
