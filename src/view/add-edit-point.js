import {
  capitalizeFirstLetter,
  formateDateTime,
  getKeyByValue
} from '../util.js';
import {
  formatsDateTime,
  offerNames,
  DESTINATIONS,
  POINT_TYPES,
  TYPE_DEFAULT,
  OFFERS_BY_TYPE
} from '../constants.js';

const createPointTypesTemplate = (currentType) => (
  POINT_TYPES.map((type) => `<div class="event__type-item">
    <input
      id="event-type-${type}-1"
      class="event__type-input  visually-hidden"
      type="radio"
      name="event-type"
      value="${type}"
      ${currentType === type ? 'checked' : ''}>
    <label
      class="event__type-label  event__type-label--${type}"
      for="event-type-${type}-1"
      >${capitalizeFirstLetter(type)}</label>
  </div>`).join(''));

const createDestinationsList = () => (
  DESTINATIONS.map((destination) => `<option value="${destination}"></option>`).join('')
);

const createOffersSection = (dataObject, eventType) => {
  if (eventType === 'new') {
    const offerList = dataObject.offers
      .map((offer) => `<div class="event__offer-selector">
          <input
            class="event__offer-checkbox visually-hidden"
            id="event-offer-${getKeyByValue(offerNames, offer.title)}-1"
            type="checkbox"
            name="event-offer-${getKeyByValue(offerNames, offer.title)}">
          <label
            class="event__offer-label"
            for="event-offer-${getKeyByValue(offerNames, offer.title)}-1">
              <span class="event__offer-title">${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>`).join('');
    return `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
      ${offerList}
      </div>
    </section>`;
  }
  if (dataObject.offer && dataObject.offer.length > 0) {
    const offerList = dataObject.offer
      .map((offer) => `<div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${getKeyByValue(offerNames, offer.title)}-1"
          type="checkbox"
          name="event-offer-${getKeyByValue(offerNames, offer.title)}"
          ${eventType === 'edit' ? 'checked' : ''}>
        <label
          class="event__offer-label"
          for="event-offer-${getKeyByValue(offerNames, offer.title)}-1">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>`).join('');

    return `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
      ${offerList}
      </div>
    </section>`;
  }
  return '';
};

const createPhotoTemplate = (dataPoint) => {
  if (dataPoint.destination.pictures && dataPoint.destination.pictures.length > 0) {
    const pictureList = dataPoint.destination.pictures
      .map((picture) => `<img
        class="event__photo"
        src="${picture.src}"
        alt="${picture.description}">`)
      .join('');

    return `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${pictureList}
        </div>
      </div>`;
  }
  return '';
};

const createDestinationSection = (dataPoint) => (
  `<section class="event__section event__section--destination">
    <h3 class="event__section-title event__section-title--destination">Destination</h3>
    <p class="event__destination-description">
      ${dataPoint.destination.description}
    </p>
    ${createPhotoTemplate(dataPoint)}
</section>`);

const getOffersObject = (offersByTypeArray, type) => {
  const offerFound = offersByTypeArray.find((el) => el.type === type);
  return offerFound;
};

const getFavoriteClass = (dataPoint) => dataPoint.isFavorite === false ? '' : ' event__favorite-btn--active';

export const createPointFormTemplate = (eventType, dataPoint) => {
  const isNewPoint = (eventType === 'new');

  return `<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img
            class="event__type-icon"
            width="17"
            height="17"
            src="img/icons/${isNewPoint ? TYPE_DEFAULT : dataPoint.type}.png"
            alt="Event type icon">
        </label>
        <input
          class="event__type-toggle visually-hidden"
          id="event-type-toggle-1"
          type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
              ${createPointTypesTemplate(isNewPoint ? TYPE_DEFAULT : dataPoint.type)}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${isNewPoint ? capitalizeFirstLetter(TYPE_DEFAULT) : capitalizeFirstLetter(dataPoint.type)}
        </label>
        <input
          class="event__input event__input--destination"
          id="event-destination-1"
          type="text"
          name="event-destination"
          value="${isNewPoint ? '' : dataPoint.destination.name}"
          list="destination-list-1">
        <datalist id="destination-list-1">
          ${createDestinationsList()}
        </datalist>
      </div>

      <div class="event__field-group event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input
          class="event__input event__input--time"
          id="event-start-time-1"
          type="text"
          name="event-start-time"
          value="${isNewPoint ? '' : formateDateTime(dataPoint.dateFrom, formatsDateTime.dateTimeHumanize)}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input
          class="event__input event__input--time"
          id="event-end-time-1"
          type="text"
          name="event-end-time"
          value="${isNewPoint ? '' : formateDateTime(dataPoint.dateTo, formatsDateTime.dateTimeHumanize)}">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input
          class="event__input event__input--price"
          id="event-price-1"
          type="text"
          name="event-price"
          value="${isNewPoint ? '' : dataPoint.basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    <section class="event__details">
      ${isNewPoint ? createOffersSection(getOffersObject(OFFERS_BY_TYPE, TYPE_DEFAULT), 'new') : createOffersSection(dataPoint, 'edit')}
      ${isNewPoint ? '' : createDestinationSection(dataPoint)}
    </section>
    <input class="event__input event__input--isFavorite visually-hidden"
      id="event-favorite"
      type="text"
      name="event-favorite"
      value="${isNewPoint ? false : dataPoint.isFavorite}">
  </form>
</li>`;
};