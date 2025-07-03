import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonContent, 
  IonAvatar, 
  IonChip, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonButton,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonModal,
  IonHeader as IonModalHeader,
  IonToolbar as IonModalToolbar,
  IonTitle as IonModalTitle,
  IonContent as IonModalContent,
  IonButtons as IonModalButtons,
  IonButton as IonModalButton,
  IonItem as IonModalItem,
  IonLabel as IonModalLabel,
  IonInput as IonModalInput,
  IonText as IonModalText,
  IonNote,
  IonLoading,
  IonRippleEffect
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule,
    IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonTitle, 
    IonContent, 
    IonAvatar, 
    IonChip, 
    IonList, 
    IonItem, 
    IonIcon, 
    IonLabel, 
    IonButton,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonModal,
    IonModalHeader,
    IonModalToolbar,
    IonModalTitle,
    IonModalContent,
    IonModalButtons,
    IonModalButton,
    IonModalItem,
    IonModalLabel,
    IonModalInput,
    IonNote,
    IonRippleEffect
  ]
})
export class PerfilUsuarioPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  usuario: any = null;
  cargando = true;
  error: string | null = null;
  
  // Estado del modal de cambio de contraseña
  isModalOpen = false;
  cambioContrasenaForm: FormGroup = this.fb.group({
    contrasenaActual: ['', [Validators.required, Validators.minLength(6)]],
    nuevaContrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmarContrasena: ['', [Validators.required]]
  }, { validators: this.coincidenContrasenas });
  cambiandoContrasena = false;
  errorCambioContrasena: string | null = null;
  cambioExitoso = false;

  ngOnInit() {
    this.cargarPerfil();
    this.inicializarFormulario();
    console.log('Componente de perfil inicializado');
  }
  
  /**
   * Enfoca un campo del formulario
   * @param nombreCampo Nombre del campo a enfocar
   */
  private enfocarCampo(nombreCampo: string) {
    // Usamos setTimeout para asegurarnos de que el DOM se haya actualizado
    setTimeout(() => {
      const input = document.querySelector(`ion-input[formControlName="${nombreCampo}"]`);
      if (input) {
        (input as HTMLIonInputElement).setFocus().catch(err => {
          console.error('Error al enfocar el campo:', err);
        });
      }
    }, 100);
  }

  private inicializarFormulario() {
    console.log('Inicializando formulario de cambio de contraseña');
    this.cambioContrasenaForm.reset();
  }
  
  private coincidenContrasenas(group: FormGroup) {
    const nueva = group.get('nuevaContrasena')?.value;
    const confirmar = group.get('confirmarContrasena')?.value;
    return nueva === confirmar ? null : { noCoinciden: true };
  }
  
  abrirModalCambioContrasena() {
    this.isModalOpen = true;
    this.cambioContrasenaForm.reset();
    this.errorCambioContrasena = null;
    this.cambioExitoso = false;
  }
  
  cerrarModal() {
    this.isModalOpen = false;
  }

  cargarPerfil() {
    this.authService.appUser$.subscribe({
      next: (user) => {
        this.usuario = user;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.error = 'No se pudo cargar el perfil. Por favor, inténtalo de nuevo.';
        this.cargando = false;
      }
    });
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.error = 'Error al intentar cerrar sesión';
    }
  }
  
  /**
   * Maneja el envío del formulario de cambio de contraseña
   */
  async cambiarContrasena() {
    console.log('Iniciando cambio de contraseña desde el componente...');
    
    // Validar el formulario
    if (this.cambioContrasenaForm.invalid) {
      console.log('Formulario inválido', this.cambioContrasenaForm.errors);
      this.cambioContrasenaForm.markAllAsTouched();
      
      // Mostrar mensajes de validación específicos
      const controls = this.cambioContrasenaForm.controls;
      if (controls['contrasenaActual']?.errors?.['required']) {
        this.errorCambioContrasena = 'La contraseña actual es requerida';
        this.enfocarCampo('contrasenaActual');
      } else if (controls['nuevaContrasena']?.errors?.['required']) {
        this.errorCambioContrasena = 'La nueva contraseña es requerida';
        this.enfocarCampo('nuevaContrasena');
      } else if (controls['nuevaContrasena']?.errors?.['minlength']) {
        this.errorCambioContrasena = 'La nueva contraseña debe tener al menos 6 caracteres';
        this.enfocarCampo('nuevaContrasena');
      } else if (controls['confirmarContrasena']?.errors?.['required']) {
        this.errorCambioContrasena = 'Debes confirmar la nueva contraseña';
        this.enfocarCampo('confirmarContrasena');
      } else if (this.cambioContrasenaForm.hasError('noCoinciden')) {
        this.errorCambioContrasena = 'Las contraseñas no coinciden';
        this.enfocarCampo('confirmarContrasena');
      } else {
        this.errorCambioContrasena = 'Por favor completa todos los campos requeridos correctamente';
      }
      
      return;
    }
    
    this.cambiandoContrasena = true;
    this.errorCambioContrasena = null;
    this.cambioExitoso = false;
    
    try {
      const { contrasenaActual, nuevaContrasena } = this.cambioContrasenaForm.value;
      console.log('Datos del formulario:', { tieneContrasenaActual: !!contrasenaActual, tieneNuevaContrasena: !!nuevaContrasena });
      
      // Validaciones adicionales
      if (!contrasenaActual) {
        throw new Error('La contraseña actual es requerida');
      }
      
      if (!nuevaContrasena) {
        throw new Error('La nueva contraseña es requerida');
      }
      
      if (nuevaContrasena.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }
      
      // Intentar cambiar la contraseña
      console.log('Llamando a authService.cambiarContrasena...');
      await this.authService.cambiarContrasena(contrasenaActual, nuevaContrasena);
      
      console.log('Contraseña cambiada con éxito');
      // Éxito: mostrar mensaje y cerrar el modal después de 2 segundos
      this.cambioExitoso = true;
      this.errorCambioContrasena = null;
      
      // Limpiar el formulario
      this.cambioContrasenaForm.reset();
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        this.cerrarModal();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      // Mostrar el mensaje de error al usuario
      this.errorCambioContrasena = error.message || 'Ocurrió un error al cambiar la contraseña. Inténtalo de nuevo.';
      
      // Enfocar el campo correspondiente según el error
      if (error.message?.toLowerCase().includes('actual') || error.message?.toLowerCase().includes('incorrecta')) {
        this.enfocarCampo('contrasenaActual');
      } else if (error.message?.toLowerCase().includes('nueva') || error.message?.toLowerCase().includes('débil')) {
        this.enfocarCampo('nuevaContrasena');
      }
    } finally {
      this.cambiandoContrasena = false;
    }
  }
}
