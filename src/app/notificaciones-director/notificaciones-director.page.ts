import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacionesService, Notificacion } from '../services/notificaciones.service';
import { UsuarioService, UsuarioApp } from '../services/usuario.service';

@Component({
  selector: 'app-notificaciones-director',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './notificaciones-director.page.html',
  styleUrls: ['./notificaciones-director.page.scss']
})
export class NotificacionesDirectorPage implements OnInit, OnDestroy {

  userDocID!: string;

  usuarioActual: UsuarioApp | null = null;
  notificaciones: Notificacion[] = [];

  // Para crear nueva
  tituloNueva = '';
  fechaNueva = '';
  horaNueva = '';
  mensajeNuevo = '';

  // Para editar
  editandoId: string | null = null;
  tituloEdit = '';
  fechaEdit = '';
  horaEdit = '';
  mensajeEdit = '';

  private subUsuario?: Subscription;
  private subNotifs?: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private notificacionesService: NotificacionesService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("User ID:", this.userDocID);
    this.subUsuario = this.usuarioService.usuarioActual$().subscribe(usuario => {
      this.usuarioActual = usuario;

      this.subNotifs?.unsubscribe();
      if (usuario) {
        this.subNotifs = this.notificacionesService
          .notificacionesCreadasPorUsuario(usuario.uid)
          .subscribe(lista => (this.notificaciones = lista));
      } else {
        this.notificaciones = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.subUsuario?.unsubscribe();
    this.subNotifs?.unsubscribe();
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'menu-principal']);
  }

  async crearNotificacion() {
    if (!this.usuarioActual) {
      return;
    }

    const titulo = this.tituloNueva.trim();
    const fecha = this.fechaNueva.trim();
    const hora = this.horaNueva.trim();
    const mensaje = this.mensajeNuevo.trim();

    if (!titulo || !fecha || !hora || !mensaje) {
      const toast = await this.toastCtrl.create({
        message: 'Completa asunto, fecha, hora y mensaje.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      await this.notificacionesService.crearNotificacionParaPadres(
        this.usuarioActual,
        titulo,
        mensaje,
        fecha,
        hora
      );

      this.tituloNueva = '';
      this.fechaNueva = '';
      this.horaNueva = '';
      this.mensajeNuevo = '';

      const toast = await this.toastCtrl.create({
        message: 'Anuncio enviado a todos los padres.',
        duration: 2500,
        color: 'success'
      });
      await toast.present();
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo crear la notificación. Intenta nuevamente.',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
    }
  }

  iniciarEdicion(notif: Notificacion) {
    this.editandoId = notif.id!;
    this.tituloEdit = notif.titulo;
    this.fechaEdit = notif.fecha || '';
    this.horaEdit = notif.hora || '';
    this.mensajeEdit = notif.mensaje;
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.tituloEdit = '';
    this.mensajeEdit = '';
  }

  async guardarEdicion() {
    if (!this.editandoId) return;

    const titulo = this.tituloEdit.trim();
    const fecha = this.fechaEdit.trim();
    const hora = this.horaEdit.trim();
    const mensaje = this.mensajeEdit.trim();

    if (!titulo || !fecha || !hora || !mensaje) {
      const toast = await this.toastCtrl.create({
        message: 'Completa asunto, fecha, hora y mensaje.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      await this.notificacionesService.editarNotificacion(
        this.editandoId,
        titulo,
        mensaje,
        fecha,
        hora
      );
      this.cancelarEdicion();

      const toast = await this.toastCtrl.create({
        message: 'Notificación actualizada.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo actualizar. Intenta nuevamente.',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async eliminarNotificacion(id: string | undefined) {
    if (!id) {
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar notificación',
      message: '¿Seguro que deseas eliminar esta notificación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.notificacionesService.eliminarNotificacion(id);
              const toast = await this.toastCtrl.create({
                message: 'Notificación eliminada.',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch {
              const toast = await this.toastCtrl.create({
                message: 'No se pudo eliminar. Intenta nuevamente.',
                duration: 2500,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
