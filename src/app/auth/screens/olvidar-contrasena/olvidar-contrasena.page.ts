import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-olvidar-contrasena',
  templateUrl: './olvidar-contrasena.page.html',
  styleUrls: ['./olvidar-contrasena.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OlvidarContrasenaPage implements OnInit {

  cuentaForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.cuentaForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  get correo() {
    return this.cuentaForm.get('correo');
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/intro']);
  }

  async confirmar() {
    if (!this.cuentaForm.valid) return;

    const correoIngresado = this.cuentaForm.value.correo;

    // Verificar si el correo existe en la colección 'usuarios'
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('correo', '==', correoIngresado));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert('El correo no ha sido registrado.');
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, correoIngresado);
      alert('Se ha enviado un enlace para restablecer la contraseña a tu correo.');
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/restablecer-contrasena']);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      alert('Ocurrió un error al enviar el enlace de recuperación.');
    }
  }
}
