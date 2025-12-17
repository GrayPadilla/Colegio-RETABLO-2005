import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordatorioPadrePageRoutingModule } from './recordatorio-padre-routing.module';

import { RecordatorioPadrePage } from './recordatorio-padre.page';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordatorioPadrePageRoutingModule,
    AngularFirestoreModule
  ],
  declarations: [RecordatorioPadrePage]
})
export class RecordatorioPadrePageModule {}
