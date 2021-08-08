import {
  render,
  renderTemplate,
  RenderPosition,
  getRandomInteger
} from './util.js';
import {getFilteredPoints} from './presenter/filters-presenter.js';
import {getSortedPoints} from './presenter/sort-presenter.js';
import TripInfoView from './view/trip-info.js';
import SiteMenuView from './view/site-menu.js';
import PriceView from './view/price.js';
import FiltersView from './view/filters';
import SortView from './view/sort.js';
import PointListView from './view/point-list';
import PointListEmptyView from './view/point-list-empty.js';
import PointView from './view/point.js';
import PointFormView from './view/add-edit-point.js';

import {generateDataPoint} from './mock/point-mock.js';

import {
  FILTERS
} from './constants.js';
import PointForm from './view/add-edit-point.js';
//import {formats} from 'dayjs/locale/*';

const POINTS_NUMBER = 2;

const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');
const siteMenuElement = siteHeaderElement.querySelector('.trip-controls__navigation');
const filterElement = siteHeaderElement.querySelector('.trip-controls__filters');
const eventAddButton = siteHeaderElement.querySelector('.trip-main__event-add-btn');

render(tripMainElement, new TripInfoView().getElement(), RenderPosition.AFTERBEGIN);
render(siteMenuElement, new SiteMenuView().getElement(), RenderPosition.BEFOREEND);
render(filterElement, new FiltersView(FILTERS).getElement(), RenderPosition.BEFOREEND);

const filterForm = filterElement.querySelector('.trip-filters');

const tripInfoElement = tripMainElement.querySelector('.trip-info');

render(tripInfoElement, new PriceView(getRandomInteger(200, 1000)).getElement(), RenderPosition.BEFOREEND);

const siteMainElement = document.querySelector('.page-main');
const tripEventsElement = siteMainElement.querySelector('.trip-events');

render(tripEventsElement, new SortView().getElement(), RenderPosition.BEFOREEND);

const renderPoint = (pointListElement, point) => {
  const pointComponent = new PointView(point);
  const pointEditComponent = new PointFormView('edit', point);

  const replacePointToForm = () => {
    pointListElement.replaceChild(pointEditComponent.getElement(), pointComponent.getElement());
  };

  const replaceFormToPoint = () => {
    pointListElement.replaceChild(pointComponent.getElement(), pointEditComponent.getElement());
  };

  pointComponent.getElement().querySelector('.event__rollup-btn').addEventListener('click', () => {
    replacePointToForm();
  });

  pointEditComponent.getElement().querySelector('form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    replaceFormToPoint();
  });

  pointEditComponent.getElement().querySelector('.event__rollup-btn').addEventListener('click', (evt) => {
    evt.preventDefault();
    replaceFormToPoint();
  });

  render(pointListElement, pointComponent.getElement(), RenderPosition.BEFOREEND);
};

const sortForm = tripEventsElement.querySelector('.trip-sort');

const getFilterValue = () => filterForm
  .querySelector('input:checked')
  .value;

const getSortValue = () => sortForm
  .querySelector('input:checked')
  .value;

const points = Array.from({length: POINTS_NUMBER}, () => generateDataPoint());
//const newPointComponent = new PointFormView('new');
//const editPointComponent = new PointFormView('edit', point);

const filterAndSortPoints = (filterValue, sortValue) => {
  const tripEnventsListElement = tripEventsElement.querySelector('.trip-events__list');
  const tripEmptyListElement = tripEventsElement.querySelector('.trip-events__msg');

  if (tripEnventsListElement) {
    tripEnventsListElement.remove();
  }

  if (tripEmptyListElement) {
    tripEmptyListElement.remove();
  }

  const filteredPoints = getFilteredPoints(points, filterValue);

  if (filteredPoints.length === 0) {
    render(tripEventsElement, new PointListEmptyView(filterValue).getElement(), RenderPosition.BEFOREEND);
  } else {
    const pointListComponent = new PointListView();
    render(tripEventsElement, pointListComponent.getElement(), RenderPosition.BEFOREEND);

    getSortedPoints(filteredPoints, sortValue)
      .map((point) => {
        renderPoint(pointListComponent.getElement(), point);
        //render(pointListComponent.getElement(), new PointView(point).getElement(), RenderPosition.BEFOREEND);
      });
  }
};

const filterPoints = (evt) => filterAndSortPoints(evt.target.value, getSortValue());

const sortPoints = (evt) => filterAndSortPoints(getFilterValue(), evt.target.value);


if (points.length === 0) {
  render(tripEventsElement, new PointListEmptyView().getElement(), RenderPosition.BEFOREEND);
} else {
  filterAndSortPoints(getFilterValue(), getSortValue());
}

// const addNewPointForm = () => {
//   renderElement(tripEnventsListElement, new PointFormView('new').getElement(), RenderPosition.AFTERBEGIN);

//   eventAddButton.disabled = true;
//   eventAddButton.removeEventListener('click', addNewPointForm);

//   sortForm.querySelector('#sort-time').checked = true;
//   filterForm.querySelector('#filter-everything').checked = true;
// };

//eventAddButton.addEventListener('click', addNewPointForm);

filterForm.addEventListener('change', filterPoints);

sortForm.addEventListener('change', sortPoints);
