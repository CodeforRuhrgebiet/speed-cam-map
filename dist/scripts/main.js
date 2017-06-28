/*jslint browser: true*/
/*global L */

(function (window, document, L, undefined) {

'use strict';

// instance of current street layer
let streetLayer = null;

// create leaflet map
let map = L.map('map', {
  center: [51.457087, 7.011429],
  zoom: 13
})

L.Icon.Default.imagePath = 'images/'

// add default stamen tile layer
new L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: 18,
  attribution: 'Daten zu Geschwindigkeitskontrollen: <a href="http://www.use24.essen.de/Webportal/agency/default.aspx?PortalObjectId=18399&OrganizationUnitId=1426">Ordnungsamt der Stadt Essen</a>. Kartendaten © <a href="http://www.openstreetmap.org">OpenStreetMap contributors</a>'
}).addTo(map)

loadIndex((dates) => {
  flatpickr(elem, {
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
      loadDataLayer(dateStr)
    }
  });
});

function addDataLayerToMap(map, data) {

  // remove active street layer, if any is set
  if (streetLayer !== null) {
    map.removeLayer(streetLayer)
  }

	streetLayer = L.geoJson(data, {
    stroke: true,
    color: '#FF0000',
    opacity: 1,
    strokeWidth: 1
  })

	streetLayer.addTo(map)
}

function loadDataLayer(date) {

  const req = new XMLHttpRequest()

  req.onreadystatechange = () => {
    if (req.readyState == 4 && req.status == 200) {
      const data = JSON.parse(req.responseText)
      addDataLayerToMap(map, data)
    }
  }

  req.open("GET", './data/' + date + '.geojson', true)
  req.send()
}

function loadIndex(cb) {

  const req = new XMLHttpRequest()

  req.onreadystatechange = () => {
    if (req.readyState == 4 && req.status == 200) {
      const data = JSON.parse(req.responseText)
      cb(data)
    }
  }

  req.open("GET", './data/index.json', true)
  req.send()
}

}(window, document, L))
