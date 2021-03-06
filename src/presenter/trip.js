import {
  SortType,
  defaultSortType,
  FilterType,
  UpdateType,
  UserAction
} from '../constants.js';
import {
  render,
  remove,
  RenderPosition
} from '../utils/render.js';
import {
  sortPointsTime,
  sortPointsPrice,
  sortPointsDay
} from '../utils/point.js';
import {filter} from '../utils/filter.js';
import TripInfoView from '../view/trip-info.js';
import SortView from '../view/sort.js';
import PointListView from '../view/point-list.js';
import LoadingView from '../view/loading.js';
import EmptyListView from '../view/empty-list.js';
import PointPresenter, {State as PointPresenterViewState} from './point.js';
import PointNewPresenter from './point-new.js';

export default class Trip {
  constructor(tripContainer, pointsModel, destinationsModel, offersModel, filterModel, api, infoContainer) {
    this._pointsModel = pointsModel;
    this._destinationsModel = destinationsModel;
    this._offersModel = offersModel;
    this._filterModel = filterModel;

    this._tripComponent = tripContainer;
    this._tripInfoComponent = infoContainer;
    this._pointPresenters = new Map();

    this._filterType = FilterType.EVERYTHING;
    this._currentSortType = defaultSortType;
    this._isLoading = true;
    this._api = api;

    this._sortComponent = null;
    this._emptyListComponent = null;
    this._infoComponent = null;

    this._pointListComponent = new PointListView();
    this._loadingComponent = new LoadingView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._pointNewPresenter = new PointNewPresenter(this._pointListComponent, this._handleViewAction);
  }

  init() {
    this._renderTrip();

    this._pointsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._destinationsModel.addObserver(this._handleModelEvent);
    this._offersModel.addObserver(this._handleModelEvent);
  }

  destroy() {
    this._clearTrip({resetSortType: true});

    remove(this._pointListComponent);

    this._pointsModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
    this._destinationsModel.removeObserver(this._handleModelEvent);
  }

  createPoint(callback) {
    this._currentSortType = defaultSortType;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this._pointNewPresenter.init(callback, this._getDestinations(), this._getOffers());
  }

  _getPoints() {
    this._filterType = this._filterModel.getFilter();

    const points = this._pointsModel.getPoints();

    const filtredPoints = filter[this._filterType](points);

    switch (this._currentSortType) {
      case SortType.TIME:
        filtredPoints.sort(sortPointsTime);
        break;
      case SortType.PRICE:
        filtredPoints.sort(sortPointsPrice);
        break;
      default:
        this._pointsModel.getPoints().slice().sort(sortPointsDay);
        filtredPoints.sort(sortPointsDay);
    }
    return filtredPoints;
  }

  _getDestinations() {
    return this._destinationsModel.getDestinations();
  }

  _getOffers() {
    return this._offersModel.getOffers();
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;

    this._clearTrip();
    this._renderTrip();
  }

  _handleModeChange() {
    this._pointNewPresenter.destroy();
    this._pointPresenters.forEach((presenter) => presenter.resetView());
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._pointPresenters.get(update.id).setViewState(PointPresenterViewState.SAVING);

        this._api.updatePoint(update)
          .then((response) => {
            this._pointsModel.updatePoint(updateType, response);
          })
          .catch(() => {
            this._pointPresenters.get(update.id).setViewState(PointPresenterViewState.ABORTING);
          });
        break;

      case UserAction.ADD_POINT:
        this._pointNewPresenter.setSaving();

        this._api.addPoint(update)
          .then((response) => {
            this._pointsModel.addPoint(updateType, response);
          })
          .catch(() => {
            this._pointNewPresenter.setAborting();
          });
        break;

      case UserAction.DELETE_POINT:
        this._pointPresenters.get(update.id).setViewState(PointPresenterViewState.DELETING);

        this._api.deletePoint(update)
          .then(() => {
            this._pointsModel.deletePoint(updateType, update);
          })
          .catch(() => {
            this._pointPresenters.get(update.id).setViewState(PointPresenterViewState.ABORTING);
          });
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenters.get(data.id).init(data, this._getDestinations(), this._getOffers());
        break;
      case UpdateType.MINOR:
        this._clearTrip();
        this._renderTrip();
        break;
      case UpdateType.MAJOR:
        this._clearTrip({resetSortType: true});
        this._renderTrip();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        this._clearTrip();
        this._renderTrip();
        break;
    }
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortView(SortType, this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._tripComponent, this._sortComponent);
  }

  _renderPointList() {
    render(this._tripComponent, this._pointListComponent);
  }

  _renderPoint(point) {
    const pointPresenter = new PointPresenter(this._pointListComponent, this._handleViewAction, this._handleModeChange);

    const destinations = this._getDestinations();
    const offers = this._getOffers();

    pointPresenter.init(point, destinations, offers);

    this._pointPresenters.set(point.id, pointPresenter);
  }

  _renderPoints(points) {
    points.forEach((point) => this._renderPoint(point));
  }

  _renderLoading() {
    render(this._tripComponent, this._loadingComponent);
  }

  _renderEmptyList() {
    this._emptyListComponent = new EmptyListView(this._filterType);
    render(this._tripComponent, this._emptyListComponent);
  }

  renderTripInfo(points) {
    this._infoComponent = new TripInfoView(points);
    render(this._tripInfoComponent, this._infoComponent.getElement(), RenderPosition.AFTERBEGIN);
  }

  _clearTrip({resetSortType = false} = {}) {
    this._pointNewPresenter.destroy();
    this._pointPresenters.forEach((presenter) => presenter.destroy());
    this._pointPresenters.clear();

    remove(this._sortComponent);
    remove(this._loadingComponent);
    remove(this._infoComponent);

    if (this._emptyListComponent) {
      remove(this._emptyListComponent);
    }

    if (resetSortType) {
      this._currentSortType = defaultSortType;
    }
  }

  _renderTrip() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const allTripPoints = this._pointsModel.getPoints();

    const filteredPoints = this._getPoints();

    if (allTripPoints.length === 0) {
      this._renderEmptyList();
    } else if (allTripPoints.length > 0 && filteredPoints.length === 0) {
      this.renderTripInfo(allTripPoints);
      this._renderEmptyList();
    } else {
      this.renderTripInfo(allTripPoints);
      this._renderSort();
      this._renderPointList();
      this._renderPoints(filteredPoints);
    }
  }
}
