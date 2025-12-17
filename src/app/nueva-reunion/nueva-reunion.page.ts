import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReunionesService, Reunion, UserItem } from '../services/reuniones.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nueva-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './nueva-reunion.page.html',
  styleUrls: ['./nueva-reunion.page.scss'],
})
export class NuevaReunionPage implements OnInit, OnDestroy {

  asunto = '';
  participantesInput = '';
  participantes: { nombre: string, correo: string, id?: string }[] = [];

  suggestionsParticipantes: UserItem[] = [];
  allUsers: UserItem[] = [];
  usuariosSub?: Subscription;

  fecha = '';
  hora = '';
  descripcion = '';
  duracion = '';
  ubicacion = '';
  meetingIdZoom = '';

  responsableInput = '';
  responsableSelected: UserItem | null = null;

  requiereConfirmacion = false;
  observaciones = '';
  loadingUsers = false;

  userDocID!: string; // ID DEL DIRECTOR

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private reunionesService: ReunionesService,
    private route: ActivatedRoute
  ) {}

  // ==================================================
  // INIT
  // ==================================================
  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log('ID recibido en nueva-reunion:', this.userDocID);

    this.loadingUsers = true;

    // RESPONSABLE FIJO
    this.responsableSelected = {
      correo: 'aangullasm@ucvvirtual.edu.pe',
      nombre: 'ANDERSON SMITH ANGULLA SANTA CRUZ'
    };

    this.responsableInput =
      `${this.responsableSelected.nombre} (${this.responsableSelected.correo})`;

    // Cargar usuarios (padres)
    this.usuariosSub = this.reunionesService.obtenerUsuarios().subscribe(users => {
      this.allUsers = users || [];
      this.loadingUsers = false;
    });
  }

  ngOnDestroy() {
    this.usuariosSub?.unsubscribe();
  }

  // ==================================================
  // NAVEGACIÓN
  // ==================================================
  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'reuniones-programadas-director']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-director']);
  }

  // ==================================================
  // PARTICIPANTES
  // ==================================================
  onParticipantesInputChange() {
    const q = this.participantesInput.trim().toLowerCase();
    if (!q) {
      this.suggestionsParticipantes = [];
      return;
    }

    this.suggestionsParticipantes = this.allUsers
      .filter(u => {
        if (u.rol !== 'padre') return false;
        return (
          (u.correo || '').toLowerCase().includes(q) ||
          (u.nombre || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }

  selectSuggestion(user: UserItem) {
    const existe = this.participantes.find(p => p.correo === user.correo);

    if (!existe) {
      this.participantes.push({
        nombre: user.nombre,
        correo: user.correo,
        id: user.id || undefined
      });
    }

    this.participantesInput = '';
    this.suggestionsParticipantes = [];
  }

  removeParticipant(correo: string) {
    this.participantes = this.participantes.filter(p => p.correo !== correo);
  }

  // ==================================================
  // GENERAR ZOOM
  // ==================================================
  async crearZoom() {
    if (!this.asunto || !this.fecha || !this.hora) {
      const t = await this.toastCtrl.create({
        message: 'Primero llena asunto, fecha y hora.',
        duration: 1400,
        color: 'warning'
      });
      await t.present();
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/create-zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asunto: this.asunto,
          fecha: this.fecha,
          hora: this.hora
        })
      });

      const data = await res.json();

      if (!data.success) throw new Error('Zoom error');

      this.ubicacion = data.join_url;
      this.meetingIdZoom = data.meeting_id;

      const t = await this.toastCtrl.create({
        message: 'Zoom generado correctamente.',
        duration: 1500,
        color: 'success'
      });
      t.present();

    } catch (err) {
      console.error(err);
      const t = await this.toastCtrl.create({
        message: 'Error generando Zoom.',
        duration: 2000,
        color: 'danger'
      });
      t.present();
    }
  }

  // ==================================================
  // GUARDAR REUNIÓN (SEGURO)
  // ==================================================
  async guardarReunion() {
    if (!this.asunto || !this.fecha || !this.hora) {
      const t = await this.toastCtrl.create({
        message: 'Complete los campos obligatorios.',
        duration: 1800,
        color: 'warning'
      });
      await t.present();
      return;
    }

    const participantesFinal = this.participantes.map(p => ({
      nombre: p.nombre,
      correo: p.correo,
      id: p.id
    }));

    const participantIds = participantesFinal
      .map(p => p.id)
      .filter((id): id is string => !!id);

    const nueva: Reunion = {
      asunto: this.asunto,
      participantes: participantesFinal,
      participantIds,
      fecha: this.fecha,
      hora: this.hora,
      ubicacion: this.ubicacion,
      meetingIdZoom: this.meetingIdZoom,
      duracion: this.duracion,
      descripcion: this.descripcion,
      observaciones: this.observaciones,
      requiereConfirmacion: this.requiereConfirmacion,
      responsable: this.responsableSelected,
      createdBy: this.userDocID,
      createdAt: new Date()
    };

    try {
      await this.reunionesService.guardarReunion(nueva);

      const t = await this.toastCtrl.create({
        message: 'Reunión registrada correctamente',
        duration: 1500,
        color: 'success'
      });
      t.present();

      this.navCtrl.navigateBack(['/', this.userDocID, 'reuniones-programadas-director']);

    } catch (err) {
      console.error(err);
      const t = await this.toastCtrl.create({
        message: 'Error al guardar reunión',
        duration: 1800,
        color: 'danger'
      });
      t.present();
    }
  }
}
