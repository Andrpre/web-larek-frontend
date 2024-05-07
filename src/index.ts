import './scss/styles.scss';

import {API_URL, CDN_URL} from "./utils/constants";
import {ShopAPI} from "./components/ShopAPI";
import {EventEmitter} from "./components/base/events";
import {AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import {Card} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {IProductItem, IOrderForm} from "./types";
import {Contacts} from "./components/Contacts";
import {Order} from "./components/Order";
import {Success} from "./components/common/Success";

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модели данных приложения
const appData = new AppState({}, events);
const product = new ProductItem({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events, { onClick: (name: string) => appData.order.payment = name });
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            category: item.category,
            description: item.description,
            price: item.price,
        });
    });
});

// Изменения в корзине
events.on('basket:changed', () => {
    let indexItem = 0;
    basket.items = appData.getCartItems().map(item => {
        const card = new Card('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => {},
            onDelete: () => events.emit('removeFromBasket:changed', item)
        });
        indexItem += 1;
        return card.render({
            index: indexItem,
            title: item.title,
            price: item.price,
        });
    });
    basket.price = appData.getTotal();
    basket.setCheckout(appData.getCartItems());
    page.counter = appData.getCartItems().length;
})

// Открыть товар
events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный товар
events.on('preview:changed', (item: IProductItem) => {
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit('addInBasket:changed', item)
    });

    if(item.status === "added") {
        card.toggleAvailability('Добавлено', true);
    }

    modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: item.price,
        })
    });
});

// Добавление товара в корзину
events.on('addInBasket:changed', (item: IProductItem) => {
    appData.setCartItems(item);
    product.toggleStatus(item, true);
})

// Удаление товара из корзины
events.on('removeFromBasket:changed', (item: IProductItem) => {
    appData.removeItem(item);
})

// Открыть корзину
events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [ basket.render() ])
    });
});

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            address: '',
            payment: appData.order.payment,
            valid: false,
            errors: []
        })
    });
});

// Открыть форму контактов
events.on('order:submit', () => {
    modal.render({
        content: contacts.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { address, email, phone } = errors;

    order.valid = !address;
    order.errors = Object.values({address}).filter(i => !!i).join('; ');

    contacts.valid = !email && !phone;
    contacts.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/.*\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
    appData.setOrderDeta();
    api.orderProducts(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
                    events.emit('basket:changed');
                }
            });

            modal.render({
                content: success.render({ total: result.total })
            });
        })
        .catch(err => {
            console.error(err);
        });
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем товары с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });