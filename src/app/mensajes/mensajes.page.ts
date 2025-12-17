import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Subscription, switchMap } from 'rxjs';
import { MensajesService, Conversacion, Mensaje } from '../services/mensajes.service';
import { UsuarioService, UsuarioApp } from '../services/usuario.service';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss']
})
export class MensajesPage implements OnInit, OnDestroy {
  userDocID!: string;
  usuarioActual: UsuarioApp | null = null;
  rolActual: 'padre' | 'director' | 'desconocido' = 'desconocido';

  conversaciones: Conversacion[] = [];
  conversacionesFiltradas: Conversacion[] = [];
  conversacionSeleccionada: Conversacion | null = null;

  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  buscando = '';

  // Para director: lista de padres disponibles
  padresDisponibles: UsuarioApp[] = [];
  mostrandoListaPadres = false;

  private subUsuario?: Subscription;
  private subConversaciones?: Subscription;
  private subMensajes?: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private mensajesService: MensajesService,
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("User ID:", this.userDocID);
    // Escuchar usuario autenticado
    this.subUsuario = this.usuarioService
      .usuarioActual$()
      .pipe(
        switchMap(usuario => {
          this.usuarioActual = usuario;
          this.rolActual = usuario?.rol ?? 'desconocido';

          if (!usuario) {
            return [];
          }

          // Cargar conversaciones del usuario
          this.subConversaciones?.unsubscribe();
          this.subConversaciones = this.mensajesService
            .obtenerConversacionesDeUsuario(usuario.uid)
            .subscribe(async convs => {
              this.conversaciones = convs;
              this.filtrarConversaciones(this.buscando);

              // Si es padre y aún no tiene conversación, crear una por defecto
              if (this.rolActual === 'padre' && convs.length === 0) {
                await this.crearConversacionPorDefectoParaPadre(usuario);
              }

              // Si es director, cargar lista de padres disponibles
              if (this.rolActual === 'director') {
                await this.cargarPadresDisponibles(usuario);
              }
            });

          return [];
        })
      )
      .subscribe();
  }

  goBack() {
    if (this.rolActual === 'director') {
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', this.userDocID, 'menu-principal']);
    } else if (this.rolActual === 'padre') {
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', this.userDocID, 'menu-principal-padre']);
    } else {
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', this.userDocID, 'entrada']);
    }
  }

  ngOnDestroy(): void {
    this.subUsuario?.unsubscribe();
    this.subConversaciones?.unsubscribe();
    this.subMensajes?.unsubscribe();
  }

  filtrarConversaciones(texto: string) {
    this.buscando = texto;
    const term = texto.toLowerCase();

    this.conversacionesFiltradas = this.conversaciones.filter(c => {
      const nombreOtro = this.obtenerNombreOtro(c).toLowerCase();
      return nombreOtro.includes(term) || c.ultimoMensaje.toLowerCase().includes(term);
    });
  }

  seleccionarConversacion(conv: Conversacion) {
    this.conversacionSeleccionada = conv;

    this.subMensajes?.unsubscribe();
    if (!conv.id) {
      return;
    }

    this.subMensajes = this.mensajesService
      .obtenerMensajes(conv.id)
      .subscribe(msgs => (this.mensajes = msgs));
  }

  obtenerNombreOtro(conv: Conversacion): string {
    if (!this.usuarioActual) {
      return 'Conversación';
    }

    return this.usuarioActual.uid === conv.padreUid
      ? conv.directorNombre
      : conv.padreNombre;
  }

  esMio(msg: Mensaje): boolean {
    return this.usuarioActual != null && msg.remitenteUid === this.usuarioActual.uid;
  }

  async enviarMensaje() {
    if (!this.usuarioActual || !this.conversacionSeleccionada) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona una conversación primero.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const texto = this.nuevoMensaje.trim();
    if (!texto) {
      return;
    }

    if (!this.conversacionSeleccionada.id) {
      const toast = await this.toastCtrl.create({
        message: 'Error: La conversación no tiene ID. Intenta seleccionarla nuevamente.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    const soyPadre = this.usuarioActual.uid === this.conversacionSeleccionada.padreUid;
    const destinatario: UsuarioApp = {
      uid: soyPadre
        ? this.conversacionSeleccionada.directorUid
        : this.conversacionSeleccionada.padreUid,
      nombre: soyPadre
        ? this.conversacionSeleccionada.directorNombre
        : this.conversacionSeleccionada.padreNombre,
      correo: null,
      rol: soyPadre ? 'director' : 'padre',
      rawAuthUser: this.usuarioActual.rawAuthUser
    };

    try {
      await this.mensajesService.enviarMensaje(
        this.conversacionSeleccionada,
        this.usuarioActual,
        destinatario,
        texto
      );
      this.nuevoMensaje = '';
    } catch (e: any) {
      console.error('Error al enviar mensaje:', e);
      const mensajeError = e?.message || 'Error desconocido';
      const toast = await this.toastCtrl.create({
        message: `No se pudo enviar el mensaje: ${mensajeError}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  /**
   * Crea automáticamente una conversación padre-director tomando
   * el primer director registrado en la colección `usuarios`.
   */
  private async crearConversacionPorDefectoParaPadre(padre: UsuarioApp) {
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('rol', '==', 'director'));
      const snap = await getDocs(q);

      if (snap.empty) {
        console.warn('No se encontró ningún director en la base de datos');
        return;
      }

      const docData = snap.docs[0].data() as any;
      const director: UsuarioApp = {
        uid: docData.uid,
        nombre: docData.nombre || 'Director',
        correo: docData.correo ?? null,
        rol: 'director',
        rawAuthUser: padre.rawAuthUser
      };

      await this.mensajesService.obtenerOCrearConversacion(padre, director);
    } catch (e: any) {
      console.error('Error al crear conversación por defecto:', e);
    }
  }

  /**
   * Carga la lista de padres disponibles para que el director pueda iniciar conversaciones.
   */
  private async cargarPadresDisponibles(director: UsuarioApp) {
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('rol', '==', 'padre'));
      const snap = await getDocs(q);

      this.padresDisponibles = snap.docs.map(doc => {
        const data = doc.data() as any;
        return {
          uid: data.uid,
          nombre: data.nombre || 'Padre',
          correo: data.correo ?? null,
          rol: 'padre' as const,
          rawAuthUser: director.rawAuthUser
        } as UsuarioApp;
      });
    } catch (e: any) {
      console.error('Error al cargar padres disponibles:', e);
      this.padresDisponibles = [];
    }
  }

  /**
   * Permite al director iniciar una conversación con un padre seleccionado.
   */
  async iniciarConversacionConPadre(padre: UsuarioApp) {
    if (!this.usuarioActual || this.rolActual !== 'director') {
      return;
    }

    try {
      const conversacion = await this.mensajesService.obtenerOCrearConversacion(
        padre,
        this.usuarioActual
      );

      // Seleccionar la conversación recién creada
      this.conversacionSeleccionada = conversacion;
      this.mostrandoListaPadres = false;

      // Cargar mensajes de la conversación
      if (conversacion.id) {
        this.subMensajes?.unsubscribe();
        this.subMensajes = this.mensajesService
          .obtenerMensajes(conversacion.id)
          .subscribe(msgs => (this.mensajes = msgs));
      }

      const toast = await this.toastCtrl.create({
        message: `Conversación iniciada con ${padre.nombre}`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (e: any) {
      console.error('Error al iniciar conversación:', e);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo iniciar la conversación. Intenta nuevamente.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  /**
   * Muestra/oculta la lista de padres disponibles (solo para director).
   */
  toggleListaPadres() {
    if (this.rolActual === 'director') {
      this.mostrandoListaPadres = !this.mostrandoListaPadres;
    }
  }
}

