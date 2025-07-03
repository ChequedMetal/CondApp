import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-crear-anuncio',
  templateUrl: './crear-anuncio.component.html',
  styleUrls: ['./crear-anuncio.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class CrearAnuncioComponent {
  @Output() anuncioCreado = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();
  
  anuncioForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.anuncioForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['general', [Validators.required]]
    });
  }
  
  onSubmit() {
    if (this.anuncioForm.valid) {
      const nuevoAnuncio = {
        ...this.anuncioForm.value,
        fecha: new Date(),
        autor: 'Admin Condominio', // O el nombre del usuario actual
        avatar: ''
      };
      
      this.anuncioCreado.emit(nuevoAnuncio);
      this.anuncioForm.reset({ categoria: 'general' });
    }
  }
  
  onCancel() {
    this.cancelar.emit();
  }
}
