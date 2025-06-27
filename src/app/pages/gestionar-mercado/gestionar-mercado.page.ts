import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestionar-mercado',
  templateUrl: './gestionar-mercado.page.html',
  styleUrls: ['./gestionar-mercado.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestionarMercadoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
