import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-solicitar-reunion',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './solicitar-reunion.page.html',
  styleUrls: ['./solicitar-reunion.page.scss'],
})
export class SolicitarReunionPage {

  notificationCount = 1;
  userDocID!: string;

  form = this.fb.group({
    asunto: ['', [Validators.required, Validators.maxLength(120)]],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    mensaje: ['']
  });

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id')!;
    console.log("ID del padre:", this.userDocID);
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'reuniones-programadas-padre']);
  }

  goNotificaciones() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateForward(['/', this.userDocID, 'notificaciones-padre']);
  }

  async onSubmit() {
    if (this.form.invalid) {
      const t = await this.toastCtrl.create({
        message: 'Complete los campos obligatorios',
        duration: 1800,
        color: 'warning'
      });
      t.present();
      this.form.markAllAsTouched();
      return;
    }

    console.log("Datos enviados:", this.form.value);

    const toast = await this.toastCtrl.create({
      message: 'Solicitud enviada',
      duration: 1500,
      color: 'success'
    });
    await toast.present();
    (document.activeElement as HTMLElement | null)?.blur();
    this.navCtrl.navigateBack(['/', this.userDocID, 'reuniones-programadas-padre']);
  }
}
