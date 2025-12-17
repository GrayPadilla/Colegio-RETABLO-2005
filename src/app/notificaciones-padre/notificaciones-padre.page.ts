import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacionesService, Notificacion, Comentario } from '../services/notificaciones.service';
import { UsuarioService, UsuarioApp } from '../services/usuario.service';

@Component({
  selector: 'app-notificaciones-padre',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './notificaciones-padre.page.html',
  styleUrls: ['./notificaciones-padre.page.scss']
})
export class NotificacionesPadrePage implements OnInit, OnDestroy {

  userDocID!: string;

  usuarioActual: UsuarioApp | null = null;
  notificaciones: Notificacion[] = [];

  // Para comentarios
  comentarioNuevo: { [key: string]: string } = {};

  private subUsuario?: Subscription;
  private subNotifs?: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private notificacionesService: NotificacionesService,
    private toastCtrl: ToastController,
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
          .notificacionesParaUsuario(usuario.uid, usuario.rol)
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
    this.router.navigate(['/', this.userDocID, 'menu-principal-padre']);
  }

  async agregarComentario(notifId: string) {
    if (!this.usuarioActual) return;

    const comentario = this.comentarioNuevo[notifId]?.trim();
    if (!comentario) {
      const toast = await this.toastCtrl.create({
        message: 'Escribe un comentario.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      await this.notificacionesService.agregarComentario(notifId, {
        uid: this.usuarioActual.uid,
        nombre: this.usuarioActual.nombre,
        comentario
      });

      this.comentarioNuevo[notifId] = '';

      const toast = await this.toastCtrl.create({
        message: 'Comentario agregado.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (e) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo agregar el comentario.',
        duration: 2500,
        color: 'danger'
      });
      await toast.present();
    }
  }

  comentariosOrdenados(comentarios?: Comentario[]): Comentario[] {
    if (!comentarios) return [];
    return comentarios.sort((a, b) => {
      const ta = (a.fecha?.seconds || 0) as number;
      const tb = (b.fecha?.seconds || 0) as number;
      return ta - tb;
    });
  }
}
