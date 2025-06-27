import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-crear-usuarios',
  templateUrl: './crear-usuarios.page.html',
  styleUrls: ['./crear-usuarios.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CrearUsuariosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
