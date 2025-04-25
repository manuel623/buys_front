export interface Order {
    id: number;
    total: number;
    description?: string;
    billing_date?: string;
    payment_method?: string;
    has_discount: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ApiResponse {
    original: {
        success: boolean;
        message: string;
        data: Order[];
    };
}