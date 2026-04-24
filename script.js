// ---------------- MAPA ----------------

var map = L.map('map').setView([43.285, 20.879], 13);

// 🔥 OZBILJNIJI TILE (planinski izgled)
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: OpenStreetMap'
}).addTo(map);

// ---------------- STAZE ----------------

var stazeLayer = L.geoJSON(null, {
  style: function(feature) {
    let boja = "blue";

    if (feature.properties.tezina === "laka") boja = "green";
    if (feature.properties.tezina === "srednja") boja = "orange";
    if (feature.properties.tezina === "teska") boja = "red";

    return { color: boja, weight: 4, opacity: 0.8 };
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.naziv}</h3>
      ${p.opis_SRB || ""}
      <br><b>Dužina:</b> ${p.duzina_km} km
      <br><b>Trajanje:</b> ${p.trajanje}
      <br><b>Uspon:</b> ${p.visinska_r} m
    `);

    // hover highlight
    layer.on('mouseover', function () {
      layer.setStyle({ weight: 6 });
    });

    layer.on('mouseout', function () {
      stazeLayer.resetStyle(layer);
    });
  }
}).addTo(map);

// učitaj staze
fetch("data/staze.geojson")
  .then(res => res.json())
  .then(data => stazeLayer.addData(data));

// ---------------- LOKACIJE ----------------

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: feature.properties.ikonica,
        iconSize: [32, 32]
      })
    });
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.Naziv}</h3>
      <img src="${p.Slika}">
      <p>${p.Opis_SRB || ""}</p>
      ${p.audio_SRB ? `<audio controls src="${p.audio_SRB}"></audio>` : ""}
    `);
  }

}).addTo(map);

// učitaj lokacije
fetch("data/lokacije.geojson")
  .then(res => res.json())
  .then(data => lokacijeLayer.addData(data));

// ---------------- TURIZAM ----------------

var turizamLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: feature.properties.logo,
        iconSize: [40, 40]
      })
    });
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.naziv}</h3>
      <img src="${p.slika}">
      <p>${p.opis_srb}</p>
      📞 ${p.telefon || ""}
      <br>
      <a href="${p.website}" target="_blank">🌐 Website</a>
    `);
  }

}).addTo(map);

// učitaj turizam
fetch("data/turizam.geojson")
  .then(res => res.json())
  .then(data => turizamLayer.addData(data));

// ---------------- FILTERI ----------------

document.querySelectorAll('.filters input').forEach(el => {
  el.addEventListener('change', filterMap);
});

function filterMap() {

  let tipovi = [...document.querySelectorAll('input[value]:checked')].map(i => i.value);

  stazeLayer.eachLayer(layer => {
    let tip = layer.feature.properties.tip;

    if (tipovi.some(t => tip.includes(t))) {
      layer.addTo(map);
    } else {
      map.removeLayer(layer);
    }
  });

  // toggle lokacije
  if (document.getElementById("lokacijeToggle").checked) {
    map.addLayer(lokacijeLayer);
  } else {
    map.removeLayer(lokacijeLayer);
  }

  // toggle turizam
  if (document.getElementById("turizamToggle").checked) {
    map.addLayer(turizamLayer);
  } else {
    map.removeLayer(turizamLayer);
  }
}