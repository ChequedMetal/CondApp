import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './auth.service';

export interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  photoURL?: string;
  role: 'admin' | 'user';
  phoneNumber?: string;
  metadata: {
    creationTime: string | Date;
    lastSignInTime?: string | Date | null;
  };
  // Mantenemos campos antiguos para compatibilidad
  nombre?: string;
  casa?: string;
  celular?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private authService: AuthService
  ) {}

  /**
   * Obtiene todos los usuarios registrados
   */
  getUsuarios(): Observable<Usuario[]> {
    console.log('🔍 Iniciando carga de usuarios...');
    const startTime = Date.now();
    
    try {
      const usuariosRef = collection(this.firestore, 'users');
      console.log('📂 Referencia a colección users obtenida');
      
      const q = query(usuariosRef);
      console.log('🔍 Consulta creada');
      
      return new Observable<Usuario[]>(subscriber => {
        const subscription = collectionData(q, { idField: 'uid' }).subscribe({
          next: (usuarios: any[]) => {
            console.log('📊 Datos recibidos de Firestore');
            
            // Procesar cada usuario para asegurar que todos los campos tengan valores por defecto
            const usuariosProcesados = usuarios.map(usuario => {
              console.log('Usuario sin procesar:', usuario);
              
              // Extraer datos básicos con valores por defecto
              const datosUsuario = {
                // ID y datos principales
                uid: usuario.uid || '',
                email: usuario.email || '',
                displayName: usuario.displayName || usuario.nombre || 'Usuario sin nombre',
                
                // Datos de autenticación
                emailVerified: Boolean(usuario.emailVerified) || false,
                photoURL: usuario.photoURL || '',
                
                // Roles y permisos
                role: (usuario.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
                
                // Información de contacto
                phoneNumber: usuario.phoneNumber || usuario.celular || '',
                
                // Metadatos
                metadata: {
                  creationTime: usuario.metadata?.creationTime || 
                               usuario.fechaCreacion || 
                               new Date().toISOString(),
                  lastSignInTime: usuario.metadata?.lastSignInTime || 
                                 usuario.ultimoInicio || 
                                 null
                },
                
                // Campos de compatibilidad (antiguos)
                nombre: usuario.nombre || usuario.displayName || 'Usuario sin nombre',
                casa: usuario.casa || '',
                celular: usuario.celular || usuario.phoneNumber || ''
              };
              
              console.log('Usuario procesado:', datosUsuario);
              return datosUsuario as Usuario;
            });
            
            const loadTime = Date.now() - startTime;
            console.log(`✅ ${usuariosProcesados.length} usuarios cargados en ${loadTime}ms`);
            subscriber.next(usuariosProcesados);
          },
          error: (error: any) => {
            console.error('❌ Error en getUsuarios:', error);
            subscriber.error(error);
          }
        });
        
        return () => {
          console.log('🧹 Limpiando suscripción de usuarios');
          subscription.unsubscribe();
        };
      });
      
    } catch (error) {
      console.error('❌ Error en getUsuarios:', error);
      return new Observable(subscriber => {
        subscriber.error(error);
      });
    }
  }

  /**
   * Elimina un usuario de Firestore
   * @param usuario Usuario a eliminar
   */
  async eliminarUsuario(usuario: Usuario): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      
      // Evitar que un usuario se elimine a sí mismo
      if (currentUser?.uid === usuario.uid) {
        throw new Error('No puedes eliminarte a ti mismo');
      }

      // Eliminar el documento del usuario en Firestore
      const userDocRef = doc(this.firestore, `users/${usuario.uid}`);
      await deleteDoc(userDocRef);
      
      console.log('Usuario eliminado de Firestore correctamente');
      
      // Nota: La eliminación de la cuenta de autenticación de Firebase
      // requiere autenticación reciente y no se puede hacer directamente desde el cliente
      // en producción. Esto debería manejarse en un backend seguro.
      
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
  
  /**
   * Busca usuarios por término de búsqueda
   * @param term Término de búsqueda (nombre, email o casa)
   */
  buscarUsuarios(term: string): Observable<Usuario[]> {
    if (!term.trim()) {
      return this.getUsuarios();
    }
    
    const usuariosRef = collection(this.firestore, 'users');
    const q = query(
      usuariosRef,
      where('busqueda', 'array-contains', term.toLowerCase())
    );
    
    return collectionData(q, { idField: 'uid' }) as Observable<Usuario[]>;
  }
}
