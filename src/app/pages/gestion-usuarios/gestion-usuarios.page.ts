import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon,
  IonButton,
  IonSpinner,
  IonToast,
  IonButtons,
  IonBackButton,
  IonText,
  AlertController
} from '@ionic/angular/standalone';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    // Ionic
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonSpinner,
    IonToast,
    IonButtons,
    IonBackButton,
    IonText
  ]
})
export class GestionUsuariosPage implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  cargando = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  mostrarDebug = false;

  constructor(
    private usuariosService: UsuariosService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarUsuarios() {
    console.log('🔄 Iniciando carga de usuarios...');
    this.cargando = true;
    this.error = null;
    this.usuarios = []; // Limpiar usuarios existentes
    
    // Timeout para mostrar mensaje si la carga es lenta
    const loadingTimeout = setTimeout(() => {
      if (this.cargando) {
        console.log('⚠️ La carga está tardando más de lo esperado...');
        this.mostrarToast('Cargando usuarios, por favor espera...', 'warning');
      }
    }, 3000);
    
    console.log('🔍 Solicitando datos a Firestore...');
    this.usuariosService.getUsuarios()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('✅ Finalizada la carga de usuarios');
          console.log('Estado actual - cargando:', this.cargando, 'error:', this.error, 'usuarios:', this.usuarios?.length);
          clearTimeout(loadingTimeout);
          this.cargando = false;
        })
      )
      .subscribe({
        next: (usuarios) => {
          console.log(`📊 ${usuarios?.length || 0} usuarios recibidos`);
          
          if (!usuarios || !Array.isArray(usuarios)) {
            console.error('❌ Error: La respuesta no es un array:', usuarios);
            this.error = 'Error al cargar los usuarios: Formato de datos inválido';
            return;
          }
          
          // Verificar la estructura de los datos
          if (usuarios.length > 0) {
            console.log('🔍 Primer usuario del array:', JSON.stringify(usuarios[0], null, 2));
            console.log('🔍 Campos del primer usuario:', Object.keys(usuarios[0]));
          } else {
            console.log('ℹ️ El array de usuarios está vacío');
          }
          
          // Asignar los usuarios
          this.usuarios = usuarios || [];
          console.log('👥 Usuarios asignados al componente:', this.usuarios.length);
          
          if (usuarios.length === 0) {
            console.log('ℹ️ No se encontraron usuarios');
            this.mostrarToast('No se encontraron usuarios', 'warning');
          }
        },
        error: (err) => {
          console.error('❌ Error al cargar usuarios:', err);
          this.error = 'No se pudieron cargar los usuarios. Intenta de nuevo más tarde.';
          this.mostrarToast('Error al cargar usuarios', 'danger');
        }
      });
  }

  async confirmarEliminarUsuario(usuario: Usuario) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          handler: () => this.eliminarUsuario(usuario)
        }
      ]
    });

    await alert.present();
  }

  private async eliminarUsuario(usuario: Usuario) {
    try {
      await this.usuariosService.eliminarUsuario(usuario);
      this.mostrarToast('Usuario eliminado correctamente', 'success');
      this.cargarUsuarios(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const mensaje = error instanceof Error ? error.message : 'Ocurrió un error al eliminar el usuario';
      this.mostrarToast(mensaje, 'danger');
    }
  }

  private mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
    
    // Ocultar el toast después de 3 segundos
    setTimeout(() => this.showToast = false, 3000);
  }
}
