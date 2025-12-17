import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordatorioDirectorPage } from './recordatorio-director.page';

const routes: Routes = [
  {
    path: '',
    component: RecordatorioDirectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordatorioDirectorPageRoutingModule {}
