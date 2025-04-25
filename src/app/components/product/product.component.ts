import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product/product.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import { IProduct } from '../../models/product/product.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {

  public loadingTable: boolean = true;
  public viewForm: boolean = false;
  public productForm: FormGroup;
  public dataTempProduct: IProduct = {} as IProduct;
  public dataProduct: IProduct[] = [];
  public createProductButton: boolean = false;

  constructor(
    private _productService: ProductService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.getDataProduct();
  }

  // obtiene los productos
  getDataProduct() {
    this._productService.listProduct().subscribe((response) => {
      this.dataProduct = response.original.data;
      this.loadingTable = false;
    }, (error) => {
      this.handleError(error);
    });
  }

  // Muestra el formulario para crear un producto nuevo
  viewFormCreate() {
    this.productForm.reset();
    this.dataTempProduct = {} as IProduct;
    this.viewForm = true;
  }

  // Envía el formulario de acuerdo si se esta editando o creando un producto
  public submitForm() {
    if (this.dataTempProduct && Object.keys(this.dataTempProduct).length > 0) {
      this.editProduct();
    } else {
      this.createProduct();
    }
  }

  // Maneja las respuestas
  private handleResponse(response: any, onSuccess: () => void) {
    if (response.original.success) {
      this.getDataProduct();
      this.notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this.notificationService.showWarning('Tuvimos un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    }
  }

  // Maneja los errores de las solicitudes
  private handleError(error: any) {
    this.notificationService.showError(error);
  }

  // Actualiza el payload
  private handleLoadingState(isLoading: boolean) {
    this.createProductButton = isLoading;
    this.loadingTable = isLoading;
  }

  // Edita un producto existente
  editProduct() {
    if (this.productForm.valid) {
      this.handleLoadingState(true);
      const data = this.prepareProductData();
      this._productService.editProduct(data, this.dataTempProduct.id).subscribe(
        (response: any) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => {
            this.viewForm = false;
          });
        },
        (error: any) => {
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  // Crea un nuevo producto
  createProduct() {
    if (this.productForm.valid) {
      this.handleLoadingState(true);
      this._productService.createProduct(this.productForm.value).subscribe(
        (response: any) => {
          this.handleLoadingState(false);
          this.handleResponse(response, () => {
            this.viewForm = false;
          });
        },
        (error: any) => {
          this.handleLoadingState(false);
          this.handleError(error);
        }
      );
    }
  }

  // Prepara los datos del producto antes de crearlo o editarlos
  private prepareProductData() {
    return {
      id: this.dataTempProduct.id,
      name: this.productForm.get('name')?.value,
      description: this.productForm.get('description')?.value,
      price: this.productForm.get('price')?.value,
      stock: this.productForm.get('stock')?.value,
    };
  }

  // Carga la vista de edición para un producto específico
  editViewProduct(id: number) {
    this.productForm.reset();
    this.viewForm = true;
    this.dataTempProduct = this.dataProduct.find((p: IProduct) => p.id === id) as IProduct;
    this.productForm.patchValue(this.dataTempProduct);
  }

  // Elimina un producto con confirmación de sweetalert
  deleteProduct(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el producto permanentemente. ¡No podrás revertirlo!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this._productService.deleteProduct(id).subscribe({
          next: (response) => {
            this.getDataProduct();
            this.notificationService.showSuccess(response.original.message);
          },
          error: (error) => {
            this.notificationService.showError('Tuvimos un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.');
          }
        });
      }
    });
  }

  // Vuelve a la vista anterior.
  goBack() {
    this.viewForm = false;
  }
}