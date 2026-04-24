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


// ---------------- LOKACIJE (IKONICE) ----------------

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {

    let iconPath = "icons/default.svg";

    // sigurnosni fallback
    if (feature.properties && feature.properties.Ikonica) {
      iconPath = feature.properties.Ikonica;
    }

    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: iconPath,
        iconSize: [32, 32]
      })
    });
  },

  onEachFeature: function(feature, layer) {
    let p = feature.properties;

    layer.bindPopup(`
      <b>${p.Naziv}</b><br>
      ${p.Slika ? `<img src="${p.Slika}">` : ""}
      <p>${p.Opis_SRB || ""}</p>
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
      <b>${p.naziv}</b><br>
      ${p.slika ? `<img src="${p.slika}">` : ""}
      <p>${p.opis_srb || ""}</p>
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

  let tipovi = [...document.querySelectorAll('.tip:checked')].map(i => i.value);
  let tezine = [...document.querySelectorAll('.tezina:checked')].map(i => i.value);

  stazeLayer.eachLayer(layer => {

    let tip = layer.feature.properties.tip;
    let tezina = layer.feature.properties.tezina;

    let tipMatch = tipovi.some(t => tip.includes(t));
    let tezinaMatch = tezine.includes(tezina);

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


// ---------------- FILTER PANEL ----------------

const btn = document.getElementById("filterBtn");
const panel = document.getElementById("filterPanel");

btn.addEventListener("click", () => {
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

map.on('click', function() {
  panel.style.display = "none";
});
