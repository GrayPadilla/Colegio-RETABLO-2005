import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  collectionData,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, defer, map, switchMap } from 'rxjs';
import { UsuarioApp } from './usuario.service';

export interface Conversacion {
  id?: string;
  miembrosIds: string[]; // [uidPadre, uidDirector]
  padreUid: string;
  padreNombre: string;
  directorUid: string;
  directorNombre: string;
  ultimoMensaje: string;
  ultimoAutorUid: string;
  ultimoTimestamp: any;
}

export interface Mensaje {
  id?: string;
  texto: string;
  remitenteUid: string;
  remitenteNombre: string;
  destinatarioUid: string;
  destinatarioNombre: string;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  constructor(private firestore: Firestore) {}

  private conversacionesCollection() {
    return collection(this.firestore, 'conversaciones');
  }

  /**
   * Obtiene (o crea) una conversación entre un padre y un director.
   */
  obtenerOCrearConversacion(
    padre: UsuarioApp,
    director: UsuarioApp
  ): Promise<Conversacion> {
    const ref = this.conversacionesCollection();
    const q = query(
      ref,
      where('padreUid', '==', padre.uid),
      where('directorUid', '==', director.uid)
    );

    return defer(() =>
      collectionData(q, { idField: 'id' }) as Observable<Conversacion[]>
    )
      .pipe(
        switchMap(async (items) => {
          if (items.length > 0) {
            return items[0];
          }

          const docRef = await addDoc(ref, {
            miembrosIds: [padre.uid, director.uid],
            padreUid: padre.uid,
            padreNombre: padre.nombre,
            directorUid: director.uid,
            directorNombre: director.nombre,
            ultimoMensaje: '',
            ultimoAutorUid: '',
            ultimoTimestamp: serverTimestamp()
          });

          return {
            id: docRef.id,
            miembrosIds: [padre.uid, director.uid],
            padreUid: padre.uid,
            padreNombre: padre.nombre,
            directorUid: director.uid,
            directorNombre: director.nombre,
            ultimoMensaje: '',
            ultimoAutorUid: '',
            ultimoTimestamp: serverTimestamp()
          } as Conversacion;
        })
      )
      .toPromise() as Promise<Conversacion>;
  }

  /**
   * Lista de conversaciones en las que participa el usuario actual.
   */
  obtenerConversacionesDeUsuario(uid: string): Observable<Conversacion[]> {
    const q = query(
      this.conversacionesCollection(),
      where('miembrosIds', 'array-contains', uid),
      orderBy('ultimoTimestamp', 'desc')
    );

    return defer(
      () => collectionData(q, { idField: 'id' }) as Observable<Conversacion[]>
    );
  }

  /**
   * Stream de mensajes de una conversación.
   */
  obtenerMensajes(conversacionId: string): Observable<Mensaje[]> {
    const ref = collection(
      this.firestore,
      `conversaciones/${conversacionId}/mensajes`
    );
    const q = query(ref, orderBy('timestamp', 'asc'));

    return defer(
      () => collectionData(q, { idField: 'id' }) as Observable<Mensaje[]>
    );
  }

  /**
   * Envía un mensaje dentro de una conversación ya creada.
   */
  async enviarMensaje(
    conversacion: Conversacion,
    remitente: UsuarioApp,
    destinatario: UsuarioApp,
    texto: string
  ): Promise<void> {
    const mensajesRef = collection(
      this.firestore,
      `conversaciones/${conversacion.id}/mensajes`
    );

    await addDoc(mensajesRef, {
      texto,
      remitenteUid: remitente.uid,
      remitenteNombre: remitente.nombre,
      destinatarioUid: destinatario.uid,
      destinatarioNombre: destinatario.nombre,
      timestamp: serverTimestamp()
    });

    // Actualizar datos de la conversación (último mensaje)
    if (conversacion.id) {
      const convRef = doc(
        this.firestore,
        `conversaciones/${conversacion.id}`
      ) as DocumentReference;

      await updateDoc(convRef, {
        ultimoMensaje: texto,
        ultimoAutorUid: remitente.uid,
        ultimoTimestamp: serverTimestamp()
      });
    }
  }
}


