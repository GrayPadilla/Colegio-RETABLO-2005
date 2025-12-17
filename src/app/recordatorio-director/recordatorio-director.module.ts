import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecordatorioDirectorPageRoutingModule } from './recordatorio-director-routing.module';

import { RecordatorioDirectorPage } from './recordatorio-director.page';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecordatorioDirectorPageRoutingModule,
    AngularFirestoreModule
  ],
  declarations: [RecordatorioDirectorPage]
})
export class RecordatorioDirectorPageModule {}
