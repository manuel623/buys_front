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

    listOrderDetail(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orderDetail/listOrderDetail`, this.header.getHttpOptions());
    }
    createOrderDetail(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/orderDetail/createOrderDetail`, data, this.header.getHttpOptions());
    }

    editOrderDetail(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/orderDetail/editOrderDetail/` + id, data, this.header.getHttpOptions());
    }

    deleteOrderDetail(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/orderDetail/deleteOrderDetail/` + id, this.header.getHttpOptions());
    }
}