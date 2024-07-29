import { Component, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { PhotoService } from './photo.service';
import Swiper from 'swiper';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['tab2.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modalVideoElement') modalVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('modalCanvasElement') modalCanvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('swiperEx') swiperEx?: ElementRef<{ swiper: Swiper }>;

  photo: SafeResourceUrl | null = null;
  isDarkTheme: boolean = false;
  showInstructions: boolean = true;
  isPhotoTaken: boolean = false; // Nova variável para controle da visibilidade
  stream: MediaStream | undefined;
  modalStream: MediaStream | undefined;

  isPrevButtonDisabled: boolean = true;
  isNextButtonDisabled: boolean = true;
  isSlideDraggingDisabled: boolean = true;
  progressBarWidth: string = '0%';
  remainingTime: number = 0;

  isCameraModalOpen = false;
  photoUrl: string | undefined;

  constructor(private http: HttpClient, private router: Router, public photoService: PhotoService, private sanitizer: DomSanitizer) {}

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  ngOnInit() {
    if (!this.showInstructions) {
      this.startCamera();
    }

    this.disableButtons();
    this.startProgressBar();
    setTimeout(() => {
      this.enableButtons();
    }, 3000);
  }

  ngAfterViewInit() {
    if (this.swiperEx) {
      this.swiperEx.nativeElement.swiper.on('slideChange', () => {
        this.onSlideChange();
      });
    }
    // Garanta que a câmera seja iniciada ao carregar o componente
    if (!this.showInstructions) {
      this.startCamera();
    }
    console.log('Câmera iniciada');
  }

  ngOnDestroy() {
    this.stopCamera();
    this.stopModalCamera();
  }
  
  cancelPhoto() {
    this.photo = null;  // Limpa a foto
    this.isPhotoTaken = false;  // Volta ao estado inicial onde a câmera é visível
    // Inicia a câmera novamente se necessário
    this.startCamera();
  }
  
  async startCamera() {
    try {
      // Solicite permissão para usar a câmera
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = this.videoElement.nativeElement;
      videoElement.srcObject = this.stream;
      videoElement.play();  // Adicione isso para garantir que o vídeo comece a ser reproduzido
    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      this.photoService.deleteAllSessions();
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }
  }

  async startModalCamera() {
    try {
      // Solicite permissão para usar a câmera na modal
      this.modalStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const modalVideoElement = this.modalVideoElement.nativeElement;
      modalVideoElement.srcObject = this.modalStream;
      modalVideoElement.play();  // Adicione isso para garantir que o vídeo comece a ser reproduzido
    } catch (err) {
      console.error('Erro ao acessar a câmera na modal:', err);
    }
  }

  stopModalCamera() {
    if (this.modalStream) {
      this.modalStream.getTracks().forEach(track => track.stop());
      this.modalStream = undefined;
    }
  }

  async takePicture() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Image = dataUrl.split(',')[1];
      this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
      
      // Atualize o estado para esconder o vídeo e os botões
      this.isPhotoTaken = true;

      console.log('Base64 Image:', base64Image);
    } else {
      console.error('Contexto é nulo');
    }
  }

  isTermsAccepted: boolean = false;

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark', this.isDarkTheme);
  }

   // Método para atualizar o estado do checkbox
   onCheckboxChange(event: any) {
    this.isTermsAccepted = event.target.checked;
  }

  // Método para lidar com o clique no botão Finalizar
  toggleVisibility() {
    if (this.isTermsAccepted) {
      // Alterna a visibilidade das instruções
      this.showInstructions = !this.showInstructions;

      // Inicia ou para a câmera com base no estado atual das instruções
      if (!this.showInstructions) {
        this.startCamera();
      } else {
        this.stopCamera();
      }
    } else {
      // Mensagem de erro ou alerta se os termos não foram aceitos
      alert('Você deve aceitar os termos de uso para prosseguir.');
    }
  }


  onSlideChange() {
    console.log(this.swiperEx?.nativeElement.swiper.activeIndex);
    this.disableButtons();
    this.startProgressBar();
    setTimeout(() => {
      this.enableButtons();
    }, 3000);
  }

  onSlidePrev() {
    if (!this.isPrevButtonDisabled) {
      this.swiperEx?.nativeElement.swiper.slidePrev();
      this.disableButtons();
      this.startProgressBar();
      setTimeout(() => {
        this.enableButtons();
      }, 3000);
    }
  }

  onSlideNext() {
    if (!this.isNextButtonDisabled) {
      this.swiperEx?.nativeElement.swiper.slideNext();
      this.disableButtons();
      this.startProgressBar();
      setTimeout(() => {
        this.enableButtons();
      }, 3000);
    }
  }

  disableButtons() {
    this.isPrevButtonDisabled = true;
    this.isNextButtonDisabled = true;
    this.isSlideDraggingDisabled = true;
    this.progressBarWidth = '0%';
  }

  enableButtons() {
    this.isPrevButtonDisabled = false;
    this.isNextButtonDisabled = false;
    this.isSlideDraggingDisabled = false;
    this.remainingTime = 3;
    const interval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime < 0) {
        clearInterval(interval);
        this.remainingTime = 0;
      }
    }, 1000);
  }

  setupCamera() {
    const video = this.videoElement.nativeElement;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(error => {
        console.error(error);
      });
  }

  openCameraModal() {
    this.isCameraModalOpen = true;
    this.startModalCamera(); // Inicia a câmera ao abrir a modal
  }

  closeCameraModal() {
    this.isCameraModalOpen = false;
    this.stopModalCamera(); // Para a câmera ao fechar a modal
  }

  async capturePhoto() {
    const videoElement = this.modalVideoElement.nativeElement;
    const canvasElement = this.modalCanvasElement.nativeElement;
    const context = canvasElement.getContext('2d');
  
    if (context) {
      // Defina o tamanho do canvas para 85x114 pixels (aproximadamente 3x4 cm)
      canvasElement.width = 85;
      canvasElement.height = 114;
      
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      const photoBlob = await new Promise<Blob | null>((resolve) =>
        canvasElement.toBlob((blob) => resolve(blob))
      );
  
      if (photoBlob) {
        this.photoUrl = URL.createObjectURL(photoBlob);
      }
    }
  }
  
  async sendPhoto() {
    if (this.photo) {
      // Extraia o Base64 diretamente do Data URL
      const dataUrl = (this.photo as any).changingThisBreaksApplicationSecurity as string;
      const base64Image = dataUrl.split(',')[1]; // Extraia a parte Base64 do Data URL
  
      console.log('Base64 Image:', base64Image);
  
      try {
        await this.uploadPhoto(base64Image);
        console.log('Foto enviada com sucesso!');
        this.deleteAllSessions();
        this.photo = null; // Limpe a foto após o envio
        this.closeCameraModal();
      } catch (error) {
        console.error('Erro ao enviar a foto:', error);
      }
    } else {
      console.error('Nenhuma foto disponível para envio.');
    }
  }
  

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async uploadPhoto(base64Image: string): Promise<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    try {
      const response = await this.http.post('/api/profile/photo', 
        { image: base64Image }, { headers }).toPromise();
      console.log('Upload Response:', response); // Verifique a resposta do upload
    } catch (error) {
      console.error('Erro ao enviar a foto:', error);
      throw error;
    }
  }
  

  deleteAllSessions() {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.clear();

    this.http.delete('/api/auth/session', { responseType: 'text' })
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


  startProgressBar() {
    this.progressBarWidth = '0%';
    const interval = setInterval(() => {
      if (parseFloat(this.progressBarWidth) < 100) {
        this.progressBarWidth = (parseFloat(this.progressBarWidth) + 1) + '%';
      } else {
        clearInterval(interval);
      }
    }, 30);
  }
}
