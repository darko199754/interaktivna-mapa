// ---------------- LOKACIJE ----------------

// mapa ikonica
const iconsMap = {
  vodopad: "icons/vodopad.png",
  crkva: "icons/crkva.png",
  vidikovac: "icons/vidikovac.png",
  spomenik: "icons/spomenik.png",
  priroda: "icons/priroda.png",
  default: "icons/default.png"
};

var lokacijeLayer = L.geoJSON(null, {

  pointToLayer: function(feature, latlng) {

    let kategorija = (feature.properties.Kategorija || "").toLowerCase();

    let iconPath = iconsMap[kategorija] || iconsMap["default"];

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
