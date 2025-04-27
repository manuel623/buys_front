import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { OrderService } from '../../services/order/order.service';
import { BuyerService } from '../../services/buyer/buyer.service';
import { ProductService } from '../../services/product/product.service';
import { NotificationService } from '../../services/notification/notificacion.service';
import { OrderDetailService } from '../../services/order-detail/order-detail.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {
  viewForm = false;
  currentStep = 1;
  hideExtraFields = true;
  loadingTable = false;
  dataOrder: any[] = [];
  products: any[] = [];
  buyerForm!: FormGroup;
  productForm!: FormGroup;
  orderForm !: FormGroup;
  minDate: string = new Date().toISOString().substring(0, 10);

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private buyerService: BuyerService,
    private productService: ProductService,
    private orderDetailService: OrderDetailService,
  ) {
    this.buyerForm = this.fb.group({
      document: ['', Validators.required],
      first_name: ['', Validators.required],
      second_name: [''],
      first_last_name: [''],
      second_last_name: [''],
      email: [''],
      phone: ['']
    });

    this.productForm = this.fb.group({
      products: this.fb.array([])
    });

    this.orderForm = this.fb.group({
      description: [''],
      payment_method: ['efectivo'],
      billing_date: [new Date().toISOString().substring(0, 10)],
      discount: [0],
      total: [''],
    });

  }

  ngOnInit() {
    this.getOrders();
    this.loadProducts();
    this.addProduct();
  }

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
          this.notificationService.showSuccessPromise("Este número de documento ya realizó una compra. Serás redirigido al siguiente paso.")
            .then(() => {
              this.nextStep();
            });
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

  editViewOrder(id: number) {
    // edita una orden
  }

  deleteOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe(() => this.getOrders());
  }

  submitOrder(): void {
    if (this.buyerForm.invalid || this.productForm.invalid || this.orderForm.invalid) {
      this.notificationService.showWarning('Por favor, complete todos los campos requeridos.');
      return;
    }

    const buyerData = this.buyerForm.value;
    const orderData = this.orderForm.value;
    const orderDetailData = this.productForm.value;

    console.log("Buyer Data:", buyerData);
    console.log("Order Data:", orderData);
    console.log("Order Detail Data:", orderDetailData);

    this.getOrCreateBuyer(buyerData).then((buyerId) => {
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
          if (res.original?.data) {
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
    const orderPayload = {
      description: orderData.description,
      billing_date: orderData.billing_date,
      payment_method: orderData.payment_method,
      has_discount: orderData.has_discount,
      total: orderData.total,
    };

    console.log("Order Payload:", orderPayload);

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

          console.log("Order Detail Payload:", detailPayload);

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
                this.viewForm = false;
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
}
