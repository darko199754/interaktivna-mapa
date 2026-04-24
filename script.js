// ---------------- MAPA ----------------

var map = L.map('map').setView([43.285, 20.879], 13);

// Light mapa (lepša)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap',
  opacity: 0.9
}).addTo(map);


// ---------------- STAZE ----------------

var stazeLayer = L.geoJSON(null, {
  style: function(feature) {
    let boja = "blue";

    if (feature.properties.tezina === "laka") boja = "green";
    if (feature.properties.tezina === "srednja") boja = "orange";
    if (feature.properties.tezina === "teska") boja = "red";

    return { color: boja, weight: 4, opacity: 0.9 };
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.naziv}</h3>
      ${p.opis_SRB || ""}
      <br><b>Dužina:</b> ${p.duzina_km} km
      <br><b>Trajanje:</b> ${p.trajanje}
      <br><b>Visinska razlika:</b> ${p.visinska_r} m
    `);

    layer.on('mouseover', function () {
      layer.setStyle({ weight: 6 });
    });

    layer.on('mouseout', function () {
      stazeLayer.resetStyle(layer);
    });
  }
}).addTo(map);

fetch("data/staze.geojson")
  .then(res => res.json())
  .then(data => stazeLayer.addData(data));


// ---------------- LOKACIJE ----------------

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {
    return L.marker(latlng);
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.Naziv}</h3>
      ${p.Slika ? `<img src="${p.Slika}">` : ""}
      <p>${p.Opis_SRB || ""}</p>
      ${p.audio_SRB ? `<audio controls src="${p.audio_SRB}"></audio>` : ""}
    `);
  }

}).addTo(map);

fetch("data/lokacije.geojson")
  .then(res => res.json())
  .then(data => lokacijeLayer.addData(data));


// ---------------- TURIZAM ----------------

var turizamLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {
    return L.marker(latlng);
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <h3>${p.naziv}</h3>
      ${p.slika ? `<img src="${p.slika}">` : ""}
      <p>${p.opis_srb || ""}</p>
      📞 ${p.telefon || ""}
      <br>
      ${p.website ? `<a href="${p.website}" target="_blank">🌐 Website</a>` : ""}
    `);
  }

}).addTo(map);

fetch("data/turizam.geojson")
  .then(res => res.json())
  .then(data => turizamLayer.addData(data));


// ---------------- FILTER ----------------

document.querySelectorAll('.filters input').forEach(el => {
  el.addEventListener('change', filterMap);
});

function filterMap() {

  let selected = [...document.querySelectorAll('.filters input[value]:checked')].map(i => i.value);

  stazeLayer.eachLayer(layer => {

    let tip = layer.feature.properties.tip;
    let tezina = layer.feature.properties.tezina;

    let tipMatch = selected.some(v => tip.includes(v));
    let tezinaMatch = selected.includes(tezina);

    if (tipMatch && tezinaMatch) {
      layer.addTo(map);
    } else {
      map.removeLayer(layer);
    }
  });

  if (document.getElementById("lokacijeToggle").checked) {
    map.addLayer(lokacijeLayer);
  } else {
    map.removeLayer(lokacijeLayer);
  }

  if (document.getElementById("turizamToggle").checked) {
    map.addLayer(turizamLayer);
  } else {
    map.removeLayer(turizamLayer);
  }
}


// ---------------- FILTER PANEL TOGGLE ----------------

const btn = document.getElementById("filterBtn");
const panel = document.getElementById("filterPanel");

btn.addEventListener("click", () => {
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

// klik na mapu zatvara panel
map.on('click', function() {
  panel.style.display = "none";
});
