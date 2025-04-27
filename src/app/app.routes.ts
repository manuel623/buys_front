import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { BuyerComponent } from './components/buyer/buyer.component';
import { AuthGuard } from './guard/auth.guard';
import { OrderComponent } from './components/order/order.component';
import { ProductComponent } from './components/product/product.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'user', component: UserComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'buyer', component: BuyerComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'order', component: OrderComponent, canActivate: [AuthGuard], pathMatch: 'full' },
    { path: 'product', component: ProductComponent, canActivate: [AuthGuard], pathMatch: 'full' }
];
