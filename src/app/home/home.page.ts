import { Component, OnInit } from '@angular/core';
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
  IonToast
} from '@ionic/angular/standalone';

import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
import {
  megaphoneOutline,
  cartOutline,
  alertCircleOutline,
  chevronUpCircle,
  settingsOutline,
  chatbubblesOutline,
  contrastOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    // Ionic
    IonContent, IonHeader, IonIcon, IonTab, IonTabBar, IonTabButton, IonTabs,
    IonTitle, IonToolbar, IonFab, IonFabButton, IonFabList, IonList, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonItem,
    IonLabel, IonBadge, IonAvatar, IonImg, IonToast,

    // Angular
    CommonModule,
    DatePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  userRole: 'admin' | 'usuario' = 'usuario';
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  anuncios = [
    {
      titulo: 'Corte de agua programado',
      descripcion: 'El día lunes 1 de julio habrá un corte de agua desde las 09:00 hasta las 13:00.',
      fecha: new Date(),
      autor: 'Admin Condominio',
      avatar: '', // Sin imagen: se usa avatar por defecto
      categoria: 'Mantenimiento'
    },
    {
      titulo: 'Reunión de vecinos',
      descripcion: 'La próxima reunión será el viernes a las 19:00 en el salón de eventos.',
      fecha: new Date(),
      autor: 'Directiva',
      avatar: '',
      categoria: 'Comunidad'
    }
  ];

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    console.log('Iniciando HomePage, suscribiéndose a appUser$');
    // Suscribirse a los cambios del usuario
    this.authService.appUser$.subscribe({
      next: (user) => {
        console.log('Usuario actualizado:', user);
        if (user) {
          // Usar el campo 'role' del usuario
          this.userRole = user.role || 'usuario';
          console.log('Rol del usuario actualizado a:', this.userRole);
        } else {
          this.userRole = 'usuario';
          console.log('No hay usuario, rol establecido a: usuario');
        }
      },
      error: (error) => {
        console.error('Error en la suscripción a appUser$:', error);
      }
    });
    addIcons({
      megaphoneOutline,
      cartOutline,
      alertCircleOutline,
      chevronUpCircle,
      settingsOutline,
      chatbubblesOutline,
      contrastOutline
    });
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
    this.router.navigate(['/panel-admin']);
  }
  
  // Limpiar suscripciones al destruir el componente
  ngOnDestroy() {
    // La suscripción se limpiará automáticamente gracias a async pipe
  }

}
