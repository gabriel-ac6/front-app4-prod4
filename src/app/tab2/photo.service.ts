import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(private http: HttpClient, private router: Router) { }

  public async addNewToGallery() {
    // Capturar uma foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      presentationStyle: 'fullscreen',
      webUseInput: false,
      width: 354,
      height: 472,
      promptLabelHeader: 'Camera'
    });

    console.log(capturedPhoto);

    // Converter o caminho do blob para Base64
    const base64Data = await this.readAsBase64(capturedPhoto);
    console.log(base64Data);

    // Converter Base64 PNG para Base64 JPEG
    const base64JpegData = await this.convertBase64PngToBase64Jpeg(base64Data);
    console.log(base64JpegData);

    // Remover o cabeçalho "data:image/jpeg;base64,"
    const base64JpegWithoutHeader = this.removeBase64Header(base64JpegData);
    console.log(base64JpegWithoutHeader);

    // Enviar a foto em Base64 JPEG para o servidor
    this.uploadPhoto(base64JpegWithoutHeader);
  }

  private async readAsBase64(photo: Photo): Promise<string> {
    // Obter o blob a partir do caminho do blob
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private convertBase64PngToBase64Jpeg(base64Png: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Failed to get canvas context');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const base64Jpeg = canvas.toDataURL('image/jpeg');
        resolve(base64Jpeg);
      };
      img.onerror = (error) => reject(error);
      img.src = base64Png;
    });
  }

  private removeBase64Header(base64Data: string): string {
    return base64Data.split(',')[1];
  }

  private uploadPhoto(base64Data: string) {
    const token = sessionStorage.getItem('sessionToken'); // Obter o token JWT da sessão

    if (!token) {
      console.error('Nenhum token de sessão encontrado.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    const body = { photo_file: base64Data };

    this.http.post('/api/profile/photo', body, { headers, observe: 'response', responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao enviar a foto:', error);
          return throwError(() => new Error('Erro ao enviar a foto'));
        })
      )
      .subscribe(
        (response: HttpResponse<any>) => {
          if (response.status === 200) {
            console.log('Foto enviada com sucesso:', response.body);
            this.deleteAllSessions();
          } else {
            console.error('Erro ao enviar a foto:', response);
          }
        }
      );
  }

  public deleteAllSessions() {
    // Remover o token e outras sessões armazenadas no sessionStorage
    sessionStorage.removeItem('sessionToken');
    sessionStorage.clear();

    // Fazer a requisição DELETE para o servidor
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
}
