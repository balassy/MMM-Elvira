# MMM-Elvira

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) to display Hungarian public train departure times using real-time data from the "Elvira" service provided by the Hungarian national railway company (MÁV).

## Features


This module is capable to display only a single station and route data. If you would like to see the departure times of more stations and routes on your mirror, add this module multiple times.

For updates, please check the [CHANGELOG](https://github.com/balassy/MMM-Elvira/blob/master/CHANGELOG.md).


## Using the module

To use this module follow these steps:

1. Clone this repository to the `modules` folder of your MagicMirror:

```bash
git clone https://github.com/balassy/MMM-Elvira.git
```

2. Step into the newly created folder:

```bash
cd MMM-Elvira
```

3. Install third-party dependencies:

```bash
npm install
```

4. Add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: "MMM-Elvira",
      position: "top_right",
      header: 'Déli pályaudvar - Biatorbágy',
      config: {
        startStationCode: '005501016',
        endStationCode: '005501057',
        updateInterval: 60000,
        headText: 'Déli - Biatorbágy',
        showHead: true,
        showSymbolInHead: true,
        maxNumberOfItems: 10
      }
    }
  ]
}
```

## Configuration options

| Option                 | Description
|------------------------|-----------
| `startStationCode` and `endStationCode` | **REQUIRED** The unique identifiers of the first and last stations of the route. See below for more details about how to acquire them.<br><br> **Type:** `string` <br>**Default value:** `(empty)`
| `updateInterval`       | *Optional* The frequency of when the module should query the departure times from the Futár service. <br><br>**Type:** `int` (milliseconds) <br>**Default value:** `60000` milliseconds (1 minute)
| `headText`             | *Optional* The content of the custom headline inside the module.  <br><br>**Type:** `string` <br>**Default value:** `(empty)`
| `showHead`             | *Optional* Determines whether the module should display a custom headline (independently from the standard headline of the module). Use the `headText` property to specify the text. <br><br>**Type:** `boolean` <br>**Default value:** `true`
| `showSymbolInHead`     | *Optional* Determines whether the custom headline should include a train icon.<br><br>**Type:** `boolean`  <br>**Default value:** `true`
| `maxNumberOfItems`     | *Optional* Determines the limit for the number of displayed departure times. <br><br>**Type:** `number`  <br>**Default value:** `5`
| `fade`                 | *Optional* Determines whether the future stop times are gradiently faded to black.<br><br>**Type:** `boolean`  <br>**Default value:** `true`
| `fadePoint`            | *Optional* Determines where the fading should be started.<br><br>**Type:** `double`<br>**Possible values:** `0` (top of the list) - `1` (bottom of the list)<br>**Default value:** `0.25`

## How to get the `startStationCode` and `endStationCode`

To get the start and end station identifiers required by this module, follow these steps:

1. Launch Google Chrome or Microsoft Edge and navigate to https://jegy.mav.hu/.

2. Open the Developer Tools (F12) and enable network monitoring.

3. On the webpage enter your preferred departure and destination stations and start a search.

4. Examine the `POST` XHR request to the `GetOfferRequest` endpoint, you will see `startStationCode` and `endStationCode` in the request payload. 

## How it works

This module periodically sends requests from the browser window of the MagicMirror Electron application to the [Elvira webservice](https://jegy-a.mav.hu/). Although the service is free and public, its API is not publicly documented, so the module was created by understanding the current communication on the https://jegy.mav.hu/ webpage.

The API does not require any API key.

## Localization

Currently this module supports English (`en`) and Hungarian (`hu`) languages. The language can be specified in the global `language` setting in the `config.js` file.

Want to see more languages? Please contribute!

## Contribution

Although for operation this module does not depend on any other module, if you would like to contribute to the codebase, please use the preconfigured linters to analyze the source code before sending a pull request. To run the linters follow these steps:

1. Install developer dependencies:

```bash
npm ci
```

2. Run all linters:

```bash
npm run lint
```

## Got feedback?

Your feedback is more than welcome, please send your suggestions, feature requests or bug reports as [GitHub issues](https://github.com/balassy/MMM-Elvira/issues).

## Acknowledgement

Many thanks to:
- [Michael Teeuw](https://github.com/MichMich) for creating and maintaining the [MagicMirror²](https://github.com/MichMich/MagicMirror/) project fully open source.
- [Bálint Berente](https://github.com/berenteb) for reverse engineering and publishing information about the [MÁV API](https://github.com/berenteb/mav-api).

## About the author

This project is created and maintaned by [György Balássy](https://www.linkedin.com/in/balassy).
