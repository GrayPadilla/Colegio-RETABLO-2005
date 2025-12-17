import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
// Puedes dejar este import aquí, no hace daño si no se usa
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-perfil-padre',
  templateUrl: './perfil-padre.page.html',
  styleUrls: ['./perfil-padre.page.scss'],
  standalone: false 
})
export class PerfilPadrePage implements OnInit {
  
  perfil = {
    nombres: '',
    correo: '',
    telefono: '',
    dni: '',
    fotoUrl: 'assets/default-avatar.png'
  };

  userDocID: string = '';

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    // 🚨 HE QUITADO 'private storage: Storage' DE AQUÍ.
    // Esto es lo que hacía que tu página fallara al entrar.
    // No necesitas borrar el import de arriba, pero sí quitarlo de aquí.
  ) {}

  async ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id') || '';
    if (this.userDocID) {
      await this.cargarDatos();
    }
  }

  goToNotificaciones() {
    if (this.userDocID) {
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', this.userDocID, 'notificaciones-padre']);
    }
  }

  async cargarDatos() {
    try {
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const datos = docSnap.data();
        this.perfil = { ...this.perfil, ...datos };
        
        if(datos['nombre']) this.perfil.nombres = datos['nombre'];
        if(datos['nombres']) this.perfil.nombres = datos['nombres'];
      }
    } catch (error) {
      console.error('Error cargando perfil padre:', error);
    }
  }

  async guardarCambios() {
    if (!this.userDocID) return;

    const loading = await this.loadingController.create({
      message: 'Actualizando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      
      await updateDoc(docRef, {
        nombre: this.perfil.nombres,
        telefono: this.perfil.telefono,
        dni: this.perfil.dni,
        fotoUrl: this.perfil.fotoUrl
      });

      await loading.dismiss();
      this.mostrarMensaje('¡Perfil actualizado correctamente!', 'success');

    } catch (error) {
      console.error(error);
      await loading.dismiss();
      this.mostrarMensaje('Error al guardar.', 'danger');
    }
  }

  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'menu-principal-padre']);
  }

  subirFoto() {
    const fileInput = document.getElementById('fileInputPadre') as HTMLElement;
    if(fileInput) fileInput.click();
  }

  // 👇 ESTA ES LA FUNCIÓN NUEVA QUE NO USA STORAGE 👇
  async cargarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validación de seguridad para que la app no se ponga lenta
    if (file.size > 800000) { // Limite aprox de 800kb
      this.mostrarMensaje('Imagen muy grande. Usa una más pequeña.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando foto...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Truco: Convertimos la foto a letras (Base64)
      const fotoBase64 = await this.convertirABase64(file);

      // Guardamos directamente en la base de datos (Firestore)
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      await updateDoc(docRef, { fotoUrl: fotoBase64 });

      // Actualizamos la pantalla
      this.perfil.fotoUrl = fotoBase64;
      
      await loading.dismiss();
      this.mostrarMensaje('Foto actualizada', 'success');

    } catch (error: any) {
      console.error(error);
      await loading.dismiss();
      this.mostrarMensaje('Error: ' + error.message, 'danger');
    }
  }

  // Función auxiliar necesaria para el truco
  convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}