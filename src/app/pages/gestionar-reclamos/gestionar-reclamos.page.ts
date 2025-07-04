import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  ToastController
} from '@ionic/angular';
import {
  Firestore,
  collection,
  query,
  orderBy,
  collectionData,
  doc,
  updateDoc,
  deleteDoc
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
    private toastCtrl: ToastController
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
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reclamo',
      message: '¿Confirmas que deseas eliminarlo?',
      buttons: [
        'Cancelar',
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await deleteDoc(doc(this.firestore, `reclamos/${id}`));
            (await this.toastCtrl.create({
              message: 'Reclamo eliminado',
              duration: 1500
            })).present();
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
