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
import { Router, RouterModule } from '@angular/router';
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

import {
  Firestore,
  collection,
  query,
  orderBy,
  collectionData
} from '@angular/fire/firestore';

// Interfaz para anuncios
interface Anuncio {
  id?: string;
  titulo: string;
  descripcion: string;
  fecha: Date;
  autor: string;
  avatar: string;
  categoria: string;
}

// **Nueva interfaz para reclamos**
interface Reclamo {
  titulo: string;
  descripcion: string;
  fecha: Date;
  autor: string;
  avatar: string;
  estado: string;
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
    DatePipe,
    RouterModule
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  userRole: 'admin' | 'usuario' = 'usuario';
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  anuncios: Anuncio[] = [];
  productos: any[] = [];

  // Ahora reclamos está correctamente tipado
  reclamos: Reclamo[] = [
    {
      titulo: 'Ruidos molestos',
      descripcion: 'Departamento 302 hace fiestas hasta tarde. Solicito intervención.',
      fecha: new Date(),
      autor: 'Marcela Núñez',
      avatar: '',
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

  cargandoAnuncios = true;
  errorAnuncios: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private anunciosService: AnunciosService,
    private ngZone: NgZone,
    private firestore: Firestore
  ) {}

  ngOnInit() {
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

    this.cargarAnuncios();
    this.cargarProductos();

    this.anunciosService.anuncioAgregado$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarAnuncios());

    this.authService.appUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.userRole = user?.role || 'usuario';
          this.cargarAnuncios();
        },
        error: () => this.cargarAnuncios(),
        complete: () => {
          if (this.anuncios.length === 0) {
            this.cargarAnuncios();
          }
        }
      });
  }

  async cargarAnuncios() {
    this.ngZone.run(() => {
      this.cargandoAnuncios = true;
      this.errorAnuncios = null;
      this.anuncios = [];
    });
    try {
      const sub = this.anunciosService.getAnuncios().subscribe({
        next: anuncios => {
          this.ngZone.run(() => {
            this.anuncios = anuncios.map(a => {
              const raw = (a.fecha as any);
              const fecha = raw?.toDate?.() ?? (a.fecha instanceof Date ? a.fecha : new Date(raw)) ?? new Date();
              return {
                ...a,
                fecha,
                titulo: a.titulo || 'Sin título',
                descripcion: a.descripcion || '',
                autor: a.autor || 'Anónimo',
                avatar: a.avatar || 'assets/img/default-avatar.png',
                categoria: a.categoria || 'General'
              };
            });
            this.cargandoAnuncios = false;
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.errorAnuncios = 'No se pudieron cargar los anuncios.';
            this.cargandoAnuncios = false;
          });
        },
        complete: () => sub.unsubscribe()
      });
    } catch {
      this.ngZone.run(() => {
        this.errorAnuncios = 'Ocurrió un error inesperado.';
        this.cargandoAnuncios = false;
      });
    }
  }

 private cargarProductos() {
    const ref = collection(this.firestore, 'productos');
    const q   = query(ref, orderBy('fecha', 'desc'));
    collectionData(q, { idField: 'id' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(docs => {
        this.productos = docs.map((d: any) => ({
          id:          d.id,
          nombre:      d.nombre,
          descripcion: d.descripcion,
          precio:      d.precio,
          imagen:      d.imagen || d.imagenUrl || 'assets/img/default-avatar.png',
          fecha:       (d.fecha as any)?.toDate?.() ?? new Date(d.fecha),
          autor:       d.usuario,     // ← usa este campo
          whatsapp:    d.whatsapp     // ← y este para WhatsApp
        }));
      });
  }


  generarEnlaceWhatsApp(item: any): string {
    const nombre = item.nombre || item.titulo || 'producto';
    const mensaje = encodeURIComponent(`¡Hola! Me interesa tu producto "${nombre}". ¿Sigue disponible?`);
    return item.whatsapp ? `https://wa.me/${item.whatsapp}?text=${mensaje}` : '';
  }

  goToPanelAdmin() { this.router.navigate(['/panel']); }
  goToPerfilUsuario() { this.router.navigate(['/perfil-usuario']); }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch {
      this.toastMessage = 'Error al cerrar sesión';
      this.toastColor = 'danger';
      this.showToast = true;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
