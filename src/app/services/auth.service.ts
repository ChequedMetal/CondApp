// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  authState,
  User as FirebaseUser,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  docData,
  DocumentReference,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';

export interface AppUser {
  uid: string;
  email: string;
  nombre: string;
  role: 'admin' | 'usuario';
  rut?: string;
  casa?: string;
  // añadimos whatsapp aquí
  whatsapp?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Observable de estado de autenticación
  authState$ = authState(this.auth);

  // Observable del perfil extendido en Firestore, ahora con whatsapp
  appUser$: Observable<AppUser | null> = this.authState$.pipe(
    switchMap((user: FirebaseUser | null) => {
      if (!user) return of(null);
      const userRef = doc(
        this.firestore,
        `users/${user.uid}`
      ) as DocumentReference<DocumentData>;
      return docData(userRef).pipe(
        take(1),
        map((data: any) => {
          if (!data || !data.role) return null;
          return {
            uid: user.uid,
            email: user.email || '',
            nombre: data.nombre,
            role: data.role,
            rut: data.rut,
            casa: data.casa,
            // mapeamos data.celular como whatsapp
            whatsapp: data.celular || ''
          } as AppUser;
        }),
        catchError(err => {
          console.error('Error al cargar perfil Firestore', err);
          return of(null);
        })
      );
    })
  );

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  /** Registra un nuevo usuario y crea su perfil en Firestore */
  async registrarUsuario(data: {
    correo: string;
    password: string;
    nombre: string;
    role?: 'admin' | 'usuario';
    rut: string;
    celular: string;
    casa: string;
  }): Promise<void> {
    const { correo, password, nombre, role = 'usuario', rut, celular, casa } = data;
    const currentUser = this.auth.currentUser;
    try {
      if (currentUser) {
        await signOut(this.auth);
      }
      const cred = await createUserWithEmailAndPassword(this.auth, correo, password);
      const userRef = doc(this.firestore, `users/${cred.user.uid}`);
      await setDoc(userRef, {
        nombre,
        role,
        rut,
        celular,
        casa,
        email: correo
      });
      await signOut(this.auth);
      if (currentUser && currentUser.email) {
        const token = await currentUser.getIdToken();
        await signInWithEmailAndPassword(this.auth, currentUser.email, token);
      }
    } catch (error) {
      if (currentUser && currentUser.email) {
        await signInWithEmailAndPassword(this.auth, currentUser.email, await currentUser.getIdToken());
      }
      throw error;
    }
  }

  /** Login con email/contraseña */
  async login(email: string, password: string): Promise<UserCredential> {
    if (!email || !password) {
      throw new Error('El correo y la contraseña son requeridos');
    }
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      let msg = 'Error al iniciar sesión';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'Correo o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos. Intenta más tarde';
      } else if (error.code === 'auth/user-disabled') {
        msg = 'Esta cuenta ha sido deshabilitada';
      }
      throw new Error(msg);
    }
  }

  /** Logout */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  /** Obtiene token actual */
  async getAuthToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  /** Obtener el usuario actual */
  getCurrentUser() {
    return this.auth.currentUser;
  }

  /** Cambia la contraseña del usuario actual */
  async cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No hay un usuario autenticado. Por favor, inicia sesión nuevamente.');
    }

    // Reautenticación
    const credential = EmailAuthProvider.credential(user.email, contrasenaActual);
    await reauthenticateWithCredential(user, credential);

    if (contrasenaActual === nuevaContrasena) {
      throw new Error('La nueva contraseña debe ser diferente a la actual.');
    }

    await updatePassword(user, nuevaContrasena);
  }
}
