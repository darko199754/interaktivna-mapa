// ---------------- MAPA ----------------

var map = L.map('map').setView([43.285, 20.879], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap',
}).addTo(map);


// ---------------- STAZE ----------------

var stazeLayer = L.geoJSON(null, {
  style: function(feature) {
    let boja = "blue";

    if (feature.properties.tezina === "laka") boja = "green";
    if (feature.properties.tezina === "srednja") boja = "orange";
    if (feature.properties.tezina === "teska") boja = "red";

    return { color: boja, weight: 4 };
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
  }
}).addTo(map);

fetch("data/staze.geojson")
  .then(res => res.json())
  .then(data => stazeLayer.addData(data));


// ---------------- LOKACIJE (SVG AUTOMATSKI) ----------------

const iconsMap = {
  "vodopad": "icons/vodopad.svg",
  "vidikovac": "icons/vidikovac.svg",
  "crkva": "icons/crkva.svg",
  "verski objekat": "icons/religija.svg",
  "spomenik": "icons/spomenik.svg",
  "izvor": "icons/izvor.svg",
  "jezero": "icons/jezero.svg",
  "rudnik": "icons/rudnik.svg",
  "pećina": "icons/pecina.svg",
  "gejzir": "icons/gejzir.svg",
  "arheološko nalazište": "icons/arheologija.svg",
  "ski staza": "icons/ski.svg",
  "gondola": "icons/gondola.svg",
  "default": "icons/spomenik.svg"
};

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {

    let podkat = (feature.properties.Podkategor || "").toLowerCase();

    let iconPath = iconsMap[podkat] || iconsMap["default"];

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

  let tipovi = [...document.querySelectorAll('.tip:checked')].map(i => i.value);
  let tezine = [...document.querySelectorAll('.tezina:checked')].map(i => i.value);

  stazeLayer.eachLayer(layer => {

    let tip = layer.feature.properties.tip || "";
    let tezina = layer.feature.properties.tezina || "";

    let tipMatch = tipovi.length === 0 || tipovi.some(t => tip.includes(t));
    let tezinaMatch = tezine.length === 0 || tezine.includes(tezina);

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


// ---------------- PANEL ----------------

const btn = document.getElementById("filterBtn");
const panel = document.getElementById("filterPanel");

btn.addEventListener("click", () => {
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});

map.on('click', function() {
  panel.style.display = "none";
});
