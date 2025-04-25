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

    listBuyer(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/buyer/listBuyer`, this.header.getHttpOptions());
    }

    getBuyerByPhone(phone: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/buyer/getBuyerByPhone/` + phone, this.header.getHttpOptions());
    }

    createBuyer(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/buyer/createBuyer`, data, this.header.getHttpOptions());
    }

    editBuyer(data: any, id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/buyer/editBuyer/` + id, data, this.header.getHttpOptions());
    }

    deleteBuyer(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/buyer/deleteBuyer/` + id, this.header.getHttpOptions());
    }
}