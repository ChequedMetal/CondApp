import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, Subject } from 'rxjs';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp, 
  Firestore, 
  collectionData, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  getDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

export interface Anuncio {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: Date | Timestamp;
  autor: string;
  avatar: string;
  categoria: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class AnunciosService {
  private anunciosSubject = new BehaviorSubject<Anuncio[]>([]);
  public anuncios$ = this.anunciosSubject.asObservable();
  private readonly COLLECTION_NAME = 'anuncios';
  
  // Subject para notificar sobre nuevos anuncios
  private anuncioAgregado = new Subject<void>();
  public anuncioAgregado$ = this.anuncioAgregado.asObservable();

  constructor(private firestore: Firestore) { 
    this.cargarAnuncios();
  }

  // Cargar todos los anuncios desde Firestore
  private cargarAnuncios(): void {
    console.log('🔍 Iniciando carga de anuncios...');
    const anunciosRef = collection(this.firestore, this.COLLECTION_NAME);
    const q = query(anunciosRef, orderBy('fecha', 'desc'));
    
    // Forzar un array vacío inicial para limpiar cualquier dato anterior
    this.anunciosSubject.next([]);
    
    // Usar getDocs en lugar de collectionData para mejor control
    from(getDocs(q)).pipe(
      tap(() => console.log('✅ Consulta a Firestore completada')),
      map(snapshot => {
        const anuncios = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('📄 Anuncio obtenido:', { id: doc.id, ...data });
          return {
            id: doc.id,
            titulo: data['titulo'] || 'Sin título',
            descripcion: data['descripcion'] || '',
            fecha: data['fecha']?.toDate() || new Date(),
            autor: data['autor'] || 'Anónimo',
            avatar: data['avatar'] || 'assets/img/default-avatar.png',
            categoria: data['categoria'] || 'General'
          } as Anuncio;
        });
        console.log(`📊 Total de anuncios cargados: ${anuncios.length}`);
        return anuncios;
      }),
      catchError(error => {
        console.error('❌ Error al cargar anuncios:', error);
        // Mostrar el error completo en la consola para depuración
        if (error instanceof Error) {
          console.error('Detalles del error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        return of([]);
      })
    ).subscribe({
      next: (anuncios) => {
        console.log('🔄 Actualizando lista de anuncios');
        this.anunciosSubject.next(anuncios);
      },
      error: (error) => {
        console.error('❌ Error en la suscripción de anuncios:', error);
        this.anunciosSubject.next([]);
      },
      complete: () => console.log('✅ Carga de anuncios completada')
    });
  }

  // Obtener todos los anuncios
  getAnuncios(): Observable<Anuncio[]> {
    return this.anuncios$;
  }

  // Obtener un anuncio por ID
  getAnuncioById(id: string): Observable<Anuncio | undefined> {
    return this.anuncios$.pipe(
      map(anuncios => anuncios.find(a => a.id === id))
    );
  }

  // Agregar un nuevo anuncio
  async agregarAnuncio(anuncio: Omit<Anuncio, 'id' | 'fecha' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const anuncioRef = collection(this.firestore, this.COLLECTION_NAME);
      const nuevoAnuncio = {
        ...anuncio,
        fecha: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(anuncioRef, nuevoAnuncio);
      console.log('Anuncio agregado con ID: ', docRef.id);
      
      // Notificar que se agregó un nuevo anuncio
      this.anuncioAgregado.next();
      
      // Forzar recarga de anuncios
      this.cargarAnuncios();
      
      return docRef.id;
    } catch (error) {
      console.error('Error al agregar anuncio:', error);
      throw new Error('No se pudo guardar el anuncio');
    }
  }

  // Actualizar un anuncio existente
  async actualizarAnuncio(id: string, cambios: Partial<Omit<Anuncio, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const anuncioRef = doc(this.firestore, `${this.COLLECTION_NAME}/${id}`);
      await updateDoc(anuncioRef, {
        ...cambios,
        updatedAt: serverTimestamp()
      });
      console.log('Anuncio actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
      throw new Error('No se pudo actualizar el anuncio');
    }
  }

  // Eliminar un anuncio
  async eliminarAnuncio(id: string): Promise<void> {
    try {
      const anuncioRef = doc(this.firestore, `${this.COLLECTION_NAME}/${id}`);
      await deleteDoc(anuncioRef);
      console.log('Anuncio eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      throw new Error('No se pudo eliminar el anuncio');
    }
  }
}
