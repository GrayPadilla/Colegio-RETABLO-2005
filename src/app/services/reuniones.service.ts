import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, defer } from 'rxjs';

export interface Reunion {
  id?: string;
  asunto: string;
  participantes: { nombre: string; correo: string; id?: string }[];
  participantIds?: string[];
  fecha: string;
  hora: string;
  ubicacion?: string;
  meetingIdZoom?: string;
  duracion?: string;
  responsable?: { nombre: string; correo: string } | null;
  descripcion?: string;
  observaciones?: string;
  requiereConfirmacion?: boolean;
  createdBy?: string;
  createdAt?: any;
}

export interface UserItem {
  id?: string;
  nombre: string;
  correo: string;
  rol?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReunionesService {

  constructor(private firestore: Firestore, private injector: Injector) {}

  // ============================================================
  // 🔥 CLEANER PARA ELIMINAR UNDEFINED (NECESARIO PARA FIRESTORE)
  // ============================================================
  private clean(obj: any): any {
    if (obj === undefined) return undefined;
    if (obj === null) return null;

    if (Array.isArray(obj)) {
      return obj
        .map(x => this.clean(x))
        .filter(x => x !== undefined); // elimina undefined del array
    }

    if (typeof obj === 'object' && !(obj instanceof Date)) {
      const out: any = {};
      for (const key of Object.keys(obj)) {
        const value = this.clean(obj[key]);
        if (value !== undefined) {
          out[key] = value;
        }
      }
      return out;
    }

    return obj; // valores normales
  }

  // =====================================
  // 1️⃣ GUARDAR REUNIÓN (con limpieza)
  // =====================================
  async guardarReunion(data: Reunion) {

    // Por seguridad, vuelve a asignar responsable
    data.responsable = {
      correo: 'aangullasm@ucvvirtual.edu.pe',
      nombre: 'ANDERSON SMITH ANGULLA SANTA CRUZ',
    };

    const ref = collection(this.firestore, 'reuniones');

    let payload: any = {
      ...data,
      createdAt: data.createdAt ?? serverTimestamp(),
    };

    // ❗ LIMPIEZA NECESARIA PARA EVITAR EL ERROR DE FIRESTORE
    payload = this.clean(payload);

    return addDoc(ref, payload);
  }

  // =====================================
  // 2️⃣ OBTENER TODAS LAS REUNIONES (DIRECTOR)
  // =====================================
  obtenerReuniones(): Observable<Reunion[]> {
    const ref = collection(this.firestore, 'reuniones');

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(ref, { idField: 'id' }) as unknown as Observable<Reunion[]>
      )
    ) as Observable<Reunion[]>;
  }

  // =====================================
  // 3️⃣ OBTENER REUNIONES SOLO DEL PADRE
  // =====================================
  obtenerReunionesPorParticipante(participantId: string): Observable<Reunion[]> {
    const ref = collection(this.firestore, 'reuniones');
    const q = query(ref, where('participantIds', 'array-contains', participantId));

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(q, { idField: 'id' }) as unknown as Observable<Reunion[]>
      )
    ) as Observable<Reunion[]>;
  }

  // =====================================
  // 6️⃣ OBTENER REUNIONES POR FECHA (DIRECTOR)
  // =====================================
  obtenerReunionesPorFecha(fecha: string, directorId: string): Observable<Reunion[]> {
    const ref = collection(this.firestore, 'reuniones');
    const q = query(
      ref,
      where('fecha', '==', fecha),
      where('createdBy', '==', directorId)
    );

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(q, { idField: 'id' }) as Observable<Reunion[]>
      )
    );
  }

  // =====================================
  // 📅 OBTENER REUNIONES POR MES (DIRECTOR)
  // =====================================
  getReunionesPorMes(anio: number, mes: number) {
    const mesStr = String(mes + 1).padStart(2, '0');
    const inicio = `${anio}-${mesStr}-01`;
    const fin = `${anio}-${mesStr}-31`;

    const ref = collection(this.firestore, 'reuniones');
    const q = query(
      ref,
      where('fecha', '>=', inicio),
      where('fecha', '<=', fin)
    );

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(q, { idField: 'id' }) as Observable<Reunion[]>
      )
    );
  }

  // =====================================
  // 4️⃣ ELIMINAR REUNIÓN (Zoom + Firebase)
  // =====================================
  async eliminarReunion(id: string) {
    console.log('🗑️ Eliminando reunión ID:', id);

    const docRef = doc(this.firestore, `reuniones/${id}`);
    const snap = await getDoc(docRef);
    const data: any = snap.data();

    if (!data) {
      console.log('⚠️ La reunión no existe en Firebase');
      return;
    }

    const meetingIdZoom = data.meetingIdZoom;

    if (meetingIdZoom) {
      console.log('🗑️ Eliminando en Zoom meeting:', meetingIdZoom);

      await fetch('http://localhost:3000/delete-zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meetingIdZoom }),
      });
    }

    await deleteDoc(docRef);
    console.log('🗑️ Eliminado en Firebase');
  }

  // =====================================
  // 5️⃣ OBTENER USUARIOS
  // =====================================
  obtenerUsuarios(): Observable<UserItem[]> {
    const ref = collection(this.firestore, 'usuarios');

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        collectionData(ref, { idField: 'id' }) as unknown as Observable<UserItem[]>
      )
    ) as Observable<UserItem[]>;
  }
}
