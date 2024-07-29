import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Tab1Service {
  private apiUrl = '/api/auth/session'; // Substitua pela sua URL de API

  constructor(private http: HttpClient) {}

  // Método para enviar matrícula e token para a API
  validarMatriculaEToken(data: { registry: string; keycode: string }): Observable<any> {
    console.log(data);

    // Printar o tamanho de cada string
    console.log('Tamanho da matrícula:', data.registry.length);
    console.log('Tamanho do token:', data.keycode.length);
    
    return this.http.post<any>(this.apiUrl, data).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao validar matrícula e token:', error);
        return throwError(() => new Error('Erro ao validar matrícula e token'));
      })
    );
  }

  public deleteAllSessions() {
    // Remover o token e outras sessões armazenadas no sessionStorage
    sessionStorage.removeItem('sessionToken');
    sessionStorage.clear();

    // Fazer a requisição DELETE para o servidor
    return this.http.delete('/api/auth/session', { responseType: 'text' })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao deletar as sessões no servidor:', error);
          return throwError(() => new Error('Erro ao deletar as sessões no servidor'));
        })
      );
  }
}
