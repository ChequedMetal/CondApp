// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  UserCredential,
  AuthError,
  authState
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  docData, 
  DocumentReference,
  DocumentData
} from '@angular/fire/firestore';
import { 
  Observable, 
  from, 
  of, 
  throwError 
} from 'rxjs';
import { 
  catchError, 
  map, 
  switchMap, 
  take 
} from 'rxjs/operators';

export interface AppUser {
  uid: string;
  email: string;
  nombre: string;
  role: 'admin' | 'usuario';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Observable del estado de autenticación de Firebase
  authState$ = authState(this.auth);
  
  // Información del usuario autenticado con datos extendidos de Firestore
  appUser$: Observable<AppUser | null> = this.authState$.pipe(
    switchMap((user: FirebaseUser | null) => {
      console.log('AuthState cambió, usuario:', user?.email);
      if (!user) {
        console.log('No hay usuario autenticado');
        return of(null);
      }
      
      const userDoc = doc(this.firestore, `users/${user.uid}`) as DocumentReference<DocumentData>;
      console.log('Obteniendo datos de usuario de Firestore...');
      
      return docData(userDoc, { idField: 'uid' }).pipe(
        map((userData: any) => {
          console.log('Datos del usuario desde Firestore:', userData);
          
          if (!userData) {
            console.error('No se encontraron los datos del usuario en Firestore');
            throw new Error('No se encontraron los datos del usuario');
          }
          
          const userWithRole = {
            uid: user.uid,
            email: user.email || '',
            nombre: userData.nombre || 'Usuario',
            role: userData.role || 'usuario'
          } as AppUser;
          
          console.log('Usuario procesado con role:', userWithRole.role);
          return userWithRole;
        }),
        catchError(error => {
          console.error('Error al obtener datos del usuario:', error);
          return throwError(() => new Error('Error al cargar los datos del usuario'));
        })
      );
    })
  );

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  /**
   * Inicia sesión con email y contraseña
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @returns Promesa con el resultado del inicio de sesión
   */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      if (!email || !password) {
        throw new Error('El correo y la contraseña son requeridos');
      }
      
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        // Opcional: requerir verificación de email
        // await sendEmailVerification(userCredential.user);
        // throw new Error('Por favor verifica tu correo electrónico');
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mapear errores comunes de Firebase a mensajes más amigables
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Correo o contraseña incorrectos';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns Promesa que se resuelve cuando se cierra la sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  /**
   * Obtiene el token de autenticación actual
   * @returns Promesa con el token de autenticación o null si no hay usuario autenticado
   */
  async getAuthToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }
}
