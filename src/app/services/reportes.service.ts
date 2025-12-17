import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, query, orderBy } from '@angular/fire/firestore';
import { addDoc } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Reporte {
  id?: string;
  tipoReporte: string;
  gradoSeccion: string;
  fecha: string;
  descripcion?: string;
  creadoEn?: any;
  actualizadoEn?: any;
  creadoPor?: string | null;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private coleccion = 'reportes';

  constructor(private firestore: Firestore) {}

  // Obtiene todos los reportes (ordenados por creadoEn descendente si existe)
  getReportes(): Observable<Reporte[]> {
    const colRef = collection(this.firestore, this.coleccion);
    // si quieres ordenar por creadoEn:
    try {
      const q = query(colRef, orderBy('creadoEn', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<Reporte[]>;
    } catch (err) {
      // si no existe creadoEn aún, devolver simple collectionData
      return collectionData(colRef, { idField: 'id' }) as Observable<Reporte[]>;
    }
  }

  // Obtener 1 reporte por id
  getReporteById(id: string) {
    const docRef = doc(this.firestore, `${this.coleccion}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Reporte | undefined>;
  }

  // Crear reporte (devuelve la promesa del addDoc)
  async crearReporte(data: Partial<Reporte>) {
    const colRef = collection(this.firestore, this.coleccion);
    const payload: any = {
      tipoReporte: data.tipoReporte || '',
      gradoSeccion: data.gradoSeccion || '',
      fecha: data.fecha || '',
      descripcion: data.descripcion || '',
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: data.creadoPor ?? null,
      estado: data.estado ?? 'activo'
    };
    return await addDoc(colRef, payload);
  }

  // Actualizar un reporte por id
  async actualizarReporte(id: string, data: Partial<Reporte>) {
    const docRef = doc(this.firestore, `${this.coleccion}/${id}`);
    const payload: any = {
      ...data,
      actualizadoEn: serverTimestamp()
    };
    return await updateDoc(docRef, payload);
  }

  // Eliminar reporte por id
  async eliminarReporte(id: string) {
    const docRef = doc(this.firestore, `${this.coleccion}/${id}`);
    return await deleteDoc(docRef);
  }
}
