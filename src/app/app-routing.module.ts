import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'entrada',
    pathMatch: 'full'
  },
  {
    path: 'entrada',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'intro',
    loadComponent: () => import('./auth/screens/intro/intro.page').then(m => m.IntroPage)
  },
  {
    path: 'crear-cuenta',
    loadComponent: () =>
      import('./auth/screens/crear-cuenta/crear-cuenta.page').then(m => m.CrearCuentaPage)
  },
  {
    path: 'olvidar-contrasena',
    loadComponent: () => import('./auth/screens/olvidar-contrasena/olvidar-contrasena.page').then(m => m.OlvidarContrasenaPage)
  },
  {
    path: 'restablecer-contrasena',
    loadComponent: () => import('./auth/screens/restablecer-contrasena/restablecer-contrasena.page').then(m => m.RestablecerContrasenaPage)
  },
  {
    path: 'crear-google',
    loadComponent: () => import('./auth/screens/crear-google/crear-google.page').then(m => m.CrearGooglePage)
  },
  {
    path: ':id/calendario-padre',
    loadChildren: () => import('./calendario-padre/calendario-padre.module').then(m => m.CalendarioPadrePageModule)
  },
  {
    path: ':id/calendario-director',
    loadChildren: () => import('./calendario-director/calendario-director.module').then(m => m.CalendarioDirectorPageModule)
  },
  {
    path: ':id/recordatorio-padre',
    loadChildren: () => import('./recordatorio-padre/recordatorio-padre.module').then(m => m.RecordatorioPadrePageModule)
  },
  {
    path: ':id/recordatorio-director',
    loadChildren: () => import('./recordatorio-director/recordatorio-director.module').then(m => m.RecordatorioDirectorPageModule)
  },
  {
    path: ':id/menu-principal',
    loadComponent: () => import('./menu-principal/menu-principal.page').then(m => m.MenuPrincipalPage)
  },

  {
    path: ':id/menu-principal-padre',
    loadComponent: () => import('./menu-principal-padre/menu-principal.page').then(m => m.MenuPrincipalPage)
  },
  {
    path: ':id/reuniones-programadas-director',
    loadChildren: () => import('./reuniones-programadas-director/reuniones-programadas-director.module').then(m => m.ReunionesProgramadasDirectorPageModule)
  },
  {
    path: ':id/reuniones-programadas-padre',
    loadChildren: () => import('./reuniones-programadas-padre/reuniones-programadas-padre.module').then(m => m.ReunionesProgramadasPadrePageModule)
  },
  {
    path: ':id/solicitar-reunion',
    loadComponent: () => import('./solicitar-reunion/solicitar-reunion.page').then(m => m.SolicitarReunionPage)
  },
  {
    path: ':id/perfil-director',
    loadChildren: () => import('./perfil-director/perfil-director.module').then(m => m.PerfilDirectorPageModule)
  },
  {
    path: ':id/perfil-padre',
    loadChildren: () => import('./perfil-padre/perfil-padre.module').then(m => m.PerfilPadrePageModule)
  },
  {
    path: ':id/mensajes',
    loadComponent: () => import('./mensajes/mensajes.page').then(m => m.MensajesPage)
  },
  {
    path: ':id/configuracion',
    loadComponent: () => import('./configuracion/configuracion.page').then(m => m.ConfiguracionPage)
  },
  {
    path: ':id/reportes-asistencia',
    loadComponent: () => import('./reportes-asistencia/reportes-asistencia.page').then(m => m.ReportesAsistenciaPage)
  },
  {
    path: ':id/nuevo-reporte',
    loadComponent: () =>
      import('./nuevo-reporte/nuevo-reporte.page').then(m => m.NuevoReportePage)
  },
  {
    path: ':id/nueva-reunion',
    loadComponent: () =>
      import('./nueva-reunion/nueva-reunion.page').then(m => m.NuevaReunionPage)
  },
  {
    path: ':id/detalle-reporte/:rid',
    loadComponent: () =>
      import('./detalle-reporte/detalle-reporte.page').then(m => m.DetalleReportePage)
  },
  {
    path: ':id/notificaciones-director',
    loadComponent: () =>
      import('./notificaciones-director/notificaciones-director.page').then(m => m.NotificacionesDirectorPage)
  },
  {
    path: ':id/notificaciones-padre',
    loadComponent: () =>
      import('./notificaciones-padre/notificaciones-padre.page').then(m => m.NotificacionesPadrePage)
  },
  {
    path: '',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }