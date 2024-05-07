import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {IEvents} from "./base/events";
import {ensureAllElements} from "../utils/utils";

export type TabActions = {
    onClick: (tab: string) => void
}

export class Order extends Form<IOrderForm> {
    protected _buttons: HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents, actions?: TabActions) {
        super(container, events);

        this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
        this._buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.payment = button.name;
                actions?.onClick?.(button.name);
            });
        })
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(name: string) {
        this._buttons.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === name);
        });
    }
}