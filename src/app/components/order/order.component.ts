import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { OrderService } from '../../services/order/order.service';
import { BuyerService } from '../../services/buyer/buyer.service';
import { ProductService } from '../../services/product/product.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import { OrderDetailService } from '../../services/order-detail/order-detail.service';
import { Order } from '../../models/order/order.model';
import { CurrencyFormatPipe } from '../../pipe/currency-format.pipe';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent, CurrencyFormatPipe],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {
  public viewForm: boolean = false;
  public currentStep: number = 1;
  public hideExtraFields: boolean = true;
  public loadingTable: boolean = false;
  public viewFormEdit: boolean = false;
  public viewOrderDetail: boolean = false;
  public viewEditForm: boolean = false;
  public products: any[] = [];
  public orderDetails: any[] = [];
  public buyerForm!: FormGroup;
  public productForm!: FormGroup;
  public orderForm !: FormGroup;
  public dataOrder: Order[] = [];
  public dataTempOrder: Order = {} as Order;
  public minDate: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private buyerService: BuyerService,
    private productService: ProductService,
    private orderDetailService: OrderDetailService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.buyerForm = this.fb.group({
      document: ['', Validators.required],
      first_name: ['', Validators.required],
      second_name: [''],
      first_last_name: [''],
      second_last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });

    this.productForm = this.fb.group({
      products: this.fb.array([])
    });

    this.orderForm = this.fb.group({
      description: [''],
      payment_method: ['efectivo'],
      billing_date: [new Date().toISOString().substring(0, 10)],
      total: [''],
    });

  }

  ngOnInit() {
    this.getOrders();
    this.loadProducts();
    this.addProduct();
  }

  /**
   * se obtiene los datos de las ordenes y los asigna a la variable dataOrder
   */
  getOrders() {
    this.loadingTable = true;
    this.orderService.listOrder().subscribe(res => {
      this.dataOrder = res.original.data;
      this.loadingTable = false;
    });
  }

  loadProducts() {
    this.productService.listProduct().subscribe(res => {
      this.products = res.original.data;
    });
  }

  get productControls() {
    return this.productForm.get('products') as FormArray;
  }

  viewFormCreate() {
    this.viewForm = true;
  }

  goBack() {
    if (this.currentStep === 1) {
      this.viewForm = false;
    } else {
      this.currentStep--;
    }
  }

  nextStep() {
    if (this.buyerForm.invalid) return;

    const doc = this.buyerForm.value.document;
    this.buyerService.getBuyerByDocument(doc).subscribe(client => {
      if (client) {
        this.hideExtraFields = true;
        this.buyerForm.patchValue(client);
        this.currentStep++;
      } else {
        this.hideExtraFields = false;
        if (this.buyerForm.valid) {
          this.buyerService.createBuyer(this.buyerForm.value).subscribe(newClient => {
            this.buyerForm.patchValue(newClient);
            this.currentStep++;
          });
        }
      }
    });
  }

  onDocumentBlur(): void {
    const doc = this.buyerForm.get('document')?.value;
    if (!doc) return;
    const payload = { document: doc };
    this.buyerService.getBuyerByDocument(doc).subscribe(
      (res: any) => {
        if (res.original?.data) {
          this.buyerForm.patchValue(res.original.data);
          this.notificationService.showSuccessPromise("Este número de documento ya realizó una compra")
        } else {
          this.notificationService.showInfo(res.original.message);
          this.hideExtraFields = false;
        }
      },
      (err) => {
        this.notificationService.showError('Error al buscar el comprador.');
      }
    );
  }

  addProduct() {
    const productGroup = this.fb.group({
      productId: ['', Validators.required],
      unitValue: [''],
      quantity: [1, Validators.required],
      description: [''],
      stock: [''],
      subtotal: ['']
    });
    this.productControls.push(productGroup);
    productGroup.get('quantity')?.valueChanges.subscribe(() => this.calculateSubTotal(productGroup));
    productGroup.get('unitValue')?.valueChanges.subscribe(() => this.calculateSubTotal(productGroup));
  }

  get productArray(): FormArray {
    return this.productForm.get('products') as FormArray;
  }

  editViewProduct(id: number) {
    this.orderForm.reset();
    this.viewEditForm = true;
    this.dataTempOrder = this.dataOrder.find((p: Order) => p.id === id) as Order;
    this.orderForm.patchValue(this.dataTempOrder);
  }

  editOrder() {
    if (this.orderForm.valid) {
      this.loadingTable = true
      const data = this.prepareOrderData();
      this.orderService.editOrder(data, this.dataTempOrder.id).subscribe(
        (response: any) => {
          this.loadingTable = false
          this.handleResponse(response, () => {
            this.viewEditForm = false;
          });
        },
        (error: any) => {
          this.loadingTable = false

          this.notificationService.showError(error);
        }
      );
    }
  }

  /**
   * maneja las respuestas
   * @param response 
   * @param onSuccess 
   */
  private handleResponse(response: any, onSuccess: () => void) {
    if (response.original.success) {
      this.getOrders();
      this.notificationService.showSuccess(response.original.message);
      onSuccess();
    } else {
      this.notificationService.showWarning('Tuvimos un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    }
  }

  /**
     * Prepara los datos de la order antes de editarlos
     * @returns 
     */
  private prepareOrderData() {
    return {
      id: this.dataTempOrder.id,
      payment_method: this.orderForm.get('payment_method')?.value,
      description: this.orderForm.get('description')?.value,
      billing_date: this.orderForm.get('billing_date')?.value,
      total: this.orderForm.get('total')?.value,
    };
  }

  // calcula el subtotal de un producto especfico
  calculateSubTotal(productGroup: FormGroup): void {
    const quantity = productGroup.get('quantity')?.value;
    const unitValue = productGroup.get('unitValue')?.value;
    const subtotal = quantity * unitValue;
    productGroup.get('subtotal')?.setValue(subtotal);
    this.calculateTotal();
  }

  // Calcular el valor total
  calculateTotal(): void {
    let total = 0;
    this.productControls.controls.forEach((control: any) => {
      total += control.get('subtotal')?.value || 0;
    });
    this.orderForm.get('total')?.setValue(total);
  }

  removeProduct(index: number) {
    this.productControls.removeAt(index);
    this.calculateSubtotal();
  }

  handleProductChange(event: any, index: number) {
    const productId = event.target.value;
    const selectedProduct = this.products.find(p => p.id === +productId);
    if (selectedProduct) {
      const group = this.productControls.at(index);
      group.patchValue({
        unitValue: selectedProduct.price,
        description: selectedProduct.description,
        stock: selectedProduct.stock,
        subtotal: selectedProduct.price * group.value.quantity
      });
      this.calculateSubtotal();
    }
  }

  calculateSubtotal() {
    this.productControls.controls.forEach(group => {
      const unit = +group.get('unitValue')?.value || 0;
      const qty = +group.get('quantity')?.value || 0;
      group.patchValue({ subtotal: unit * qty });
    });
  }

  deleteOrder(id: number): void {
    this.notificationService.showDeleteConfirmation().then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading();
        this.orderService.deleteOrder(id).subscribe({
          next: (response) => {
            this.getOrders();
            this.notificationService.showSuccess(response.original.message);
          },
          error: (error) => {
            this.notificationService.showError('Error. Por favor, inténtalo de nuevo.');
          }
        });
      } else {
        console.log('Eliminación cancelada');
      }
    });
  }

  submitOrder(): void {
    if (this.buyerForm.invalid || this.productForm.invalid || this.orderForm.invalid) {
      this.notificationService.showWarning('Por favor, complete todos los campos requeridos.');
      return;
    }
    const buyerData = this.buyerForm.value;
    const orderData = this.orderForm.value;
    const orderDetailData = this.productForm.value;

    this.getOrCreateBuyer(buyerData).then((buyerId) => {
      this.notificationService.showLoading();
      this.createOrderWithDetails(buyerId, orderData, orderDetailData.products);
    }).catch((err) => {
      this.notificationService.showError(err || 'Error al procesar el comprador.');
    });
  }

  /**
   * Busca el comprador por documento. Si no existe, lo crea y luego lo busca de nuevo.
   * Devuelve una promesa con el buyerId.
   */
  private getOrCreateBuyer(buyerData: any): Promise<number> {
    return new Promise((resolve, reject) => {
      this.buyerService.getBuyerByDocument(buyerData.document).subscribe(
        (res: any) => {
          if (res.original.data) {
            this.notificationService.showSuccess('Comprador encontrado.');
            resolve(res.original.data.id);
          } else {
            this.buyerService.createBuyer(buyerData).subscribe(
              () => {
                this.notificationService.showSuccess('Comprador creado exitosamente');
                this.buyerService.getBuyerByDocument(buyerData.document).subscribe(
                  (resAgain: any) => {
                    if (resAgain.original?.data) {
                      this.notificationService.showSuccess('ID del comprador obtenido tras la creación');
                      resolve(resAgain.original.data.id);
                    } else {
                      reject('No se pudo obtener el comprador luego de crearlo');
                    }
                  },
                  () => reject('Error al volver a buscar el comprador')
                );
              },
              () => reject('Error al crear el comprador')
            );
          }
        },
        () => reject('Error al buscar el comprador')
      );
    });
  }

  /**
   * Crea la orden y sus detalles asociados.
   */
  private createOrderWithDetails(buyerId: number, orderData: any, products: any[]): void {
    this.viewForm = false;
    this.loadingTable = true;
    const orderPayload = {
      description: orderData.description,
      billing_date: orderData.billing_date,
      payment_method: orderData.payment_method,
      total: orderData.total,
    };

    this.orderService.createOrder(orderPayload).subscribe(
      (orderRes: any) => {
        const orderId = orderRes.original.data.id;
        let detailsCreated = 0;
        // se crea el detalle de orden por cada producto
        products.forEach((product: any, index: number) => {
          const detailPayload = {
            order_id: orderId,
            buyer_id: buyerId,
            product_id: Number(product.productId),
            quantity: product.quantity,
            unit_price: product.unitValue,
            subtotal: product.subtotal
          };
          this.orderDetailService.createOrderDetail(detailPayload).subscribe(
            () => {
              const newStock = product.stock - product.quantity;
              this.productService.updateStock(product.productId, newStock).subscribe(
                () => {
                  console.log(`Stock actualizado para producto ${product.productId}`);
                },
                () => {
                  console.error('Error actualizando stock del producto');
                }
              );
              detailsCreated++;
              if (detailsCreated === products.length) {
                this.notificationService.showSuccess('Detalles de ordenes creados exitosamente.');
                this.resetForms();
                this.getOrders();
              }
            },
            () => {
              this.notificationService.showError('Error al crear el detalle de la orden.');
            }
          );
        });
      },
      () => {
        this.notificationService.showError('Error al crear la orden.');
      }
    );
  }

  resetForms() {
    this.buyerForm.reset();
    this.productForm.reset();
    this.orderForm.reset();
    this.currentStep--;
  }

  prevStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  validateQuantity(index: number): void {
    const group = this.productControls.at(index);
    if (!group) return;
    const quantity = group.get('quantity')?.value || 1;
    const stock = group.get('stock')?.value || 1;
    if (quantity > stock) {
      this.notificationService.showError('La cantidad no puede ser mayor al stock disponible');
      group.get('quantity')?.setValue(1);
    } else if (quantity < 1) {
      group.get('quantity')?.setValue(1);
    }
    this.calculateSubtotal()
  }

  updateSubtotal(index: number): void {
    const group = this.productControls.at(index);
    if (!group) return;
    const quantity = Number(group.get('quantity')?.value || 0);
    const unitValue = Number(group.get('unitValue')?.value || 0);
    const subtotal = quantity * unitValue;
    group.get('subtotal')?.setValue(subtotal);
  }

  /**
   * consulta los detalles de orden segun id
   * @param orderId 
   */
  consultOrderDetail(orderId: number): void {
    this.orderDetailService.getOrderDetails(orderId).subscribe(
      (response: any) => {
        if (response.original.success) {
          this.viewOrderDetail = true
          this.orderDetails = response.original.data;
        } else {
          this.notificationService.showWarning(response.original.message);
        }
      },
      (error) => {
        this.notificationService.showError('Error al obtener los detalles de la orden.');
      }
    );
  }

}
