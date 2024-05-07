import { Model } from './base/Model';
import {
	FormErrors,
	IAppState,
	IProductItem,
	IOrder,
	IOrderForm,
} from '../types';

export type CatalogChangeEvent = {
	catalog: ProductItem[];
};

export class ProductItem extends Model<IProductItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	status: string = 'notАdded';
	price: number | null;

	toggleStatus(item: IProductItem, isIncluded: boolean) {
		isIncluded ? (item.status = 'added') : 'notАdded';
		this.emitChanges('preview:changed', item);
	}
}

export class AppState extends Model<IAppState> {
	basketItems: IProductItem[] = [];
	catalog: ProductItem[];
	order: IOrder = {
		payment: 'card',
		address: '',
		email: '',
		total: 0,
		phone: '',
		items: [],
	};
	preview: string | null;
	formErrors: FormErrors = {};

	setCartItems(item: IProductItem) {
		if (!this.basketItems.some((it) => it.id === item.id)) {
			this.basketItems.push(item);
			this.emitChanges('basket:changed');
		}
	}

	getCartItems(): IProductItem[] {
		return this.basketItems;
	}

	removeItem(item: IProductItem) {
		const index = this.basketItems.findIndex((n) => n.id === item.id);
		this.basketItems.splice(index, 1);
		item.status = 'notАdded';
		this.emitChanges('basket:changed');
	}

	getTotal(): number {
		return this.basketItems.reduce((total, product) => {
			return total + (product.price || 0);
		}, 0);
	}

	setOrderDeta(): void {
		this.basketItems.forEach((item) => {
			this.order.items.push(item.id);
		});
		this.order.total = this.getTotal();
	}

	clearBasket(): void {
		this.basketItems.splice(0, this.basketItems.length);
	}

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: ProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder(field)) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(field: keyof IOrderForm) {
		const errors: typeof this.formErrors = {};
		if (field === 'address') {
			if (!this.order.address) {
				errors.address = 'Необходимо указать адрес';
			}
		} else {
			if (!this.order.email) {
				errors.email = 'Необходимо указать email';
			}
			if (!this.order.phone) {
				errors.phone = 'Необходимо указать телефон';
			}
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
