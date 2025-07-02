import { Component, OnInit } from '@angular/core';
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
  selector: 'app-crear-reclamo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  templateUrl: './crear-reclamo.page.html',
  styleUrls: ['./crear-reclamo.page.scss'],
})
export class CrearReclamoPage implements OnInit {
  reclamoForm: FormGroup;
  reclamos: Array<{
    id: number;
    mensaje: string;
    fecha: string;
    autor: string;
    estado: string;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    // Construcción del formulario (sólo mensaje, como en tu versión original)
    this.reclamoForm = this.fb.group({
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Carga inicial de reclamos desde localStorage
    const saved = JSON.parse(localStorage.getItem('reclamos') || '[]');
    this.reclamos = Array.isArray(saved) ? saved : [];
  }

  /** Envía el reclamo y guarda en localStorage */
  async enviar() {
    if (this.reclamoForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: 'Formulario incompleto',
        message: 'Por favor ingresa una descripción',
        buttons: ['OK']
      });
      return alert.present();
    }

    const { mensaje } = this.reclamoForm.value;
    const nuevo = {
      id: this.reclamos.length
        ? Math.max(...this.reclamos.map(r => r.id)) + 1
        : 1,
      mensaje,
      fecha: new Date().toISOString(),
      autor: 'Vecino',       // FUTURO: sustituir por autor real via AuthService
      estado: 'nuevo'        // FUTURO: podrías usar otros estados por defecto
    };

    // Guardar en localStorage
    this.reclamos.push(nuevo);
    localStorage.setItem('reclamos', JSON.stringify(this.reclamos));

    // Mostrar confirmación
    const toast = await this.toastCtrl.create({
      message: 'Reclamo enviado correctamente',
      duration: 2000
    });
    await toast.present();

    // Reset y navegación atrás
    this.reclamoForm.reset();
    this.navCtrl.back();

    // FUTURO: aquí llamarías a tu servicio Firebase en lugar de localStorage
    // this.reclamosService.crearReclamo(nuevo)
    //   .then(() => this.navCtrl.navigateRoot('/home'))
    //   .catch(err => console.error('Error Firebase:', err));
  }

  /** Cancela y vuelve atrás */
  cancelar() {
    this.navCtrl.back();
  }
}
