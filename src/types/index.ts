export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    status: string;
    price: number | null;
}

export interface IAppState {
    basketItems: IProductItem[];
    catalog: IProductItem[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
}

export interface IOrderForm {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    total: number;
    items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
    total: number;
}