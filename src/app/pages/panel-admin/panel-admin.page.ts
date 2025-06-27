import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  settingsOutline,
  cartOutline,
  alertCircleOutline,
  personAddOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({ settingsOutline, cartOutline, alertCircleOutline, personAddOutline });

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  templateUrl: './panel-admin.page.html',
  styleUrls: ['./panel-admin.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    CommonModule,
    RouterModule
  ]
})
export class PanelAdminPage {}
