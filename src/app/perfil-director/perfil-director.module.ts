import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // <--- IMPORTANTE: Esto trae los componentes visuales

import { PerfilDirectorPageRoutingModule } from './perfil-director-routing.module';
import { PerfilDirectorPage } from './perfil-director.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule, // <--- Aquí se inyectan las herramientas a la página
    PerfilDirectorPageRoutingModule
  ],
  declarations: [PerfilDirectorPage] // <--- Aquí decimos que la página pertenece a este módulo
})
export class PerfilDirectorPageModule {}