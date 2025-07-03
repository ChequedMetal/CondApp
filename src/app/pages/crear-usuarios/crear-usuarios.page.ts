// src/app/crear-usuario/crear-usuario.page.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import {
  IonicModule,
  NavController,
  AlertController
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuarios.page.html',
  styleUrls: ['./crear-usuarios.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CrearUsuariosPage {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) {
    // Validador personalizado para celular
    const validarCelular = (control: FormControl) => {
      const valor = control.value || '';
      const soloNumeros = valor.replace(/\D/g, '');
      return soloNumeros.length < 10 ? { minLength: true } : null;
    };

    // Validador personalizado para RUT
    const validarRut = (control: FormControl) => {
      const raw = control.value?.replace(/\D/g, '') || '';
      if (!raw) return null;
      const rutsInvalidos = ['00000000', '11111111', '22222222'];
      if (rutsInvalidos.includes(raw)) return { invalidRut: true };

      const dv = raw[raw.length - 1];
      const num = raw.slice(0, -1);
      let suma = 0;
      let mul = 2;
      for (let i = num.length - 1; i >= 0; i--) {
        suma += parseInt(num[i], 10) * mul;
        mul = mul === 7 ? 2 : mul + 1;
      }
      const dvCalc = 11 - (suma % 11);
      const dvValido =
        dvCalc === 11 ? '0' :
        dvCalc === 10 ? 'K' :
        dvCalc.toString();
      return dv.toUpperCase() !== dvValido
        ? { invalidDv: true }
        : null;
    };

    // Validador personalizado para número de casa
    const validarCasa = (control: FormControl) => {
      const v = control.value;
      if (!v) return null;
      if (!/^[0-9]+$/.test(v)) return { invalidNumber: true };
      const num = parseInt(v, 10);
      return num < 1 || num > 100
        ? { outOfRange: true }
        : null;
    };

    // Validador personalizado para correo
    const validarCorreo = (control: FormControl) => {
      const v: string = control.value || '';
      if (!v) return null;
      // Verificar formato básico de correo: algo@algo.algo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(v) ? null : { invalidFormat: true };
    };

    this.usuarioForm = this.fb.group({
      rut:     ['', [Validators.required, validarRut]],
      nombre:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      celular: ['', [Validators.required, validarCelular]],
      casa:    ['', [Validators.required, validarCasa]],
      correo:  ['', [Validators.required, Validators.email, validarCorreo]]
    });

    // Auto-formatear celular con +56
    this.usuarioForm.get('celular')?.valueChanges.subscribe(val => {
      if (!val) return;
      const nums = val.replace(/\D/g, '');
      if (nums.length >= 9 && !nums.startsWith('56')) {
        this.usuarioForm.get('celular')?.setValue('+56' + nums, { emitEvent: false });
      }
    });
  }

  async crearUsuario() {
    if (this.usuarioForm.invalid) {
      const errors: string[] = [];
      Object.keys(this.usuarioForm.controls).forEach(key => {
        const ctrl = this.usuarioForm.get(key);
        if (ctrl?.errors) {
          if (key === 'rut') {
            if (ctrl.errors['invalidRut']) errors.push('RUT inválido');
            if (ctrl.errors['invalidDv'])  errors.push('Dígito verificador incorrecto');
          }
          if (key === 'celular' && ctrl.errors['minLength']) {
            errors.push('El celular debe tener al menos 10 dígitos');
          }
          if (key === 'casa') {
            if (ctrl.errors['invalidNumber']) errors.push('Casa debe ser un número');
            if (ctrl.errors['outOfRange'])   errors.push('Casa debe estar entre 1 y 100');
          }
          if (key === 'correo') {
            if (ctrl.errors['invalidDomain']) errors.push('Dominio de correo no permitido');
            if (ctrl.errors['invalidFormat']) errors.push('Formato de correo inválido');
            if (ctrl.errors['email'])         errors.push('Email con formato erróneo');
          }
          if (ctrl.errors['required']) {
            errors.push(`El campo ${key} es requerido`);
          }
        }
      });
      const alert = await this.alertCtrl.create({
        header: 'Errores de validación',
        message: errors.join('<br>'),
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Generar contraseña temporal
    const password = Math.random().toString(36).slice(-8);
    const data = {
      rut: this.usuarioForm.value.rut,
      nombre: this.usuarioForm.value.nombre,
      celular: this.usuarioForm.value.celular,
      casa: this.usuarioForm.value.casa,
      correo: this.usuarioForm.value.correo,
      role: 'usuario' as const, // Rol por defecto como 'usuario'
      password
    };

    try {
      await this.authService.registrarUsuario(data);
      const alert = await this.alertCtrl.create({
        header: 'Usuario creado',
        message: `La contraseña temporal es: <strong>${password}</strong>\n\nEl usuario ha sido creado exitosamente.`,
        buttons: ['Aceptar']
      });
      await alert.present();
      this.usuarioForm.reset();
      this.navCtrl.back();
    } catch (err: any) {
      console.error('Error al crear usuario', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message || 'No se pudo crear el usuario',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cancelar() {
    this.navCtrl.back();
  }
}
