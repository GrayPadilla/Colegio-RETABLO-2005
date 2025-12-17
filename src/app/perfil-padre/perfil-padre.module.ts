import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPadrePageRoutingModule } from './perfil-padre-routing.module';

import { PerfilPadrePage } from './perfil-padre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPadrePageRoutingModule
  ],
  declarations: [PerfilPadrePage]
})
export class PerfilPadrePageModule {}