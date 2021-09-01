import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import SmartView from './smart.js';

const createStatisticsTemplate = () => {
  const money = 12345;
  return `<section class="statistics">
    <h2 class="visually-hidden">Trip statistics</h2>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="money" width="900"></canvas>
    </div>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="type" width="900"></canvas>
    </div>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="time-spend" width="900"></canvas>
    </div>
  </section>`;
};

export default class Statistics extends SmartView {
  constructor(points) {
    super();

    this._data = {
      points: points,
      dateFrom: (() => {
        const daysToFullWeek = 6;
        return dayjs().subtract(daysToFullWeek, 'day').toDate();
      })(),
      dateTo: dayjs().toDate(),
    };

    this._dateChangeHandler = this._dateChangeHandler.bind(this);

    this._setCharts();
    this._setDatepicker();
  }

  removeElement() {
    super.removeElement();

    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }
  }

  getTemplate() {
    return createStatisticsTemplate(this._data);
  }

  restoreHandlers() {
    this._setCharts();
    this._setDatepicker();
  }

  _dateChangeHandler([dateFrom, dateTo]) {
    if (!dateFrom || !dateTo) {
      return;
    }

    this.updateData({
      dateFrom,
      dateTo,
    });
  }

  _setDatepicker() {
    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }

    this._datepicker = flatpickr(
      this.getElement().querySelector('.statistic__period-input'),
      {
        mode: 'range',
        dateFormat: 'j F',
        defaultDate: [this._data.dateFrom, this._data.dateTo],
        onChange: this._dateChangeHandler,
      },
    );
  }

  _setCharts() {
    // Нужно отрисовать два графика
  }
}
