import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NuevaReunionPageRoutingModule } from './nueva-reunion-routing.module';

import { NuevaReunionPage } from './nueva-reunion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NuevaReunionPageRoutingModule
  ],
  declarations: [NuevaReunionPage],
})
export class NuevaReunionPageModule {}
