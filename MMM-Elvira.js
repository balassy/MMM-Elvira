/* global Module, moment, config */

/* Magic Mirror Module: MMM-Elvira (https://github.com/balassy/MMM-Elvira)
 * By György Balássy (https://www.linkedin.com/in/balassy)
 * MIT Licensed.  */

Module.register('MMM-Elvira', {
  defaults: {
    startStationCode: '005501057',
    endStationCode: '005501024',
    updateInterval: 60000,
    headText: '',
    showHead: true, // true | false
    showSymbolInHead: true, // true | false
    maxNumberOfItems: 5,
    fade: true,
    fadePoint: 0.25
  },

  requiresVersion: '2.1.0',

  getScripts() {
    return [
      'moment.js'
    ];
  },

  getStyles() {
    return [
      'MMM-Elvira.css',
      'font-awesome.css'
    ];
  },

  getTranslations() {
    return {
      en: 'translations/en.json',
      hu: 'translations/hu.json'
    };
  },

  start() {
    const self = this;
    self.viewModel = null;
    self.hasData = false;

    moment.locale(config.language);

    const payload = {
      moduleId: self.identifier,
      config: self.config
    };

    self.sendSocketNotification('MMM-ELVIRA.INIT', payload);
  },

  getDom() {
    const wrapper = document.createElement('div');

    if (this.viewModel) {
      if (this.config.showHead) {
        const headEl = this._getDomForHead();
        wrapper.appendChild(headEl);
      }

      if (this.viewModel.departures.length === 0) {
        const noDepartureEl = this._getDomForNoDeparture();
        wrapper.appendChild(noDepartureEl);
      } else {
        const tableEl = document.createElement('table');

        for (let i = 0; i < this.viewModel.departures.length; i++) {
          const rowEl = this._getDomForDeparture(this.viewModel.departures, i);
          tableEl.appendChild(rowEl);
        }

        wrapper.appendChild(tableEl);

        const clearfixEl = document.createElement('div');
        clearfixEl.classList = 'clearfix';
        wrapper.appendChild(clearfixEl);
      }
    } else {
      const loadingEl = this._getDomForLoading();
      wrapper.appendChild(loadingEl);
    }

    return wrapper;
  },

  _getDomForLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.innerHTML = this.translate('LOADING');
    loadingEl.classList = 'dimmed small';
    return loadingEl;
  },

  _getDomForNoDeparture() {
    const noDepartureEl = document.createElement('div');
    noDepartureEl.innerHTML = this.translate('NO_DEPARTURE');
    noDepartureEl.classList = 'dimmed small';
    return noDepartureEl;
  },

  _getDomForHead() {
    const headEl = document.createElement('div');

    if (this.config.showSymbolInHead) {
      const headSymbolEl = document.createElement('span');
      headSymbolEl.classList = 'symbol fa fa-train';
      headEl.appendChild(headSymbolEl);
    }

    const headTextEl = document.createElement('span');
    headTextEl.innerHTML = this.config.headText;
    headEl.appendChild(headTextEl);

    return headEl;
  },

  _getDomForDeparture(departures, index) {
    const departure = departures[index];

    const timeEl = document.createElement('tr');
    timeEl.classList = 'small';
    timeEl.style.opacity = this._getRowOpacity(departures.length, index);

    const relativeTimeEl = document.createElement('td');
    relativeTimeEl.classList = 'relative-time';
    relativeTimeEl.innerHTML = departure.actualTime.fromNow();
    timeEl.appendChild(relativeTimeEl);

    const absoluteTimeEl = document.createElement('td');
    absoluteTimeEl.classList = 'absolute-time dimmed';
    absoluteTimeEl.innerHTML = departure.hasDelay
      ? ` (<span class='delayed-original-time'>${departure.originalTime.format('LT')}</span> <span class='delayed'>${departure.actualTime.format('LT')}</span>)`
      : ` (${departure.actualTime.format('LT')})`;
    timeEl.appendChild(absoluteTimeEl);

    const trainEl = document.createElement('td');
    trainEl.classList = 'train';
    trainEl.innerHTML = departure.trainSign;
    timeEl.appendChild(trainEl);

    return timeEl;
  },

  socketNotificationReceived(notificationName, payload) {
    if (notificationName === 'MMM-ELVIRA.STARTED') {
      this.updateDom();
    } else if (notificationName === 'MMM-ELVIRA.VALUE_RECEIVED' && payload.moduleId === this.identifier) {
      this.hasData = true;
      this._processResponseJson(payload.data);
      this.updateDom();
    }
  },

  _processResponseJson(response) {
    const departures = [];

    response.route.forEach((route) => {
      const scheduledDepartureTimeStr = this._getScheduledDepartureTimeFromRoute(route);
      const expectedDepartureTimeStr = this._getExpectedDepartureTimeFromRoute(route);

      const scheduledDepartureTimeM = moment(scheduledDepartureTimeStr);

      const departure = {
        originalTime: scheduledDepartureTimeM,
        actualTime: scheduledDepartureTimeM,
        hasDelay: false,
        travelTime: this._getTravelTimeFromRoute(route),
        trainSign: this._getTrainSignFromRoute(route),
        trainType: this._getTrainTypeFromRoute(route)
      };

      if (expectedDepartureTimeStr) { // can be null
        const expectedDepartureTimeM = moment(expectedDepartureTimeStr);
        const hasExpectedTime = expectedDepartureTimeM.year() !== 1; // can be '0001-01-01T00:00:00+01:00'

        if (hasExpectedTime) {
          departure.hasDelay = !expectedDepartureTimeM.isSame(scheduledDepartureTimeM);
          departure.actualTime = expectedDepartureTimeM;
        }
      }

      departures.push(departure);
    });

    const departuresLimited = departures.length > this.config.maxNumberOfItems
      ? departures.slice(0, this.config.maxNumberOfItems)
      : departures;

    this.viewModel = {
      departures: departuresLimited
    };

    if (!this.hasData) {
      this.updateDom();
    }

    this.hasData = true;
  },

  _getScheduledDepartureTimeFromRoute(route) {
    return route.departure.time;
  },

  _getExpectedDepartureTimeFromRoute(route) {
    return route.departure.timeExpected;
  },

  _getTravelTimeFromRoute(route) {
    return route.travelTimeMin;
  },

  _getTrainSignFromRoute(route) {
    return route.details.routes[0].trainDetails.viszonylatiJel.jel;
  },

  _getTrainTypeFromRoute(route) {
    return route.details.routes[0].trainDetails.trainKind.name;
  },

  _getRowOpacity(totalNumberOfRows, currentRowNumber) {
    let opacity = 1;

    if (this.config.fade && this.config.fadePoint < 1) {
      if (this.config.fadePoint < 0) {
        this.config.fadePoint = 0;
      }
      const startingPoint = totalNumberOfRows * this.config.fadePoint;
      const steps = totalNumberOfRows - startingPoint;
      if (currentRowNumber >= startingPoint) {
        const currentStep = currentRowNumber - startingPoint;
        opacity = 1 - ((1 / steps) * currentStep);
      }
    }

    return opacity;
  }
});
