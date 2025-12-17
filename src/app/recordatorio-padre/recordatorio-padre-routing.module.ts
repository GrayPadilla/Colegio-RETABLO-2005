import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordatorioPadrePage } from './recordatorio-padre.page';

const routes: Routes = [
  {
    path: '',
    component: RecordatorioPadrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordatorioPadrePageRoutingModule {}
