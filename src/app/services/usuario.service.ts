import { Injectable } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  collectionData
} from '@angular/fire/firestore';
import { Observable, map, switchMap, of } from 'rxjs';

export type RolUsuario = 'padre' | 'director';

export interface UsuarioApp {
  uid: string;
  nombre: string;
  correo: string | null;
  rol: RolUsuario | 'desconocido';
  rawAuthUser: User;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  /**
   * Stream con el usuario autenticado + metadatos en colección `usuarios`.
   */
  usuarioActual$(): Observable<UsuarioApp | null> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) {
          return of(null);
        }

        const usuariosRef = collection(this.firestore, 'usuarios');
        const q = query(usuariosRef, where('uid', '==', user.uid));

        return collectionData(q, { idField: 'id' }).pipe(
          map((items: any[]) => {
            const meta = items[0] || {};
            const rol: RolUsuario | 'desconocido' =
              meta.rol === 'padre' || meta.rol === 'director'
                ? meta.rol
                : 'desconocido';

            return {
              uid: user.uid,
              nombre: meta.nombre || user.displayName || 'Usuario',
              correo: user.email ?? null,
              rol,
              rawAuthUser: user
            } as UsuarioApp;
          })
        );
      })
    );
  }
}


