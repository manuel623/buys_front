export interface Buyer {
    id: number;
    document: string;
    first_name: string;
    second_name?: string;
    first_last_name?: string;
    second_last_name?: string;
    phone?: string;
    email?: string;
}

export interface ApiResponse {
    original: {
        success: boolean;
        message: string;
        data: Buyer[];
    };
}
