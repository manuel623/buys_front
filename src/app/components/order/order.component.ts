import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order/order.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import Swal from 'sweetalert2';
import { Order, ApiResponse } from '../../models/order/order.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  public loadingTable: boolean = true;
  public viewForm: boolean = false;
  public orderForm: FormGroup;
  public dataTempOrder: Order | null = null;
  public dataOrder: Order[] = [];
  public createOrderButton: boolean = false;

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.orderForm = this.fb.group({
      total: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      billing_date: [''],
      payment_method: [''],
      has_discount: [false]
    });
  }

  ngOnInit(): void {
    this.getDataOrder();
  }

  /**
   * Carga la lista de órdenes desde el backend
   */
  getDataOrder(): void {
    this.orderService.listOrder().subscribe(
      (response: ApiResponse) => {
        this.dataOrder = response.original.data;
        this.loadingTable = false;
      },
      (error) => this.handleError(error)
    );
  }

  /**
   * Muestra el formulario para crear una nueva orden
   */
  viewFormCreate(): void {
    this.orderForm.reset({ total: 0, has_discount: false });
    this.dataTempOrder = null;
    this.viewForm = true;
  }

  /**
   * Envía el formulario para crear o editar una orden
   */
  submitForm(): void {
    if (this.dataTempOrder) {
      this.editOrder();
    } else {
      this.createOrder();
    }
  }

  /**
   * Crea una nueva orden en el backend
   */
  createOrder(): void {
    if (this.orderForm.valid) {
      this.handleLoadingState(true);

      this.orderService.createOrder(this.orderForm.value).subscribe(
        (response: ApiResponse) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  /**
   * Edita una orden existente en el backend
   */
  editOrder(): void {
    if (this.orderForm.valid && this.dataTempOrder?.id !== undefined) {
      this.handleLoadingState(true);
      const data = this.prepareOrderData();

      this.orderService.editOrder(data, this.dataTempOrder.id).subscribe(
        (response: ApiResponse) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => this.viewForm = false);
        },
        (error) => {
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  /**
   * Prepara los datos del formulario para ser enviados
   */
  private prepareOrderData(): Order {
    return {
      id: this.dataTempOrder!.id,
      total: this.orderForm.get('total')!.value,
      description: this.orderForm.get('description')!.value,
      billing_date: this.orderForm.get('billing_date')!.value,
      payment_method: this.orderForm.get('payment_method')!.value,
      has_discount: this.orderForm.get('has_discount')!.value,
    };
  }

  /**
   * Muestra el formulario con los datos de una orden existente
   */
  editViewOrder(id: number): void {
    this.orderForm.reset();
    this.viewForm = true;
    this.dataTempOrder = this.dataOrder.find(order => order.id === id) || null;

    if (this.dataTempOrder) {
      this.orderForm.patchValue(this.dataTempOrder);
    }
  }

  /**
   * Elimina una orden con confirmación previa
   */
  deleteOrder(id: number): void {
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
        this.orderService.deleteOrder(id).subscribe(
          (response: ApiResponse) => {
            this.getDataOrder();
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
   * Muestra notificaciones de éxito o advertencia según la respuesta
   */
  private handleResponse(response: ApiResponse, onSuccess: () => void): void {
    if (response.original.success) {
      this.getDataOrder();
      this.notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this.notificationService.showWarning('Error al procesar tu solicitud.');
    }
  }

  /**
   * Muestra errores del backend como notificación
   */
  private handleError(error: any): void {
    this.notificationService.showError(error);
  }

  /**
   * Muestra u oculta el loader al hacer peticiones
   */
  private handleLoadingState(isLoading: boolean): void {
    this.createOrderButton = isLoading;
    this.loadingTable = isLoading;
  }

  /**
   * Regresa a la vista principal sin mostrar el formulario
   */
  goBack(): void {
    this.viewForm = false;
  }
}
