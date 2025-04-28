import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerService } from '../../services/buyer/buyer.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import Swal from 'sweetalert2';
import { ApiResponse, Buyer } from '../../models/buyer/buyer.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../shared/navbar/navbar.component";

@Component({
  selector: 'app-buyer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './buyer.component.html',
  styleUrl: './buyer.component.css'
})
export class BuyerComponent implements OnInit {

  public loadingTable: boolean = true;
  public viewForm: boolean = false;
  public buyerForm: FormGroup;
  public dataTempBuyer: Buyer | null = null;
  public dataBuyer: Buyer[] = [];
  public createBuyerButton: boolean = false;

  constructor(
    private _buyerService: BuyerService,
    private fb: FormBuilder,
    private _notificationService: NotificationService
  ) {
    this.buyerForm = this.fb.group({
      document: ['', [Validators.required, Validators.minLength(5)]],
      first_name: ['', Validators.required],
      second_name: [''],
      first_last_name: ['',],
      second_last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getDataBuyer();
  }

  /**
   * se obtiene los datos de los compradores y los asigna a la variable dataBuyer
   */
  getDataBuyer(): void {
    this.loadingTable = true;
    this._buyerService.listBuyer().subscribe(
      (response: ApiResponse) => {
        this.dataBuyer = response.original.data;
        this.loadingTable = false;
      },
      (error) =>{
        this.loadingTable = false;
        this._notificationService.showError(error);
      } 
    );
  }

  /**
   * muestra el formulario para crear un nuevo comprador o editar uno existente
   */
  viewFormCreate(): void {
    this.buyerForm.reset();
    this.dataTempBuyer = null;
    this.viewForm = true;
  }

  /**
   * maneja la acción de enviar el formulario, ya sea para crear o editar un comprador
   */
  submitForm(): void {
    if (this.dataTempBuyer) {
      this.editUser();
    } else {
      this.createUser();
    }
  }

  /**
   * maneja la respuesta de éxito y la notificación de éxito
   * @param response 
   * @param onSuccess 
   */
  private handleResponse(response: ApiResponse, onSuccess: () => void): void {
    if (response.original.success) {
      this.getDataBuyer();
      this._notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this._notificationService.showWarning('Error al procesar tu solicitud.');
    }
  }

  /**
   * maneja el estado de carga activando o desactivando payload
   * @param isLoading 
   */
  private handleLoadingState(isLoading: boolean): void {
    this.createBuyerButton = isLoading;
    this.loadingTable = isLoading;
  }

  /**
   * edita un comprador
   */
  editUser(): void {
    if (this.buyerForm.valid) {
      this.handleLoadingState(true);
      const data = this.prepareBuyerData();

      this._buyerService.editBuyer(data, this.dataTempBuyer!.id).subscribe(
        (response: ApiResponse) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.handleLoadingState(false);
          this._notificationService.showError(error);
        }
      );
    }
  }

  /**
   * crea un nuevo comprador
   */
  createUser(): void {
    if (this.buyerForm.valid) {
      this.handleLoadingState(true);

      this._buyerService.createBuyer(this.buyerForm.value).subscribe(
        (response: ApiResponse) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.handleLoadingState(false);
          this._notificationService.showError(error);
        }
      );
    }
  }

  /**
   * asigna los datos de un comprador para editar el registro
   * @param id 
   */
  editViewBuyer(id: number): void {
    this.buyerForm.reset();
    this.viewForm = true;
    this.dataTempBuyer = this.dataBuyer.find((buyer) => buyer.id === id) || null;

    if (this.dataTempBuyer) {
      this.buyerForm.patchValue(this.dataTempBuyer);
    }
  }

  /**
   * elimina un comprador, pidiendo confirmación al usuario antes de proceder
   * @param id 
   */
  deleteBuyer(id: number): void {
    this._notificationService.showDeleteConfirmation().then((result) => {
      if (result.isConfirmed) {
        this._notificationService.showLoading();
        this._buyerService.deleteBuyer(id).subscribe({
          next: (response) => {
            this.getDataBuyer();
            this._notificationService.showSuccess(response.original.message);
          },
          error: (error) => {
            this._notificationService.showError('Tuvimos un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.');
          }
        } );
      } else {
        console.log('Eliminación cancelada');
      }
    });
  }

  /**
   * prepara los datos del comprador antes de enviarlos al backend
   */
  private prepareBuyerData(): Buyer {
    return {
      id: this.dataTempBuyer!.id,
      document: this.buyerForm.get('document')!.value,
      first_name: this.buyerForm.get('first_name')!.value,
      second_name: this.buyerForm.get('second_name')!.value,
      first_last_name: this.buyerForm.get('first_last_name')!.value,
      second_last_name: this.buyerForm.get('second_last_name')!.value,
      phone: this.buyerForm.get('phone')!.value,
      email: this.buyerForm.get('email')!.value,
    };
  }

  /**
   * regresa a la vista principal sin mostrar el formulario
   */
  goBack(): void {
    this.viewForm = false;
  }
}
