/*jslint browser: true*/
/*global L, flatpickr */

(function (window, document, L, undefined) {

'use strict';

const minDate = '26.06.2017';
const maxDate = '01.09.2017';

function addDataLayerToMap(map, data) {

  // remove active street layer, if any is set
  if (streetLayer !== null) {
    map.removeLayer(streetLayer);
  }

	streetLayer = L.geoJson(data, {
    stroke: true,
    color: '#ffdb66',
    opacity: 1,
    strokeWidth: 1,
    onEachFeature: (feature, layer) => {
      let content = feature.properties.tags.name;
      let maxspeed = feature.properties.tags.maxspeed;
      content += (maxspeed) ? ` (${maxspeed} km/h)` : '';

      layer.bindPopup(content, {
        sticky: true
      });

      layer.on('mouseover', (e) => {
        layer.openPopup();
      });

      layer.on('mouseout', (e) => {});
     }
  });

	streetLayer.addTo(map);
}

function loadDataLayer(date) {

  var fileName = dateToFileName(date);

  const req = new XMLHttpRequest();

  req.onreadystatechange = () => {
    if (req.readyState === 4 && req.status === 200) {
      const data = JSON.parse(req.responseText);
      addDataLayerToMap(map, data);
    }
  };

  req.open('GET', './data/' + fileName + '.geojson', true);
  req.send();
}

function dateToFileName(date) {
  date = date.split('.');
  return date[2]+'-'+date[1]+'-'+date[0];
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

flatpickr('#js-date-picker', {
  defaultDate: 'today',
  dateFormat: 'd.m.Y',
  minDate: minDate,
  maxDate: maxDate,
  enableTime: false,
  locale: {
    firstDayOfWeek: 1
  },
  disable: [
    function(date) {
      // always disable Saturday and Sunday
      return (date.getDay() === 6 || date.getDay() === 0);
    }
  ],
  // load data for today
  onReady: (selectedDates, dateStr, instance) => {
    if (dateStr !== '') {
      loadDataLayer(dateStr);
    }
  },
  onChange: (selectedDates, dateStr, instance) => {
    if (dateStr !== '') {
      loadDataLayer(dateStr);
    }
  }
});

}(window, document, L));
