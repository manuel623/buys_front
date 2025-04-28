import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { HeaderService } from "../../shared/header/header.service";

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private header: HeaderService,
    ) { }

    /**
     * endpoint para obtener todas las ordenes
     * @returns 
     * @method get
     */
    listOrder(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/order/listOrder`, this.header.getHttpOptions());
    }

    /**
     * endpoint para crear una orden nueva
     * @returns 
     * @method post
     */
    createOrder(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/order/createOrder`, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para editar los valores de una orden
     * @returns 
     * @method put
     */
    editOrder(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/order/editOrder/` + id, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para eliminar una orden
     * @returns 
     * @method delete
     */
    deleteOrder(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/order/deleteOrder/` + id, this.header.getHttpOptions());
    }
}