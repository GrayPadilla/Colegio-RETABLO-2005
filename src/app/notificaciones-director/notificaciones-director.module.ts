import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificacionesDirectorPageRoutingModule } from './notificaciones-director-routing.module';

import { NotificacionesDirectorPage } from './notificaciones-director.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificacionesDirectorPageRoutingModule,
    NotificacionesDirectorPage
  ]
})
export class NotificacionesDirectorPageModule {}
