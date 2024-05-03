import {Component} from "./base/Component";
import {bem, createElement, ensureElement} from "../utils/utils";
import {CATEGORY_COLORS} from "../utils/constants"
// import clsx from "clsx";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
    title: string;
    category: string;
    description?: string | string[];
    image: string;
    price: number | null;
}

export class Card<T> extends Component<ICard<T>> {
    protected _title: HTMLElement;
    protected _category: HTMLElement;
    protected _image: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _price: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._description = container.querySelector(`.${blockName}__description`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: string) {
        this.setText(this._category, value);
        this._category.className = `card__category card__category_${CATEGORY_COLORS[value]}`;
    }

    set price(value: number) {
        this.setText(this._price, this.formatPrice(value));
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }

    protected formatPrice = (numb: number): string => {
        const numbFmt = new Intl.NumberFormat('ru-RU').format(numb);
        return numbFmt === '0' ? `Бесценно` : `${numbFmt} синапсов`;
    }
    
}