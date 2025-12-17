import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router, ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './menu-principal.page.html',
  styleUrls: ['./menu-principal.page.scss'],
})
export class MenuPrincipalPage {

  userDocID!: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("ID recibido:", this.userDocID);
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/entrada']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'notificaciones-padre']);
  }

  goToReuniones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'reuniones-programadas-padre']);
  }

  goToPerfil() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'perfil-padre']);
  }

  goToMensajes() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'mensajes']);
  }

  goToConfiguracion() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'configuracion']);
  }

  goToReportes() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'reportes-asistencia']);
  }

  goToCalendario() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'calendario-padre']);
  }

}