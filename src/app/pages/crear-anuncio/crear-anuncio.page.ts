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
  selector: 'app-crear-anuncio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  templateUrl: './crear-anuncio.page.html',
  styleUrls: ['./crear-anuncio.page.scss'],
})
export class CrearAnuncioPage implements OnInit {
  anuncioForm: FormGroup;
  anuncios: Array<{
    id: number;
    titulo: string;
    mensaje: string;
    fecha: string;
    autor: string;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.anuncioForm = this.fb.group({
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Carga inicial desde localStorage (o array vacío)
    const saved = JSON.parse(localStorage.getItem('anuncios') || '[]');
    this.anuncios = saved;
  }

  async publicar() {
    if (this.anuncioForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: 'Formulario incompleto',
        message: 'Por favor completa título y mensaje',
        buttons: ['OK']
      });
      return alert.present();
    }

    const { titulo, mensaje } = this.anuncioForm.value;
    const nuevoAnuncio = {
      id: this.anuncios.length
        ? Math.max(...this.anuncios.map(a => a.id)) + 1
        : 1,
      titulo,
      mensaje,
      fecha: new Date().toISOString(),
      autor: 'Usuario'  // FUTURO: reemplazar por autor real desde AuthService
    };

    // Guardar en localStorage
    this.anuncios.push(nuevoAnuncio);
    localStorage.setItem('anuncios', JSON.stringify(this.anuncios));

    // Mensaje de éxito
    const toast = await this.toastCtrl.create({
      message: 'Anuncio publicado correctamente',
      duration: 2000
    });
    await toast.present();

    this.anuncioForm.reset();

    // FUTURO: aquí iría la llamada a tu servicio de Firebase
    // this.anunciosService.crearAnuncio(nuevoAnuncio)
    //   .then(() => this.navCtrl.navigateRoot('/home'))
    //   .catch(err => console.error('Error Firebase:', err));
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
}
