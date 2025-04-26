import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  showLoading() {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  showSuccessPromise(message: string) {
    return Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  showSuccess(message: string) {
    Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  showInfo(message: string) {
    Swal.fire({
      title: 'Info!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  showError(message: string) {
    Swal.fire({
      title: '¡Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  showWarning(message: string) {
    Swal.fire({
      title: '¡Ups! Algo salió mal',
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }
}
