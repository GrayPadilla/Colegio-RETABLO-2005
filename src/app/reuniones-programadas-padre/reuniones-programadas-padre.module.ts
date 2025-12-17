import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReunionesProgramadasPadrePage } from './reuniones-programadas-padre.page';

const routes: Routes = [
  {
    path: '',
    component: ReunionesProgramadasPadrePage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ReunionesProgramadasPadrePage // ✅ Aquí lo IMPORTAS como componente standalone
  ],
  // ❌ Elimina 'declarations'
  // declarations: [ReunionesProgramadasDirectorPage],
})
export class ReunionesProgramadasPadrePageModule {}
