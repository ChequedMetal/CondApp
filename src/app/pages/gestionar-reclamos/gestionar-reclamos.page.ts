import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular';
import {
  Firestore,
  collection,
  query,
  orderBy,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from '@angular/fire/firestore';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, AppUser } from '../../services/auth.service';
import { NavController } from '@ionic/angular';

interface Reclamo {
  id?: string;
  titulo: string;
  mensaje: string;
  fecha: Date;
  userId: string;
  autor: string;
  casa: string;
  avatar?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cerrado';
}

@Component({
  selector: 'app-gestionar-reclamos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './gestionar-reclamos.page.html'
})
export class GestionarReclamosPage implements OnInit, OnDestroy {
  reclamos: Reclamo[] = [];
  filtroEstado = '';
  userRole: AppUser['role'] = 'usuario';
  userId = '';
  private destroy$ = new Subject<void>();

  constructor(
    private navCtrl: NavController,
    private firestore: Firestore,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.auth.appUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        if (u) {
          this.userRole = u.role;
          this.userId   = u.uid;
        }
      });
    this.loadReclamos();
  }

  private loadReclamos() {
    const ref = collection(this.firestore, 'reclamos');
    const q   = query(ref, orderBy('fecha', 'desc'));
    collectionData(q, { idField: 'id' })
      .pipe(takeUntil(this.destroy$))
      .subscribe((docs: any[]) => {
        this.reclamos = docs.map(d => ({
          id:       d.id,
          titulo:   d.titulo,
          mensaje:  d.mensaje,
          fecha:    (d.fecha as any)?.toDate?.() ?? new Date(d.fecha),
          userId:   d.userId,
          autor:    d.autor,
          casa:     d.casa,
          avatar:   d.avatar,
          estado:   d.estado
        }));
      });
  }

  get reclamosFiltrados(): Reclamo[] {
    return this.filtroEstado
      ? this.reclamos.filter(r => r.estado === this.filtroEstado)
      : this.reclamos;
  }

  async cambiarEstado(rec: Reclamo, nuevo: Reclamo['estado']) {
    if (!rec.id) return;
    await updateDoc(doc(this.firestore, `reclamos/${rec.id}`), { estado: nuevo });
    (await this.toastCtrl.create({
      message: `Reclamo ${nuevo}`,
      duration: 1500
    })).present();
  }

  async eliminarReclamo(id: string) {
    console.log('Intentando eliminar reclamo ID:', id);
    
    if (!id) {
      console.error('ID de reclamo no proporcionado');
      const toast = await this.toastCtrl.create({
        message: 'Error: ID de reclamo no válido',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Eliminar reclamo',
      message: '¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada por el usuario');
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Eliminando reclamo...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              console.log('Eliminando reclamo con ID:', id);
              
              // 1. Referencia al documento
              const reclamoRef = doc(this.firestore, 'reclamos', id);
              console.log('Referencia al documento creada:', reclamoRef.path);
              
              // 2. Verificar si el documento existe antes de intentar eliminarlo
              const docSnap = await getDoc(reclamoRef);
              if (!docSnap.exists()) {
                throw new Error('El reclamo no existe o ya fue eliminado');
              }
              
              // 3. Eliminar de Firestore
              console.log('Iniciando eliminación en Firestore...');
              await deleteDoc(reclamoRef);
              console.log('Documento eliminado de Firestore');
              
              // 4. Actualizar la lista local inmediatamente
              this.reclamos = this.reclamos.filter(r => r.id !== id);
              console.log('Lista local actualizada. Total de reclamos:', this.reclamos.length);
              
              // 5. Mostrar confirmación
              const toast = await this.toastCtrl.create({
                message: '✅ Reclamo eliminado correctamente',
                duration: 2000,
                color: 'success',
                position: 'bottom'
              });
              
              await loading.dismiss();
              await toast.present();
              
            } catch (error: any) {
              console.error('❌ Error al eliminar el reclamo:', error);
              
              let errorMessage = 'Error al eliminar el reclamo';
              if (error?.code === 'permission-denied') {
                errorMessage = 'No tienes permisos para eliminar este reclamo';
              } else if (error?.code === 'not-found') {
                errorMessage = 'El reclamo no existe o ya fue eliminado';
              }
              
              const toast = await this.toastCtrl.create({
                message: errorMessage,
                duration: 4000,
                color: 'danger',
                position: 'bottom',
                buttons: [{
                  text: 'Cerrar',
                  role: 'cancel'
                }]
              });
              
              await loading.dismiss();
              await toast.present();
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

goBack() {
  this.navCtrl.back();
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
