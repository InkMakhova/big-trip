import {FilterType} from '../constants.js';
import AbstractView from './abstract.js';

const emptyListTextType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

const createEmptyListPoints = (filterType) => {
  const emptyListTextValue = emptyListTextType[filterType];
  return `<p class="trip-events__msg">
    ${emptyListTextValue}
  </p>`;
};

export default class EmptyList extends AbstractView {
  constructor (filterType) {
    super();

    this._filterType = filterType;
  }

  getTemplate() {
    return createEmptyListPoints(this._filterType);
  }
}
