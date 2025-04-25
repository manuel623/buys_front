import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import Swal from 'sweetalert2';
import { ApiResponse, IUser } from '../../models/user/user.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  public loadingTable: boolean = true;
  public viewForm: boolean = false;
  public userForm: FormGroup;
  public dataTempUser: IUser | null = null;
  public dataUser: IUser[] = [];
  public createUserButton: boolean = false;
  public isSubmitting: boolean = false;

  constructor(
    private _userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7)]]
    });
  }

  ngOnInit(): void {
    this.getDataUser();
  }

  /**
   * se obtiene los datos de los compradores y los asigna a la variable dataUser
   */
  getDataUser(): void {
    this.loadingTable = true;
    this._userService.listUser().subscribe(
      (response: ApiResponse) => {
        this.dataUser = response.original.data;
        this.loadingTable = false;
      },
      (error) => {
        this.loadingTable = false;
        this.handleError(error)
      }
    );
  }

  /**
   * muestra el formulario para crear un nuevo usuario o editar uno existente
   */
  viewFormCreate(): void {
    this.userForm.reset();
    this.dataTempUser = null;
    this.viewForm = true;
  }

  /**
   * maneja la acción de enviar el formulario, ya sea para crear o editar un usuario
   */
  submitForm(): void {
    if (this.dataTempUser) {
      this.editUser();
    } else {
      this.createUser();
    }
  }

  /**
   * maneja la respuesta de éxito y la notificación de éxito
   */
  private handleResponse(response: ApiResponse, onSuccess: () => void): void {
    if (response.original.success) {
      this.getDataUser();
      this.notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this.notificationService.showWarning('Error al procesar tu solicitud.');
    }
  }

  /**
   * Maneja el error y muestra una notificación de error
   */
  private handleError(error: any): void {
    this.notificationService.showError(error);
  }

  /**
   * maneja el estado de carga activando o desactivando payload
   */
  private handleLoadingState(isLoading: boolean): void {
    this.createUserButton = isLoading;
    this.loadingTable = isLoading;
  }

  /**
   * Edita un usuario
   */
  editUser(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      this.handleLoadingState(true);
      const data = this.prepareUserData();

      this._userService.editUser(data, this.dataTempUser!.id).subscribe(
        (response: ApiResponse) => {
          this.isSubmitting = false;
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.isSubmitting = false;
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      this.handleLoadingState(true);

      this._userService.createUser(this.userForm.value).subscribe(
        (response: ApiResponse) => {
          this.isSubmitting = false;
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.isSubmitting = false;
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  /**
   * asigna los datos de un usuario para editar el registro
   */
  editViewUser(id: number): void {
    this.userForm.reset();
    this.viewForm = true;
    this.dataTempUser = this.dataUser.find((user) => user.id === id) || null;

    if (this.dataTempUser) {
      this.userForm.patchValue(this.dataTempUser);
    }
  }

  /**
   * Elimina un usuario, pidiendo confirmación al usuario antes de proceder.
   */
  deleteUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el registro permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this._userService.deleteUser(id).subscribe(
          (response: ApiResponse) => {
            this.getDataUser();
            this.notificationService.showSuccess(response.original.message);
          },
          (error) => {
            this.notificationService.showError('Error al eliminar el registro.');
          }
        );
      }
    });
  }

  /**
   * Prepara los datos del usuario antes de enviarlos al backend
   */
  private prepareUserData(): IUser {
    return {
      id: this.dataTempUser!.id,
      name: this.userForm.get('name')!.value,
      email: this.userForm.get('email')!.value,
      password: this.userForm.get('password')!.value,
    };
  }

  /**
   * Regresa a la vista principal sin mostrar el formulario.
   */
  goBack(): void {
    this.viewForm = false;
  }
}
