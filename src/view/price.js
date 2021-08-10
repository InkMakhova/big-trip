import AbstractView from './abstract.js';

const createPriceTemplate = (price) => (
  `<p class="trip-info__cost">
    Total: &euro;&nbsp;<span class="trip-info__cost-value">${price}</span>
  </p>`);

export default class Price extends AbstractView {
  constructor (price) {
    super();

    this._price = price;
  }

  getTemplate() {
    return createPriceTemplate(this._price);
  }
}

