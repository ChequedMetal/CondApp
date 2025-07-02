import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController,
  ToastController
} from '@ionic/angular';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  templateUrl: './crear-producto.page.html',
  styleUrls: ['./crear-producto.page.scss'],
})
export class CrearProductoPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  productoForm: FormGroup;
  productos: Array<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    fecha: string;
    autor: string;
    imagen?: string;
  }> = [];
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      precio: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    // Carga inicial desde localStorage
    const saved = JSON.parse(localStorage.getItem('productos') || '[]');
    this.productos = Array.isArray(saved) ? saved : [];
  }

  /** Abre el dialogo de selección de archivos */
  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  /** Genera vista previa cuando el usuario selecciona una imagen */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /** Guarda el nuevo producto en localStorage */
  async guardar() {
    if (this.productoForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: 'Formulario incompleto',
        message: 'Por favor completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const { nombre, descripcion, precio } = this.productoForm.value;
    const nuevo = {
      id: this.productos.length
        ? Math.max(...this.productos.map(p => p.id)) + 1
        : 1,
      nombre,
      descripcion,
      precio: Number(precio),
      fecha: new Date().toISOString(),
      autor: 'Vecino',              // FUTURO: reemplazar por usuario real desde AuthService
      imagen: this.imagenPreview ?? undefined  // convierte null a undefined si no hay imagen
    };

    // === TEMPORAL: guardado en localStorage ===
    this.productos.push(nuevo);
    localStorage.setItem('productos', JSON.stringify(this.productos));

    const toast = await this.toastCtrl.create({
      message: 'Producto publicado correctamente',
      duration: 2000
    });
    await toast.present();

    // limpiar formulario e imagen
    this.productoForm.reset();
    this.imagenPreview = null;

    // === FUTURO: integración con Firebase ===
    // this.firestoreService.add('productos', nuevo).then(...)
  }

  /** Cancela y regresa a Home */
  cancelar() {
    this.navCtrl.back();
  }
}
