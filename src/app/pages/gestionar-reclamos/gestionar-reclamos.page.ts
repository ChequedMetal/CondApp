import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  AlertController,
  ToastController
} from '@ionic/angular';

@Component({
  selector: 'app-gestionar-reclamos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './gestionar-reclamos.page.html',
  styleUrls: ['./gestionar-reclamos.page.scss'],
})
export class GestionarReclamosPage implements OnInit {
  reclamos: Array<{
    id: number;
    autor: string;
    casa: string;
    mensaje: string;
    fecha: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cerrado';
    userId: string;
  }> = [];
  filtroEstado: string = '';
  userRole: string = '';
  userId: string = '';

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Carga rol y userId desde localStorage (temporal)
    this.userRole = localStorage.getItem('userRole') || 'user';
    this.userId   = localStorage.getItem('userId')   || '';

    // Carga inicial de reclamos
    const saved = JSON.parse(localStorage.getItem('reclamos') || 'null');
    if (saved && Array.isArray(saved)) {
      this.reclamos = saved;
    } else {
      // Datos de ejemplo
      this.reclamos = [
        {
          id: 1,
          autor: 'Marcela Núñez',
          casa: '302',
          mensaje: 'Ruidos molestos toda la noche.',
          fecha: new Date().toLocaleString(),
          estado: 'pendiente',
          userId: 'user1'
        },
        {
          id: 2,
          autor: 'Diego Contreras',
          casa: '204',
          mensaje: 'Foco quemado en pasillo.',
          fecha: new Date().toLocaleString(),
          estado: 'aprobado',
          userId: 'user2'
        }
      ];
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem('reclamos', JSON.stringify(this.reclamos));
  }

  get reclamosFiltrados() {
    if (!this.filtroEstado) return this.reclamos;
    return this.reclamos.filter(r => r.estado === this.filtroEstado);
  }

  async cambiarEstado(reclamo: any, nuevoEstado: typeof reclamo.estado) {
    reclamo.estado = nuevoEstado;
    this.saveToStorage();
    await this.toastCtrl.create({
      message: `Estado cambiado a ${nuevoEstado}`,
      duration: 1500
    }).then(t => t.present());

    // FUTURO: aquí iría la llamada a Firebase para actualizar el estado
    // this.firestoreService.update('reclamos', reclamo.id, { estado: nuevoEstado });
  }

  async eliminarReclamo(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reclamo',
      message: '¿Estás seguro?',
      buttons: [
        'Cancelar',
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.reclamos = this.reclamos.filter(r => r.id !== id);
            this.saveToStorage();
            this.toastCtrl.create({
              message: 'Reclamo eliminado',
              duration: 1500
            }).then(t => t.present());

            // FUTURO: aquí iría la llamada a Firebase para eliminar
            // this.firestoreService.delete('reclamos', id);
          }
        }
      ]
    });
    await alert.present();
  }
}
