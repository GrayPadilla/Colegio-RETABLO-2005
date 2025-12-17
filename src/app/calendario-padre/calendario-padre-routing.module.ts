import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarioPadrePage } from './calendario-padre.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarioPadrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarioPadrePageRoutingModule {}
