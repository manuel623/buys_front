import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  public user_information: any | null = null;

  constructor(
    private router: Router,
    public nav: NavigationService
  ) {
    const storedUserInfo = localStorage.getItem('user');
    this.user_information = storedUserInfo ? JSON.parse(storedUserInfo) : null;
  }
}
