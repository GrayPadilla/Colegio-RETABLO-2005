import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarioDirectorPageRoutingModule } from './calendario-director-routing.module';

import { CalendarioDirectorPage } from './calendario-director.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarioDirectorPageRoutingModule
  ],
  declarations: [CalendarioDirectorPage]
})
export class CalendarioDirectorPageModule {}
