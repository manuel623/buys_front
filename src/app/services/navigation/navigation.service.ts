import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * redirige al home de la pagina
   */
  goToInicio() {
    this.router.navigate(['/home']);
  }

  /**
   * redirige a los productos de la pagina
   */
  goToProduct() {
    this.router.navigate(['/product']);
  }

  /**
   * redirige a los compradores de la pagina
   */
  goToBuyer() {
    this.router.navigate(['/buyer']);
  }

  /**
   * redirige a las ordenes de la pagina
   */
  goToOrder() {
    this.router.navigate(['/order']);
  }

  /**
   * redirige a los usuarios de la pagina
   */
  goToUser() {
    this.router.navigate(['/user']);
  }
}