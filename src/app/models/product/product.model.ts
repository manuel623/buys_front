export interface IProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    total_units_sold?: string;
}

export interface IProductResponse {
    original: {
        success: boolean;
        data: IProduct[];
        message: string;
    };
}
