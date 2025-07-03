import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonButtons,
  ToastController,
  AlertController,
  NavController
} from '@ionic/angular/standalone';
import { AnunciosService } from '../../services/anuncios.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-crear-anuncio',
  templateUrl: './crear-anuncio.page.html',
  styleUrls: ['./crear-anuncio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonTextarea,
    IonItem,
    IonLabel,
    IonBackButton,
    IonButtons
  ]
})
export class CrearAnuncioPage implements OnInit {
  anuncioForm: FormGroup;
  cargando = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private anunciosService: AnunciosService,
    private authService: AuthService
  ) {
    this.anuncioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['general', [Validators.required]]
    });
  }

  ngOnInit() {}

  async publicar() {
    if (this.anuncioForm.invalid) {
      this.mostrarAlerta('Formulario incompleto', 'Por favor completa todos los campos requeridos');
      return;
    }

    this.cargando = true;
    this.error = null;

    try {
      const { titulo, descripcion, categoria } = this.anuncioForm.value;
      const usuarioActual = this.authService.getCurrentUser();
      
      if (!usuarioActual) {
        throw new Error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      const nuevoAnuncio = {
        titulo,
        descripcion,
        categoria: categoria || 'general',
        autor: usuarioActual.displayName || 'Administrador',
        avatar: usuarioActual.photoURL || ''
      };

      // Guardar en Firestore
      await this.anunciosService.agregarAnuncio(nuevoAnuncio);
      
      // Mostrar mensaje de éxito
      const toast = await this.toastCtrl.create({
        message: 'Anuncio publicado correctamente',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Limpiar formulario
      this.anuncioForm.reset({ categoria: 'general' });
      
      // Redirigir al home después de 1 segundo
      setTimeout(() => {
        this.navCtrl.navigateRoot('/home');
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Error al publicar anuncio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al publicar el anuncio';
      this.error = errorMessage;
      this.mostrarAlerta('Error', errorMessage);
    } finally {
      this.cargando = false;
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  cancelar() {
    this.navCtrl.navigateBack('/home');
  }
}
