import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { HeaderService } from "../../shared/header/header.service";

@Injectable({
    providedIn: 'root'
})
export class OrderDetailService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private header: HeaderService,
    ) { }

    /**
     * endpoint para obtener todos los detalles de todas las ordenes (no se usa)
     * @returns 
     * @method get
     */
    listOrderDetail(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orderDetail/listOrderDetail`, this.header.getHttpOptions());
    }

    /**
     * endpoint para obtener los detalles de una orden en espeficio
     * @param id
     * @returns 
     * @method get
     */
    getOrderDetails(orderId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orderDetail/getOrderDetails/` + orderId , this.header.getHttpOptions());
    }

    /**
     * endpoint para crear los detalles de una orden
     * @param data 
     * @returns 
     * @method post
     */
    createOrderDetail(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/orderDetail/createOrderDetail`, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para editar los registro de los detalles de una orden
     * @param data 
     * @param id 
     * @returns 
     * @method put
     */
    editOrderDetail(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/orderDetail/editOrderDetail/` + id, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para eliminar los detalles de una orden
     * @param id 
     * @returns 
     * @method delete
     */
    deleteOrderDetail(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/orderDetail/deleteOrderDetail/` + id, this.header.getHttpOptions());
    }
}