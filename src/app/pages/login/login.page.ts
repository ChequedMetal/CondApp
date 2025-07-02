// src/app/login/login.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Platform, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

// Importaciones de componentes de Ionic
import { 
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonIcon,
  IonSpinner,
  IonNote
} from '@ionic/angular/standalone';

import { AuthService, AppUser } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToast,
    IonIcon,
    IonSpinner,
    IonNote,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {
  // Formulario reactivo
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Estados UI
  isLoading = false;
  showPassword = false;
  isKeyboardOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private platform: Platform
  ) {}

  ngOnInit() {
    // Redirigir a home después de iniciar sesión, independientemente del rol
    this.authService.appUser$.subscribe((user: AppUser | null) => {
      if (user) {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      }
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      return this.showToast('Por favor completa todos los campos correctamente.', 'danger');
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    try {
      // Intentar login en Firebase
      await this.authService.login(email!, password!);
      // La suscripción en ngOnInit se encargará de redirigir
    } catch (err) {
      console.error('Error en login:', err);
      await this.showToast('Credenciales incorrectas.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async showToast(message: string, color: 'danger' | 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
