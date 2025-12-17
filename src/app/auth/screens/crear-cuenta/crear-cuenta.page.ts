import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, IonInput } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

// 🔐 Importar Auth para crear cuenta
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-crear-cuenta',
  templateUrl: './crear-cuenta.page.html',
  styleUrls: ['./crear-cuenta.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CrearCuentaPage implements OnInit {

  cuentaForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: Auth   // ✅ Agregado: para Firebase Auth
  ) {}

  ngOnInit() {
    this.cuentaForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      confirmarContrasena: ['', Validators.required]
    }, {
      validators: this.passwordsIgualesValidator
    });
  }

  get correo() {
    return this.cuentaForm.get('correo');
  }

  passwordsIgualesValidator(group: FormGroup): ValidationErrors | null {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('confirmarContrasena')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  togglePassword(input: IonInput, field: 'main' | 'confirm') {
    if (field === 'main') {
      this.passwordVisible = !this.passwordVisible;
      input.type = this.passwordVisible ? 'text' : 'password';
    } else if (field === 'confirm') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
      input.type = this.confirmPasswordVisible ? 'text' : 'password';
    }
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/intro']);
  }

  async registrarCuenta() {
    if (this.cuentaForm.invalid) {
      this.cuentaForm.markAllAsTouched();
      return;
    }

    const { nombre, correo, contrasena } = this.cuentaForm.value;

    try {
      // ✅ Crear usuario con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, correo, contrasena);

      // ✅ Guardar solo nombre y correo en Firestore
      await addDoc(collection(this.firestore, 'usuarios'), {
        uid: userCredential.user.uid, // puedes guardar el UID si luego necesitas identificarlo
        nombre,
        correo,
        fechaRegistro: new Date()
      });

      alert('Cuenta registrada con éxito');
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/intro']);
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      alert(error.message || 'Ocurrió un error al registrar la cuenta');
    }
  }
}
