// ---------------- MAPA ----------------

var map = L.map('map').setView([43.285, 20.879], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & Carto'
}).addTo(map);


// ---------------- STAZE ----------------

var stazeLayer = L.geoJSON(null, {
  style: function(feature) {

    let tezina = feature.properties.tezina;
    let boja = "blue";

    if (tezina === "laka") boja = "green";
    if (tezina === "srednja") boja = "orange";
    if (tezina === "teska") boja = "red";

    return { color: boja, weight: 4 };
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <b>${p.naziv}</b><br>
      ${p.opis_SRB || ""}
      <br>Dužina: ${p.duzina_km} km
      <br>Trajanje: ${p.trajanje}
      <br>Visinska razlika: ${p.visinska_r} m
    `);
  }
}).addTo(map);

fetch("data/staze.geojson")
  .then(res => res.json())
  .then(data => stazeLayer.addData(data));


// ---------------- LOKACIJE (IKONICE + AUDIO SRB/ENG + NAVIGACIJA) ----------------

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {

    let iconPath = feature.properties.Ikonica || "icons/default.png";

    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: iconPath,
        iconSize: [32, 32]
      })
    });
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;
    let lat = feature.geometry.coordinates[1];
    let lng = feature.geometry.coordinates[0];

    layer.bindPopup(`
      <b>${p.Naziv}</b><br>

      ${p.Slika ? `<img src="${p.Slika}">` : ""}

      <p>${p.Opis_SRB || ""}</p>

      ${p.audio_SRB ? `
        <b>🎧 Srpski:</b><br>
        <audio controls>
          <source src="${p.audio_SRB}" type="audio/mpeg">
        </audio>
      ` : ""}

      ${p.audio_ENG ? `
        <b>🎧 English:</b><br>
        <audio controls>
          <source src="${p.audio_ENG}" type="audio/mpeg">
        </audio>
      ` : ""}

      <br>

      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank">
        🧭 Idi ovde
      </a>
    `);
  }

}).addTo(map);

fetch("data/lokacije.geojson")
  .then(res => res.json())
  .then(data => lokacijeLayer.addData(data));


// ---------------- TURIZAM ----------------

var turizamLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {

    let iconPath = feature.properties.Ikonica || "icons/default.png";

    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: iconPath,
        iconSize: [40, 40]
      })
    });
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;
    let lat = feature.geometry.coordinates[1];
    let lng = feature.geometry.coordinates[0];

    layer.bindPopup(`
      <b>${p.naziv}</b><br>
      ${p.slika ? `<img src="${p.slika}">` : ""}
      <p>${p.opis_srb || ""}</p>

      <br>

      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank">
        🧭 Idi ovde
      </a>
    `);
  }

}).addTo(map);

fetch("data/turizam.geojson")
  .then(res => res.json())
  .then(data => turizamLayer.addData(data));


// ---------------- GPS ----------------

document.getElementById("gpsBtn").onclick = function() {

  map.locate({ setView: true, maxZoom: 16 });

  map.on('locationfound', function(e) {

    if (window.gpsMarker) {
      map.removeLayer(window.gpsMarker);
    }

    window.gpsMarker = L.marker(e.latlng).addTo(map)
      .bindPopup("📍 Vi ste ovde")
      .openPopup();
  });

  map.on('locationerror', function() {
    alert("Ne može da pronađe lokaciju");
  });
};


// ---------------- FILTER ----------------

document.querySelectorAll('.filters input').forEach(el => {
  el.addEventListener('change', filterMap);
});

function filterMap() {

  let tipovi = [...document.querySelectorAll('.tip:checked')].map(i => i.value);
  let tezine = [...document.querySelectorAll('.tezina:checked')].map(i => i.value);

  stazeLayer.eachLayer(layer => {

    let tip = layer.feature.properties.tip;
    let tezina = layer.feature.properties.tezina;

    if (tipovi.some(t => tip.includes(t)) && tezine.includes(tezina)) {
      layer.addTo(map);
    } else {
      map.removeLayer(layer);
    }
  });

  if (document.getElementById("lokacijeToggle").checked) map.addLayer(lokacijeLayer);
  else map.removeLayer(lokacijeLayer);

  if (document.getElementById("turizamToggle").checked) map.addLayer(turizamLayer);
  else map.removeLayer(turizamLayer);
}


// ---------------- FILTER PANEL ----------------

document.getElementById("filterBtn").onclick = function() {
  let panel = document.getElementById("filterPanel");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
};
