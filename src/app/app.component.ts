import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import {register} from 'swiper/element/bundle';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule, HttpClientModule],
  providers: [HttpClientModule],
})
export class AppComponent {
  constructor() {}
}
