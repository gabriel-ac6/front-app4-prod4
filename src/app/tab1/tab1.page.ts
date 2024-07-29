import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Tab1Service } from '../tab1/tab1.service';
import { ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TabsPage } from '../tabs/tabs.page'; // Importar o TabsPage para acessar o BehaviorSubject

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab1Page implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  matricula: string = '';
  token: string = '';
  isDarkTheme = false;
  stream: MediaStream | undefined;
  photo: SafeResourceUrl | null = null;

  constructor(private tab1Service: Tab1Service, private toastController: ToastController, private sanitizer: DomSanitizer, private router: Router, private tabsPage: TabsPage) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  checkLoginStatus() {
    const sessionToken = sessionStorage.getItem('sessionToken');
    if (sessionToken) {
      this.router.navigate(['/tabs/tab2']);
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  validar() {
    const data = {
      registry: this.matricula,
      keycode: this.token
    };

    this.tab1Service.validarMatriculaEToken(data).subscribe(
      async (response) => {
        this.presentToast('Matrícula e token válidos!', 'success');
        console.log('Matrícula e token válidos!', response);

        if (response.token) {
          sessionStorage.setItem('sessionToken', response.token);
          console.log('Token armazenado na sessão:', response.token);
          this.tabsPage.isLoggedIn.next(true); // Atualizar o estado de login
        }

        await this.startCamera();
      },
      (error) => {
        if (error.status === 400) {
          this.presentToast('Matrícula ou token inválidos.', 'danger');
          console.log('Matrícula ou token inválidos.', error.error);
        } else {
          this.presentToast('Erro ao validar matrícula e token.', 'danger');
          console.error('Erro ao fazer a requisição:', error);
        }
      }
    );
  }

  async startCamera() {
    try {
      this.stopCamera();
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = this.videoElement.nativeElement;
      videoElement.srcObject = this.stream;
      this.router.navigate(['/tabs/tab2']);
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      this.presentToast('Erro ao acessar a câmera.', 'danger');
      this.tab1Service.deleteAllSessions();
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark', this.isDarkTheme);
  }

  validarCampos() {
    console.log('Matrícula digitada:', this.matricula);
    console.log('Token digitado:', this.token);
    let vazio = 0;

    if (this.matricula && this.token) {
      vazio = 0; 
      this.validar();
    } else {
      this.presentToast('Preencha todos os campos.', 'warning');
      vazio = 1;
      console.log('Preencha todos os campos.');
    }
  }

  onMatriculaInput(event: any) {
    this.matricula = event.target.value;
  }

  onTokenInput(event: any) {
    this.token = event.target.value;
  }
}
