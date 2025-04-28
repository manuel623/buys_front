import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { HeaderService } from "../../shared/header/header.service";

@Injectable({
    providedIn: 'root'
})
export class BuyerService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private header: HeaderService,
    ) { }

    /**
     * endpoint para obtener lista de todos los compradores creados
     * @returns 
     * @method get
     */
    listBuyer(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/buyer/listBuyer`, this.header.getHttpOptions());
    }

    /**
     * endpoint que obtiene un comprador por medio del numero de documento, esto con el proposito si saber si ya existe o no
     * @param document 
     * @returns 
     * @method get
     */
    getBuyerByDocument(document: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/buyer/getBuyerByDocument/` + document, this.header.getHttpOptions());
    }

    /**
     * endpoint para crea un nuevo comprador
     * @param document 
     * @returns 
     * @method get
     */
    createBuyer(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/buyer/createBuyer`, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para actulizar los datos de un comprador
     * @param data 
     * @param id 
     * @returns 
     * @method put
     */
    editBuyer(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/buyer/editBuyer/` + id, data, this.header.getHttpOptions());
    }

    /**
     * endpoint para eliminar un comprador de la base de datos
     * @param id 
     * @returns 
     * @method delete
     */
    deleteBuyer(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/buyer/deleteBuyer/` + id, this.header.getHttpOptions());
    }
}