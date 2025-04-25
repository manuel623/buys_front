import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  activeButton: boolean = false;
  loading: boolean = false;

  constructor(
    private _router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  verificationLogin(): void {
    if (this.loginForm.valid) {
      this.activeButton = true;
      this.loading = true;
      const datos = this.loginForm.value;

      this.authService.login({ email: datos.email, password: datos.password }).subscribe(
        (response) => {
          localStorage.setItem('token', JSON.stringify(response.token));
          localStorage.setItem('user', JSON.stringify(response.user));
          this.activeButton = false;
          this.loading = false;
          this._router.navigate(['/admin']);
        },
        (error) => {
          this.activeButton = false;
          this.loading = false;
          Swal.fire({
            title: 'Advertencia',
            text: error.error.error,
            icon: 'warning',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }
}
