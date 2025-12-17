import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarioPadrePageRoutingModule } from './calendario-padre-routing.module';

import { CalendarioPadrePage } from './calendario-padre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarioPadrePageRoutingModule
  ],
  declarations: [CalendarioPadrePage]
})
export class CalendarioPadrePageModule {}
