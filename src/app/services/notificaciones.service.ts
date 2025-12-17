import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable, defer, map, combineLatest } from 'rxjs';
import { RolUsuario, UsuarioApp } from './usuario.service';

export interface Comentario {
  uid: string;
  nombre: string;
  comentario: string;
  fecha: any;
}

export interface Notificacion {
  id?: string;
  titulo: string;
  mensaje: string;
  fecha?: string;
  hora?: string;
  creadoPorUid: string;
  creadoPorNombre: string;
  creadoPorRol: RolUsuario | 'desconocido';
  destinatariosRoles: RolUsuario[]; // ej: ['padre']
  destinatariosUids?: string[]; // opcional para notificación puntual
  creadaEn: any;
  comentarios?: Comentario[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  constructor(private firestore: Firestore) {}

  private notificacionesCollection() {
    return collection(this.firestore, 'notificaciones');
  }

  crearNotificacionParaPadres(
    creador: UsuarioApp,
    titulo: string,
    mensaje: string,
    fecha?: string,
    hora?: string
  ): Promise<void> {
    return addDoc(this.notificacionesCollection(), {
      titulo,
      mensaje,
      fecha: fecha || null,
      hora: hora || null,
      creadoPorUid: creador.uid,
      creadoPorNombre: creador.nombre,
      creadoPorRol: creador.rol,
      destinatariosRoles: ['padre'],
      creadaEn: serverTimestamp()
    }).then(() => undefined);
  }

  crearNotificacionIndividual(
    creador: UsuarioApp,
    destinatarioUid: string,
    titulo: string,
    mensaje: string
  ): Promise<void> {
    return addDoc(this.notificacionesCollection(), {
      titulo,
      mensaje,
      creadoPorUid: creador.uid,
      creadoPorNombre: creador.nombre,
      creadoPorRol: creador.rol,
      destinatariosRoles: [],
      destinatariosUids: [destinatarioUid],
      creadaEn: serverTimestamp()
    }).then(() => undefined);
  }

  editarNotificacion(
    id: string,
    titulo: string,
    mensaje: string,
    fecha?: string,
    hora?: string
  ): Promise<void> {
    const notifRef = doc(this.firestore, 'notificaciones', id);
    return updateDoc(notifRef, {
      titulo,
      mensaje,
      fecha: fecha || null,
      hora: hora || null
    });
  }

  agregarComentario(
    id: string,
    comentario: Omit<Comentario, 'fecha'>
  ): Promise<void> {
    const notifRef = doc(this.firestore, 'notificaciones', id);
    const nuevoComentario: Comentario = {
      ...comentario,
      fecha: serverTimestamp()
    };
    return updateDoc(notifRef, {
      comentarios: arrayUnion(nuevoComentario)
    });
  }

  eliminarNotificacion(id: string): Promise<void> {
    const notifRef = doc(this.firestore, 'notificaciones', id);
    return deleteDoc(notifRef);
  }

  /**
    * Notificaciones para un usuario (por rol general + específicas a su UID).
    */
  notificacionesParaUsuario(
    uid: string,
    rol: RolUsuario | 'desconocido'
  ): Observable<Notificacion[]> {
    const base = this.notificacionesCollection();

    const qRol =
      rol === 'desconocido'
        ? null
        : query(
            base,
            where('destinatariosRoles', 'array-contains', rol)
          );

    const qUid = query(
      base,
      where('destinatariosUids', 'array-contains', uid)
    );

    const obsRol: Observable<Notificacion[]> =
      qRol == null
        ? defer(() => Promise.resolve([] as Notificacion[]))
        : (defer(
            () =>
              collectionData(qRol, { idField: 'id' }) as Observable<
                Notificacion[]
              >
          ) as Observable<Notificacion[]>);

    const obsUid = defer(
      () => collectionData(qUid, { idField: 'id' }) as Observable<Notificacion[]>
    );

    return combineLatest([obsRol, obsUid]).pipe(
      map(([porRol, porUid]) => {
        const mapById = new Map<string, Notificacion>();
        [...porRol, ...porUid].forEach((n) => {
          if (n.id) {
            mapById.set(n.id, n);
          }
        });
        return Array.from(mapById.values()).sort((a, b) => {
          const ta = (a.creadaEn?.seconds || 0) as number;
          const tb = (b.creadaEn?.seconds || 0) as number;
          return tb - ta;
        });
      })
    );
  }

  /**
   * Notificaciones creadas por un usuario (para mostrar historial de envíos).
   */
  notificacionesCreadasPorUsuario(uid: string): Observable<Notificacion[]> {
    const q = query(
      this.notificacionesCollection(),
      where('creadoPorUid', '==', uid)
    );
    return (collectionData(q, { idField: 'id' }) as Observable<Notificacion[]>).pipe(
      map(notifs => notifs.sort((a, b) => {
        const ta = (a.creadaEn?.seconds || 0) as number;
        const tb = (b.creadaEn?.seconds || 0) as number;
        return tb - ta;
      }))
    );
  }
}


