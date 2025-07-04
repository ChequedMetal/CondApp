import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {

  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // Ionic Components usados en template:
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon
  ],
  templateUrl: './crear-producto.page.html',
  styleUrls: ['./crear-producto.page.scss']
})
export class CrearProductoPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  productoForm: FormGroup;
  imagenPreview: string | null = null;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: AuthService,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre:      ['', Validators.required],
      descripcion: ['', Validators.required],
      precio:      [ null, [Validators.required, Validators.min(0)] ]
    });
  }

  ngOnInit() {
    // Recupera solo una vez los datos del usuario logueado
    this.auth.appUser$.pipe(take(1)).subscribe(u => this.currentUser = u);
  }

  // Abre el selector de archivo
  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  // Maneja la selección de archivo y genera preview
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Guarda el producto en Firestore
async guardar() {
  if (this.productoForm.invalid) return;

  const { nombre, descripcion, precio } = this.productoForm.value;
  const nuevoProducto = {
    nombre,
    descripcion,
    precio,
    imagen: this.imagenPreview || '',
    fecha: serverTimestamp(),
    usuario: this.currentUser?.nombre,
    whatsapp: this.currentUser?.whatsapp
  };

  console.log('Guardando en Firestore:', nuevoProducto);  // DEBUG

  try {
    const productosRef = collection(this.firestore, 'productos');
    await addDoc(productosRef, nuevoProducto);
    this.router.navigate(['/home'], { queryParams: { tab: 'mercado' } });
  } catch (err) {
    console.error('Error guardando producto:', err);
  }
}

  cancelar() {
    this.router.navigate(['/home']);
  }
}
