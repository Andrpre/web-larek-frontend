import './scss/styles.scss';

import {ShopAPI} from "./components/ShopAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {BasketModel, AppState, CatalogChangeEvent, ProductItem} from "./components/AppData";
import {Page} from "./components/Page";
import {Card} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {FormErrors, IAppState, IProductItem, IOrder, IOrderForm} from "./types";
import {Tabs} from "./components/common/Tabs";
// import {IOrderForm} from "./types";
import {Order} from "./components/Order";
// import {Success} from "./components/common/Success";

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const tabsPayment = ensureElement<HTMLElement>('.order__buttons');

// Модели данных приложения
const appData = new AppState({}, events);
const product = new ProductItem({}, events);
const basketModel = new BasketModel({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const tabs = new Tabs(tabsPayment, {
    onClick: (name) => {
        console.log("Нажал на карту");
        // Далее какая-то логика
        // if (name === 'card') events.emit('basket:open');
        // else events.emit('bids:open');
    }
});
const order = new Order(cloneTemplate(orderTemplate), events);

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

    // page.counter = appData.getClosedLots().length;
});

// Изменения в корзине
events.on('basket:changed', () => {
    let indexItem = 0;
    basket.items = basketModel.getItems().map(item => {
        const card = new Card('card', cloneTemplate(cardBasketTemplate), {
            onClick: (event) => {
                // const checkbox = event.target as HTMLInputElement;
                // appData.toggleOrderedLot(item.id, checkbox.checked);
                // basket.total = appData.getTotal();
                // basket.selected = appData.order.items;
            },
            onDelete: () => events.emit('removeFromBasket:changed', item)
        });
        indexItem += 1;
        return card.render({
            index: indexItem,
            title: item.title,
            price: item.price,
        });
    });
    basket.price = basketModel.getTotal();
    page.counter = basketModel.getItems().length;
})

// Добавление товара в корзину
events.on('addInBasket:changed', (item: IProductItem) => {
    basketModel.add(item);
    product.toggleStatus(item, true);
})

// Удаление товара из корзины
events.on('removeFromBasket:changed', (item: IProductItem) => {
    basketModel.remove(item);
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

    if(item.status === "Добавлен") {
        card.toggleAvailability('Добавлено', true);
    }

    modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            // description: item.description.split("\n"),
            description: item.description,
            category: item.category,
            price: item.price,
        })
    });
});

// Открыть корзину
events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            // tabs.render({
            //     selected: 'closed'
            // }),
            basket.render()
        ])
    });
});

// Открыть форму заказа
events.on('order:open', () => {
    tabs.selected = appData.order.payment;
    modal.render({
        content: order.render({
            address: '',
            payment: appData.order.payment,
            valid: false,
            errors: []
        })
    });
});

// Выбран способ оплаты
events.on('payment:changed', () => {
    // appData.order.payment = value;
    // modal.render({
    //     content: order.render({
    //         address: '',
    //         payment: 'card',
    //         valid: false,
    //         errors: []
    //     })
    // });
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