import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  goToInicio() {
    this.router.navigate(['/home']);
  }

  goToProduct() {
    this.router.navigate(['/product']);
  }

  goToBuyer() {
    this.router.navigate(['/buyer']);
  }

  goToOrder() {
    this.router.navigate(['/order']);
  }

  goToUser() {
    this.router.navigate(['/user']);
  }
}