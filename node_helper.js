const NodeHelper = require('node_helper'); // eslint-disable-line import/no-unresolved
const request = require('request'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = NodeHelper.create({
  start() {
    this._startedModules = {};
  },

  socketNotificationReceived(notificationName, payload) {
    const self = this;

    if (notificationName === 'MMM-ELVIRA.INIT') {
      if (!self._startedModules[payload.moduleId]) {
        self._init(payload.moduleId, payload.config);
        self.sendSocketNotification('MMM-ELVIRA.STARTED', true);
        self._startedModules[payload.moduleId] = true;
      }
    }
  },

  _init(moduleId, config) {
    const self = this;

    // Get the data immediately right after the module initialisation has completed.
    setTimeout(() => {
      self._getData(moduleId, config);
    }, 0);

    setInterval(() => {
      self._getData(moduleId, config);
    }, config.updateInterval);
  },

  _getData(moduleId, config) {
    const self = this;

    const requestOptions = {
      method: 'POST',
      url: 'https://jegy-a.mav.hu/IK_API_PROD/api/OfferRequestApi/GetOfferRequest',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        UserSessionId: "''",
        Language: 'hu'
      },
      json: true,
      body: {
        offerkind: '1',
        isOneWayTicket: true,
        startStationCode: config.startStationCode,
        endStationCode: config.endStationCode,
        travelStartDate: new Date(),
        passangers: [
          {
            passengerCount: 1,
            passengerId: 0,
            customerTypeKey: 'HU_44_025-065',
            customerDiscountsKeys: []
          }
        ],
        selectedServices: [
          // 52
        ],
        selectedSearchServices: [],
        isTravelEndTime: false,
        innerStationsCodes: [],
        isOfDetailedSearch: false
      }
    };

    request(requestOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        self._processResponse(moduleId, body);
      } else {
        console.error(`MMM-Elvira Node helper: Failed to load data in the background. Error: ${error}. Status code: ${response.statusCode}. Body: ${body}`); // eslint-disable-line no-console
      }
    });
  },

  _processResponse(moduleId, responseBody) {
    const payload = {

      // eslint-disable-next-line object-shorthand -- Property shorthand may not be supported in older Node versions.
      moduleId: moduleId,
      data: responseBody
    };
    this.sendSocketNotification('MMM-ELVIRA.VALUE_RECEIVED', payload);
  }
});
