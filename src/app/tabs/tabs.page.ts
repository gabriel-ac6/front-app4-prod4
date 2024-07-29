import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, logInOutline, cameraOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private http: HttpClient, private toastController: ToastController) {
    addIcons({ logOutOutline, logInOutline, cameraOutline });
  }

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const sessionToken = sessionStorage.getItem('sessionToken');
    this.isLoggedIn.next(!!sessionToken);
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  public deleteAllSessions() {
    // Remover o token e outras sessões armazenadas no sessionStorage
    sessionStorage.removeItem('sessionToken');
    sessionStorage.clear();

    // Atualizar o estado de login
    this.isLoggedIn.next(false);

    // Fazer a requisição DELETE para o servidor
    this.http.delete('http://localhost:8081/auth/session', { responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao deletar as sessões no servidor:', error);
          return throwError(() => new Error('Erro ao deletar as sessões no servidor'));
        })
      )
      .subscribe(
        response => {
          console.log('Sessões deletadas com sucesso no servidor:', response);
          this.router.navigate(['/tabs/tab1']);
        },
        error => {
          console.error('Erro ao deletar as sessões no servidor:', error);
        }
      );
  }
}
