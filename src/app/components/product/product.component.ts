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
  public principalView: boolean = true;
  public productForm: FormGroup;
  public dataTempProduct: IProduct = {} as IProduct;
  public dataProduct: IProduct[] = [];
  public topProducts: IProduct[] = [];
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

  /**
   * obtiene los productos
   */
  getDataProduct() {
    this.loadingTable = true;
    this._productService.listProduct().subscribe((response) => {
      this.dataProduct = response.original.data;
      this.loadingTable = false;
    }, (error) => {
      this.notificationService.showError(error);
      this.loadingTable = false;
    });
  }

  /**
   * Muestra el formulario para crear un producto nuevo
   */
  viewFormCreate() {
    this.productForm.reset();
    this.dataTempProduct = {} as IProduct;
    this.viewForm = true;
  }

  topPurchasedProducts() {
    this.loadingTable = true;
    this.principalView = false;
    this._productService.topPurchasedProducts().subscribe((response) => {
      this.topProducts = response.original.data
      this.loadingTable = false;
    }, (error) => {
      this.notificationService.showError(error);
      this.loadingTable = false;
      this.principalView = true;
    });
  }
  /**
   * Envia el formulario de acuerdo si se esta editando o creando un producto
   */
  public submitForm() {
    if (this.dataTempProduct && Object.keys(this.dataTempProduct).length > 0) {
      this.editProduct();
    } else {
      this.createProduct();
    }
  }

  /**
   * maneja las respuestas
   * @param response 
   * @param onSuccess 
   */
  private handleResponse(response: any, onSuccess: () => void) {
    if (response.original.success) {
      this.getDataProduct();
      this.notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this.notificationService.showWarning('Tuvimos un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    }
  }

  /**
   * Actualiza el payload
   * @param isLoading 
   */
  private handleLoadingState(isLoading: boolean) {
    this.createProductButton = isLoading;
    this.loadingTable = isLoading;
  }

  /**
   * Edita un producto existente
   */
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
          this.notificationService.showError(error);
        }
      );
    }
  }

  /**
   * Crea un nuevo producto
   */
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
          this.notificationService.showError(error);
        }
      );
    }
  }

  /**
   * Prepara los datos del producto antes de crearlo o editarlos
   * @returns 
   */
  private prepareProductData() {
    return {
      id: this.dataTempProduct.id,
      name: this.productForm.get('name')?.value,
      description: this.productForm.get('description')?.value,
      price: this.productForm.get('price')?.value,
      stock: this.productForm.get('stock')?.value,
    };
  }

  /**
   * carga la vista de edición para un producto específico
   * @param id 
   */
  editViewProduct(id: number) {
    this.productForm.reset();
    this.viewForm = true;
    this.dataTempProduct = this.dataProduct.find((p: IProduct) => p.id === id) as IProduct;
    this.productForm.patchValue(this.dataTempProduct);
  }

  /**
   * Elimina un producto con confirmación de sweetalert
   * @param id 
   */
  deleteProduct(id: number): void {
    this.notificationService.showDeleteConfirmation().then((result) => {
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
      } else {
        console.log('Eliminación cancelada');
      }
    });
  }

  /**
   * Vuelve a la vista anterior
   */
  goBack() {
    this.viewForm = false;
  }

  returnView(){
    this.principalView = true
    this.getDataProduct()
  }
}