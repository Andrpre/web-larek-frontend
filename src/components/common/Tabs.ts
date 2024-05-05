import {Component} from "../base/Component";
import {ensureAllElements} from "../../utils/utils";

export type TabState = {
    selected: string
};
export type TabActions = {
    onClick: (tab: string) => void
}

export class Tabs extends Component<TabState> {
    protected _buttons: HTMLButtonElement[];

    constructor(container: HTMLElement, actions?: TabActions) {
        super(container);

        this._buttons = ensureAllElements<HTMLButtonElement>('.button', container);
        this._buttons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('кнопка нажата');
                actions?.onClick?.(button.name);
            });
        })
    }

    set selected(name: string) {
        console.log(this._buttons);
        this._buttons.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === name);
            this.setDisabled(button, button.name === name)
        });
    }
}