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
    catalog: IProductItem[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}

export interface IBasketModel {
    items: IProductItem[];
    add(item: IProductItem): void;
    getItems(): IProductItem[];
    remove(item: IProductItem): void;
    getTotal(): number;
    clearBasket(): void;
}

export interface IOrderForm {
    payment: 'card' | 'cash';
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[]
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
    total: number;
}