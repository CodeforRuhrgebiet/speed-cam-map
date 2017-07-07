/*jslint browser: true*/
/*global L, flatpickr */

(function (window, document, L, undefined) {

'use strict';


function addDataLayerToMap(map, data) {

  // remove active street layer, if any is set
  if (streetLayer !== null) {
    map.removeLayer(streetLayer);
  }

	streetLayer = L.geoJson(data, {
    stroke: true,
    color: '#FF0000',
    opacity: 1,
    strokeWidth: 1,
    onEachFeature: (feature, layer) => {
      layer.bindPopup(feature.properties.tags.name);
     }
  });

	streetLayer.addTo(map);
}

function loadDataLayer(date) {

  const req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState === 4 && req.status === 200) {
      const data = JSON.parse(req.responseText);
      addDataLayerToMap(map, data);
    }
  };

  req.open('GET', './data/' + date + '.geojson', true);
  req.send();
}

function loadIndex(cb) {

  const req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState === 4 && req.status === 200) {
      const data = JSON.parse(req.responseText);
      cb(data);
    }
  };

  req.open('GET', './data/index.json', true);
  req.send();
}

// instance of current street layer
let streetLayer = null;

let bounds = [
  [51.291124, 6.405716],
  [51.60693, 7.630692]
];

// create leaflet map
let map = L.map('map', {
  center: [51.457087, 7.011429],
  zoom: 12,
  maxBounds: bounds
});

L.Icon.Default.imagePath = 'images/';

// add default stamen tile layer
let baseLayer = new L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
  minZoom: 12,
  maxZoom: 18,
  bounds: bounds,
  attribution: 'Daten zu Geschwindigkeitskontrollen: <a href="http://www.use24.essen.de/Webportal/agency/default.aspx?PortalObjectId=18399&OrganizationUnitId=1426">Ordnungsamt der Stadt Essen</a>. Kartendaten © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
});
baseLayer.addTo(map);

loadIndex((dates) => {
  flatpickr('#js-date-picker', {
    defaultDate: 'today',
    dateFormat: 'd.m.Y',
    enableTime: false,
    locale: {
      firstDayOfWeek: 1
    },
    enable: dates,
    // load data for today
    onReady: (selectedDates, dateStr, instance) => {
      loadDataLayer(dateStr);
    },
    onChange: (selectedDates, dateStr, instance) => {
      loadDataLayer(dateStr);
    }
  });
});

}(window, document, L));
