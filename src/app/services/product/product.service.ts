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

    /**
     * endpoint para obtener todos los productos
     * @returns 
     * @method get
     */
    listProduct(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/product/listProduct`, this.header.getHttpOptions());
    }

    /**
     * endpoint para obtener los 3 productos mas vendidos
     * @returns 
     * @method get
     */
    topPurchasedProducts(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/product/topPurchasedProducts`, this.header.getHttpOptions());
    }

    /**
     * endpoint para crear un nuevo producto
     * @param data 
     * @returns 
     * @method post
     */
    createProduct(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/product/createProduct`, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para actualizar los registros de un producto
     * @param data 
     * @param id 
     * @returns 
     * @method put
     */
    editProduct(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/product/editProduct/` + id, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para actualizar el stock de un producto despues de una venta
     * @param id 
     * @param newStock 
     * @returns 
     * @method patch
     */
    updateStock(id: number, newStock: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/product/updateStock/` + id, {stock: newStock}, this.header.getHttpOptions() );
    }

    /**
     * endpoint para eliminar un producto de la base de datos
     * @param id 
     * @returns 
     * @method delete
     */
    deleteProduct(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/product/deleteProduct/` + id, this.header.getHttpOptions());
    }
}