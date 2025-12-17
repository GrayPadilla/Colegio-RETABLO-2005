import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, IonInput, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential
} from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, addDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IntroPage implements OnInit {

  passwordVisible = false;
  loginForm!: FormGroup;
  rol: 'padre' | 'director' = 'padre';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: Auth,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const receivedRol = params.get('rol') as 'padre' | 'director' | null;
      if (receivedRol) this.rol = receivedRol;
    });

    this.loginForm = this.fb.group({
      nombre: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  togglePassword(input: IonInput) {
    this.passwordVisible = !this.passwordVisible;
    input.type = this.passwordVisible ? 'text' : 'password';
  }

  goToRegister() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/crear-cuenta']);
  }

  async mostrarAlerta(header: string, mensaje: string) {
    const alert = await this.alertController.create({
      header,
      message: mensaje,
      buttons: ['Aceptar'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  private esCorreoInstitucional(correo: string | null | undefined): boolean {
    if (!correo) return false;
    return correo.toLowerCase().endsWith('@ucvvirtual.edu.pe');
  }

  private async pedirPasswordDirector(): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Crear contraseña',
        message: 'Ingrese una contraseña para usar con su correo institucional.',
        inputs: [
          { name: 'password', type: 'password', placeholder: 'Contraseña' },
          { name: 'confirm', type: 'password', placeholder: 'Repetir contraseña' }
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => resolve(null) },
          {
            text: 'Guardar',
            handler: (data) => {
              if (!data.password || data.password.length < 6) {
                this.mostrarAlerta('Error', 'La contraseña debe tener al menos 6 caracteres.');
                return false;
              }
              if (data.password !== data.confirm) {
                this.mostrarAlerta('Error', 'Las contraseñas no coinciden.');
                return false;
              }
              resolve(data.password);
              return true;
            }
          }
        ],
        cssClass: 'custom-alert'
      });

      await alert.present();
    });
  }

  // 🔐 LOGIN NORMAL
  async iniciarSesion() {
    const { nombre, contrasena } = this.loginForm.value;

    // DIRECTOR
    if (this.rol === 'director') {
      const correo = nombre as string;

      if (!this.esCorreoInstitucional(correo)) {
        await this.mostrarAlerta('Correo no permitido', 'Debe usar @ucvvirtual.edu.pe');
        return;
      }

      try {
        await signInWithEmailAndPassword(this.auth, correo, contrasena);

        const usuariosRef = collection(this.firestore, 'usuarios');
        const q = query(usuariosRef, where('correo', '==', correo));
        const snap = await getDocs(q);

        const docID = snap.docs[0].id;

        await this.mostrarAlerta('Bienvenido', correo);

        // 🚨 SOLO ESTO SE MODIFICA
        (document.activeElement as HTMLElement | null)?.blur();
        this.router.navigate(['/', docID, 'menu-principal']);

      } catch (error) {
        await this.mostrarAlerta('Error', 'Correo o contraseña incorrectos');
      }

      return;
    }

    // PADRE
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('nombre', '==', nombre));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await this.mostrarAlerta('Error', 'Usuario no encontrado');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const correoPadre = userDoc.data()['correo'];

    try {
      await signInWithEmailAndPassword(this.auth, correoPadre, contrasena);
      await this.mostrarAlerta('Bienvenido', nombre);

      // 🚨 SOLO ESTO SE MODIFICA
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', userDoc.id, 'menu-principal-padre']);

    } catch (error) {
      await this.mostrarAlerta('Error', 'Correo o contraseña incorrectos');
    }
  }

  // 🔐 LOGIN CON GOOGLE
  async iniciarSesionConGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      // PADRE
      if (this.rol === 'padre') {
        const usuariosRef = collection(this.firestore, 'usuarios');
        const q = query(usuariosRef, where('correo', '==', user.email));
        const snap = await getDocs(q);

        let docID = '';

        if (snap.empty) {
          const newDoc = await addDoc(usuariosRef, {
            nombre: user.displayName || 'Sin nombre',
            correo: user.email,
            uid: user.uid,
            fechaRegistro: new Date(),
            rol: 'padre'
          });
          docID = newDoc.id;
        } else {
          docID = snap.docs[0].id;
        }

        await this.mostrarAlerta('Bienvenido', user.displayName || user.email || 'Usuario');

        // 🚨 SOLO ESTO SE MODIFICA
        (document.activeElement as HTMLElement | null)?.blur();
        this.router.navigate(['/', docID, 'menu-principal-padre']);
        return;
      }

      // DIRECTOR
      if (!this.esCorreoInstitucional(user.email)) {
        await this.mostrarAlerta('Correo no permitido', 'Debe usar @ucvvirtual.edu.pe');
        return;
      }

      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('correo', '==', user.email));
      const snap = await getDocs(q);

      let userDocRef;
      let docID = '';
      let userData: any = {};

      if (snap.empty) {
        userDocRef = await addDoc(usuariosRef, {
          nombre: user.displayName || 'Sin nombre',
          correo: user.email,
          uid: user.uid,
          fechaRegistro: new Date(),
          rol: 'director',
          tienePassword: false
        });
        docID = userDocRef.id;
        userData = { tienePassword: false };
      } else {
        userDocRef = snap.docs[0].ref;
        docID = snap.docs[0].id;
        userData = snap.docs[0].data();
      }

      if (user.email && !userData.tienePassword) {
        const password = await this.pedirPasswordDirector();
        if (!password) return;

        try {
          const credential = EmailAuthProvider.credential(user.email, password);
          await linkWithCredential(user, credential);
        } catch {}

        await updateDoc(userDocRef, { tienePassword: true });

        await this.mostrarAlerta('Contraseña creada', 'Ahora puede iniciar sesión normalmente.');
      }

      await this.mostrarAlerta('Bienvenido', user.displayName || user.email || 'Usuario');

      // 🚨 SOLO ESTO SE MODIFICA
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', docID, 'menu-principal']);

    } catch (error) {
      await this.mostrarAlerta('Error', 'Error al iniciar sesión con Google');
    }
  }
}