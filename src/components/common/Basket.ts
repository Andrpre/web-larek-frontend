import {Component} from "../base/Component";
import {createElement, ensureElement} from "../../utils/utils";
import {EventEmitter} from "../base/events";
import { IProductItem } from "../../types";

interface IBasketView {
    items: HTMLElement[];
    price: number;
    setCheckout(items: IProductItem[]):void;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._price = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
        this.setDisabled(this._button, true);
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
        }
    }

    set price(price: number) {
        this.setText(this._price, this.formatPrice(price));
    }

    setCheckout(items: IProductItem[]):void {
        if (items.length) {
            this.setDisabled(this._button, false);
        } else {
            this.setDisabled(this._button, true);
        }
    }
}