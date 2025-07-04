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
import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { AuthService, AppUser } from '../../services/auth.service';
import { take } from 'rxjs/operators';

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
  currentUser!: AppUser;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.reclamoForm = this.fb.group({
      mensaje: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Tomamos una sola vez los datos del usuario logueado
    this.auth.appUser$
      .pipe(take(1))
      .subscribe(user => {
        if (user) {
          this.currentUser = user;
        } else {
          // Si no hay usuario, podrías redirigir al login
          this.navCtrl.navigateRoot('/login');
        }
      });
  }

  /** Envía el reclamo a Firestore */
  async enviar() {
    if (this.reclamoForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: 'Formulario incompleto',
        message: 'Por favor ingresa el mensaje del reclamo.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const { mensaje } = this.reclamoForm.value;

    const nuevoReclamo = {
      mensaje,
      fecha:     serverTimestamp(),
      userId:    this.currentUser.uid,
      autor:     this.currentUser.nombre,
      casa:      this.currentUser.casa || '',
      avatar:    (this.currentUser as any).avatar || '',
      estado:    'pendiente' as const
    };

    try {
      const ref = collection(this.firestore, 'reclamos');
      await addDoc(ref, nuevoReclamo);

      await this.toastCtrl.create({
        message: 'Reclamo enviado correctamente',
        duration: 2000
      }).then(toast => toast.present());

      this.navCtrl.back();
    } catch (error) {
      console.error('Error creando reclamo:', error);
      await this.toastCtrl.create({
        message: 'Error al enviar reclamo',
        duration: 2000,
        color: 'danger'
      }).then(toast => toast.present());
    }
  }

  /** Cancela y vuelve atrás */
  cancelar() {
    this.navCtrl.back();
  }
}
