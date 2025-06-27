import { Component } from '@angular/core';
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
  IonImg
} from '@ionic/angular/standalone';

import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
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
    IonLabel, IonBadge, IonAvatar, IonImg,

    // Angular
    CommonModule,
    DatePipe
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
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

  constructor(private router: Router) {
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
   * Método temporal para cerrar sesión.
   * Elimina la sesión del usuario y redirige al login.
   */
  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  userRole: string = 'usuario';
  ngOnInit() {
    this.userRole = localStorage.getItem('userRole') || 'user';
  }

  goToPanelAdmin() {
    this.router.navigate(['/panel-admin']);
  }
}
