import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonFabList,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonAvatar,
  IonImg,
  IonToast,
  IonSpinner,
  IonText,
  IonButton
} from '@ionic/angular/standalone';

import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AnunciosService } from '../services/anuncios.service';
import {
  megaphoneOutline,
  cartOutline,
  alertCircleOutline,
  chevronUpCircle,
  settingsOutline,
  chatbubblesOutline,
  contrastOutline,
  addOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

// Interfaz para los anuncios
interface Anuncio {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  autor: string;
  avatar: string;
  categoria: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    // Ionic
    IonContent, IonHeader, IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs,
    IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, IonList, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonSpinner,
    IonLabel, IonBadge, IonAvatar, IonImg, IonToast, IonText, IonButton,

    // Angular
    CommonModule,
    DatePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  userRole: 'admin' | 'usuario' = 'usuario';
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  // Arreglo para almacenar los anuncios dinámicos
  anuncios: Anuncio[] = [];

  productos = [
    {
      titulo: 'Mesa plegable',
      descripcion: 'Mesa de camping, ligera, en buen estado.',
      fecha: new Date(),
      autor: 'Carlos Ramírez',
      avatar: '', // sin imagen, se usa la por defecto
      precio: '$15.000'
    },
    {
      titulo: 'Bicicleta usada',
      descripcion: 'Bicicleta urbana, talla M, necesita revisión.',
      fecha: new Date(),
      autor: 'Lucía Torres',
      avatar: '',
      precio: '$25.000'
    }
  ];
  
  reclamos = [
    {
      titulo: 'Ruidos molestos',
      descripcion: 'Departamento 302 hace fiestas hasta tarde. Solicito intervención.',
      fecha: new Date(),
      autor: 'Marcela Núñez',
      avatar: '', // sin imagen
      estado: 'Pendiente'
    },
    {
      titulo: 'Luz quemada en pasillo',
      descripcion: 'El foco del 2° piso lleva días apagado. Solicito reposición.',
      fecha: new Date(),
      autor: 'Diego Contreras',
      avatar: '',
      estado: 'En progreso'
    }
  ];

  // Variables para manejar el estado de carga
  cargandoAnuncios = true;
  errorAnuncios: string | null = null;
  
  // Para manejar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private anunciosService: AnunciosService,
    private ngZone: NgZone
  ) {}
  
  ngOnInit() {
    console.log('Iniciando HomePage');
    
    // Configurar los íconos primero
    addIcons({
      megaphoneOutline,
      cartOutline,
      alertCircleOutline,
      chevronUpCircle,
      settingsOutline,
      chatbubblesOutline,
      contrastOutline,
      addOutline
    });
    
    // Suscribirse a las notificaciones de nuevos anuncios
    this.anunciosService.anuncioAgregado$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('🔄 Se detectó un nuevo anuncio, recargando...');
      this.cargarAnuncios();
    });
    
    // Suscribirse a los cambios del usuario
    this.authService.appUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user: any) => {
        console.log('Usuario actualizado:', user);
        if (user) {
          // Usar el campo 'role' del usuario
          this.userRole = (user as any).role || 'usuario';
          console.log('Rol del usuario actualizado a:', this.userRole);
          
          // Cargar anuncios después de tener el usuario
          this.cargarAnuncios();
        } else {
          this.userRole = 'usuario';
          console.log('No hay usuario, rol establecido a: usuario');
          // Cargar anuncios aunque no haya usuario (anuncios públicos)
          this.cargarAnuncios();
        }
      },
      error: (error) => {
        console.error('Error en la suscripción a appUser$:', error);
        // Intentar cargar anuncios incluso si hay error con el usuario
        this.cargarAnuncios();
      },
      complete: () => {
        // Asegurarse de que siempre se carguen los anuncios
        if (this.anuncios.length === 0) {
          this.cargarAnuncios();
        }
      }
    });
  }
  
  /**
   * Carga los anuncios desde Firestore
   */
  async cargarAnuncios() {
    console.log('🔄 Iniciando carga de anuncios en el componente...');
    
    // Usar NgZone para asegurar que los cambios se detecten correctamente
    this.ngZone.run(() => {
      this.cargandoAnuncios = true;
      this.errorAnuncios = null;
      this.anuncios = []; // Limpiar anuncios existentes
    });

    try {
      // Suscribirse a los cambios de los anuncios
      const sub = this.anunciosService.getAnuncios().subscribe({
        next: (anuncios) => {
          console.log('📥 Anuncios recibidos en el componente:', anuncios.length);
          
          // Usar NgZone para asegurar la detección de cambios
          this.ngZone.run(() => {
            this.anuncios = anuncios.map(anuncio => {
              // Asegurar que la fecha sea un objeto Date válido
              let fechaAnuncio: Date;
              if (anuncio.fecha instanceof Date) {
                fechaAnuncio = anuncio.fecha;
              } else if (anuncio.fecha && typeof anuncio.fecha === 'object' && 'toDate' in anuncio.fecha) {
                fechaAnuncio = (anuncio.fecha as any).toDate();
              } else if (anuncio.fecha) {
                fechaAnuncio = new Date(anuncio.fecha as any);
              } else {
                fechaAnuncio = new Date();
              }
              
              console.log('📅 Fecha procesada:', fechaAnuncio);
              
              return {
                ...anuncio,
                fecha: fechaAnuncio,
                // Asegurar que todos los campos tengan valores por defecto
                titulo: anuncio.titulo || 'Sin título',
                descripcion: anuncio.descripcion || '',
                autor: anuncio.autor || 'Anónimo',
                avatar: anuncio.avatar || 'assets/img/default-avatar.png',
                categoria: anuncio.categoria || 'General'
              };
            });
            
            console.log('✅ Anuncios asignados al componente:', this.anuncios.length);
            this.cargandoAnuncios = false;
          });
        },
        error: (error) => {
          console.error('❌ Error al cargar anuncios en el componente:', error);
          this.ngZone.run(() => {
            this.errorAnuncios = 'No se pudieron cargar los anuncios. Intenta de nuevo más tarde.';
            this.cargandoAnuncios = false;
            this.anuncios = [];
          });
        },
        complete: () => {
          console.log('🏁 Carga de anuncios completada en el componente');
          // Asegurarse de que siempre se quite el estado de carga
          this.ngZone.run(() => {
            this.cargandoAnuncios = false;
          });
          // Desuscribirse para evitar fugas de memoria
          sub.unsubscribe();
        }
      });
      
      // Desuscribirse después de 10 segundos para evitar fugas de memoria
      setTimeout(() => {
        if (sub && !sub.closed) {
          console.log('⏰ Desuscribiendo la suscripción después de 10 segundos');
          sub.unsubscribe();
        }
      }, 10000);
      
    } catch (error) {
      console.error('🔥 Error inesperado al cargar anuncios:', error);
      this.ngZone.run(() => {
        this.errorAnuncios = 'Ocurrió un error inesperado. Por favor, reinicia la aplicación.';
        this.cargandoAnuncios = false;
      });
    }
  }

  /**
   * Cierra la sesión del usuario y redirige al login
   */
  async logout() {
    try {
      await this.authService.logout();
      // Navegar a la página de login sin historial de navegación
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.toastMessage = 'Error al cerrar sesión';
      this.toastColor = 'danger';
      this.showToast = true;
    }
  }

  goToPanelAdmin() {
    this.router.navigate(['/panel']);
  }
  
  goToPerfilUsuario() {
    this.router.navigate(['/perfil-usuario']);
  }
  
  /**
   * Limpia todas las suscripciones cuando el componente se destruye
   */
  ngOnDestroy(): void {
    console.log('🔴 Destruyendo componente HomePage');
    this.destroy$.next();
    this.destroy$.complete();
  }

}
