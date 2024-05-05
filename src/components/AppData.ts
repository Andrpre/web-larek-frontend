// import _ from "lodash";

import {Model} from "./base/Model";
import {FormErrors, IAppState, IProductItem, IOrder, IOrderForm, IBasketModel} from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProductItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    status: string = "Не добавлен";
    price: number | null;

    toggleStatus (item: IProductItem, isIncluded: boolean){
        isIncluded ? item.status = "Добавлен" : "Не добавлен";
        this.emitChanges('preview:changed', item);
    }
}

export class BasketModel extends Model<IBasketModel> {
    items: IProductItem[] = [];
    
    add(item: IProductItem) {
        if(!this.items.some(it => it.id === item.id)) {
            this.items.push(item);
            this.emitChanges('basket:changed');
        }
    }

    getItems() {
        return this.items;
    }

    remove(item: IProductItem) {
        const index = this.items.findIndex(n => n.id === item.id);
        this.items.splice(index, 1);
        item.status = "Не добавлен";
        this.emitChanges('basket:changed');
    }

    getTotal() {
        return this.items.reduce((total, product) => {
            return total + (product.price || 0)
        }, 0)
    }

    clearBasket() {
        
    }
}

export class AppState extends Model<IAppState> {
    basketItems: ProductItem[];
    catalog: ProductItem[];
    loading: boolean;
    order: IOrder = {
        payment: 'card',
        address: '',
        email: '',
        phone: '',
        items: []
    };
    preview: string | null;
    formErrors: FormErrors = {};

    // toggleOrderedProduct(id: string, isIncluded: boolean) {
    //     if (isIncluded) {
    //         this.order.items = _.uniq([...this.order.items, id]);
    //     } else {
    //         this.order.items = _.without(this.order.items, id);
    //     }
    // }

    // clearBasket() {
    //     this.order.items.forEach(id => {
    //         this.toggleOrderedProduct(id, false);
    //     });
    // }

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    // getCartItems(): ProductItem[] {
    //     return this.basketItems;
    // }

    // setCartItems(item: ProductItem) {
    //     this.basketItems.push(item);
    //     console.log('Добавили в корзину');
    // }

    // setOrderField(field: keyof IOrderForm, value: string) {
    //     this.order[field] = value;

    //     if (this.validateOrder()) {
    //         this.events.emit('order:ready', this.order);
    //     }
    // }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}