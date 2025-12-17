import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificacionesPadrePageRoutingModule } from './notificaciones-padre-routing.module';

import { NotificacionesPadrePage } from './notificaciones-padre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificacionesPadrePageRoutingModule,
    NotificacionesPadrePage
  ]
})
export class NotificacionesPadrePageModule {}
