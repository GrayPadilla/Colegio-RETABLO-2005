import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restablecer-contrasena',
  templateUrl: './restablecer-contrasena.page.html',
  styleUrls: ['./restablecer-contrasena.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RestablecerContrasenaPage {

  constructor(private router: Router) {}

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/olvidar-contrasena']);
  }

  irALogin() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/intro']);
  }

}
