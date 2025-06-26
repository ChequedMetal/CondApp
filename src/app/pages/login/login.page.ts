import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
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
} from '@ionic/angular/standalone';

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
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class LoginPage {
  // Estados del componente
  isLoading = false;
  showPassword = false;
  isKeyboardOpen = false;
  showError = false;
  errorMessage = '';

  // Inicializar el formulario con valores por defecto
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Credenciales de prueba
  private readonly USUARIOS = [
    {
      email: 'usuario@ejemplo.com',
      password: 'password123',
      nombre: 'Usuario Normal',
      rol: 'usuario',
      avatar: 'assets/avatars/user.png'
    },
    {
      email: 'admin@ejemplo.com',
      password: 'admin123',
      nombre: 'Administrador',
      rol: 'admin',
      avatar: 'assets/avatars/admin.png'
    }
  ];
  
  // Usuario actual
  usuarioActual: any = null;

  // Configuración responsive
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private platform: Platform,
    private toastController: ToastController
  ) {
    // Verificar si ya hay una sesión activa
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
      this.redirigirSegunRol();
    }
  }
  
  private redirigirSegunRol() {
    if (this.usuarioActual) {
      if (this.usuarioActual.rol === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }
    }
  }

  // initForm() {
  //   // El formulario ya está inicializado en la declaración de la propiedad
  //   // Este método se mantiene por compatibilidad
  // }

  async login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.isLoading = true;
      
      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const usuario = this.USUARIOS.find(u => u.email === email && u.password === password);
      
      if (usuario) {
        this.usuarioActual = usuario;
        this.showError = false;
        
        // Guardar datos de sesión
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // Redirigir a todos a /home
        this.router.navigate(['/home']);
      } else {
        this.showError = true;
        this.errorMessage = 'Credenciales incorrectas. Intente nuevamente.';
        await this.mostrarError();
      }
    } else {
      this.showError = true;
      this.errorMessage = 'Por favor complete todos los campos correctamente.';
      await this.mostrarError();
    }
    
    this.isLoading = false;
  }
  
  async mostrarError() {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [{
        icon: 'close',
        role: 'cancel'
      }]
    });
    await toast.present();
  }
}
