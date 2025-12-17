import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarioDirectorPage } from './calendario-director.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarioDirectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarioDirectorPageRoutingModule {}
