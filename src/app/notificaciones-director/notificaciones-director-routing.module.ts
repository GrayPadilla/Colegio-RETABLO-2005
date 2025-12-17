import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificacionesDirectorPage } from './notificaciones-director.page';

const routes: Routes = [
  {
    path: '',
    component: NotificacionesDirectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificacionesDirectorPageRoutingModule {}
