import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
// Dejamos el import arriba para no romper nada, pero no lo usaremos en el constructor
import { Storage } from '@angular/fire/storage';

@Component({
  selector: 'app-perfil-director',
  templateUrl: './perfil-director.page.html',
  styleUrls: ['./perfil-director.page.scss'],
  standalone: false 
})
export class PerfilDirectorPage implements OnInit {
  
  perfil = {
    nombre: '',
    correo: '',
    telefono: '',
    cargo: '',
    departamento: '',
    fotoUrl: 'assets/default-avatar.png'
  };

  userDocID: string = '';

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute
    // 🚨 IMPORTANTE: Aquí NO ponemos 'private storage: Storage'
    // Al quitarlo, evitamos el error de configuración al entrar.
  ) {}

  async ngOnInit() {
    this.userDocID = this.route.snapshot.paramMap.get('id') || '';
    if (this.userDocID) {
      await this.cargarDatos();
    }
  }

  async cargarDatos() {
    try {
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const datos = docSnap.data();
        this.perfil = { ...this.perfil, ...datos };
      }
    } catch (error) {
      console.error('Error cargando:', error);
    }
  }

  async guardarCambios() {
    if (!this.userDocID) return;

    const loading = await this.loadingController.create({
      message: 'Actualizando registro...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      
      await updateDoc(docRef, {
        nombre: this.perfil.nombre,
        telefono: this.perfil.telefono,
        cargo: this.perfil.cargo,
        departamento: this.perfil.departamento,
        fotoUrl: this.perfil.fotoUrl
      });

      await loading.dismiss();
      this.mostrarMensaje('¡Datos actualizados correctamente!', 'success');

    } catch (error) {
      console.error(error);
      await loading.dismiss();
      this.mostrarMensaje('Error al actualizar.', 'danger');
    }
  }

  // Navegación
  goBack() {
    (document.activeElement as HTMLElement | null)?.blur();
    this.router.navigate(['/', this.userDocID, 'menu-principal']);
  }

  goToNotificaciones() {
    if (this.userDocID) {
      (document.activeElement as HTMLElement | null)?.blur();
      this.router.navigate(['/', this.userDocID, 'notificaciones-director']);
    }
  }

  // --- LÓGICA DE FOTO SIN STORAGE ---

  subirFoto() {
    // Busca el input oculto en el HTML
    const fileInput = document.getElementById('fileInputDirector') as HTMLElement;
    if(fileInput) fileInput.click();
  }

  async cargarImagen(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validación de tamaño (Max 800kb aprox)
    if (file.size > 800000) {
      this.mostrarMensaje('Imagen muy grande. Usa una más pequeña.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando foto...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      // 1. Convertir a Base64 (Texto)
      const fotoBase64 = await this.convertirABase64(file);

      // 2. Guardar en Firestore directamente
      const docRef = doc(this.firestore, 'usuarios', this.userDocID);
      await updateDoc(docRef, {
        fotoUrl: fotoBase64
      });

      // 3. Actualizar vista
      this.perfil.fotoUrl = fotoBase64;

      await loading.dismiss();
      this.mostrarMensaje('Foto actualizada con éxito', 'success');

    } catch (error: any) {
      console.error(error);
      await loading.dismiss();
      this.mostrarMensaje('Error: ' + error.message, 'danger');
    }
  }

  // Función auxiliar para convertir archivo a texto
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