import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { CATEGORY_COLORS } from '../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	title: string;
	category?: string;
	description?: string | string[];
	image?: string;
	index?: number;
	price: number | null;
}

export class Card extends Component<ICard> {
	protected _title: HTMLElement;
	protected _category?: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;
	protected _index?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._description = container.querySelector(`.${blockName}__text`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._button = container.querySelector(`.${blockName}__button`);
		this._index = container.querySelector(`.basket__item-index`);

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
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
		this._category.className = `card__category card__category_${CATEGORY_COLORS[value]}`;
	}

	set price(value: number) {
		const numbFrmt = this.formatPrice(value);
		const numbFrmtText = numbFrmt === '0 синапсов' ? 'Бесценно' : numbFrmt;
		this.setText(this._price, numbFrmtText);
		!value ? this.toggleAvailability('Недоступно', true) : '';
	}

	set index(value: number) {
		this.setText(this._index, String(value));
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	toggleAvailability(value: string, state: boolean) {
		this.setText(this._button, value);
		this.setDisabled(this._button, state);
	}
}
