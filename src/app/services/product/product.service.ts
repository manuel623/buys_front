import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { HeaderService } from "../../shared/header/header.service";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private header: HeaderService,
    ) { }

    listProduct(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/product/listProduct`, this.header.getHttpOptions());
    }

    topPurchasedProducts(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/product/listProduct`, this.header.getHttpOptions());
    }

    createProduct(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/product/createProduct`, data, this.header.getHttpOptions());
    }

    editProduct(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/product/editProduct/` + id, data, this.header.getHttpOptions());
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/product/deleteProduct/` + id, this.header.getHttpOptions());
    }
}