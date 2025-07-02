import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController,
  ToastController
} from '@ionic/angular';

@Component({
  selector: 'app-crear-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  templateUrl: './crear-usuarios.page.html',
  styleUrls: ['./crear-usuarios.page.scss'],
})
export class CrearUsuariosPage {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    const validarRut = (control: FormControl) => {
      const v: string = control.value;
      return /^\d{7,8}-[0-9Kk]$/.test(v) ? null : { invalidRut: true };
    };
    const validarCelular = (control: FormControl) => {
      const v: string = control.value;
      return /^(\+56)?[2-9]\d{8}$/.test(v) ? null : { invalidCelular: true };
    };
    const validarCasa = (control: FormControl) => {
      const n = Number(control.value);
      return n >= 1 && n <= 100 ? null : { invalidCasa: true };
    };
    const validarDomain = (control: FormControl) => {
      const d = (control.value as string).split('@')[1] || '';
      return ['gmail.com','yahoo.com','hotmail.com'].includes(d)
        ? { invalidDomain: true }
        : null;
    };

    this.usuarioForm = this.fb.group({
      rut: ['', [Validators.required, validarRut]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      celular: ['', [Validators.required, validarCelular]],
      casa: ['', [Validators.required, validarCasa]],
      correo: ['', [Validators.required, Validators.email, validarDomain]],
      rol: ['user', Validators.required]
    });

    this.usuarioForm.get('celular')!.valueChanges.subscribe(v => {
      if (v && !v.startsWith('+56')) {
        const nums = v.replace(/\D/g, '');
        this.usuarioForm.get('celular')!.setValue('+56' + nums, { emitEvent: false });
      }
    });
  }

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      const errors: string[] = [];
      Object.entries(this.usuarioForm.controls).forEach(([k, ctrl]) => {
        if (ctrl.errors) {
          if (ctrl.errors['required']) errors.push(`${k} es obligatorio`);
          if (ctrl.errors['invalidRut']) errors.push('RUT inválido');
          if (ctrl.errors['invalidCelular']) errors.push('Celular inválido');
          if (ctrl.errors['invalidCasa']) errors.push('Número de casa fuera de rango');
          if (ctrl.errors['invalidDomain']) errors.push('Dominio de correo no permitido');
          if (ctrl.errors['email']) errors.push('Formato de correo inválido');
        }
      });
      const alert = await this.alertCtrl.create({
        header: 'Errores en formulario',
        message: errors.join('<br>'),
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // === TEMPORAL: Guardar en localStorage ===
    const nuevo = this.usuarioForm.value;
    const lista = JSON.parse(localStorage.getItem('usuarios') || '[]');
    lista.push(nuevo);
    localStorage.setItem('usuarios', JSON.stringify(lista));

    const toast = await this.toastCtrl.create({
      message: 'Usuario creado correctamente',
      duration: 2000
    });
    await toast.present();

    this.navCtrl.back();

    // === FUTURO: aquí iría la llamada a Firebase ===
    // this.authService.register(nuevo)
    //   .then(() => { ... })
    //   .catch(err => { ... });
  }

  cancelar() {
    this.navCtrl.back();
  }
}
