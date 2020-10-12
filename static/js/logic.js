// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    var earthquakeData = data.features; 

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function(feature, latLng) {
            return L.circle(latLng, {
                radius: feature.properties.mag * 40000, //magnitude
                fillColor: chooseColor(feature.geometry.coordinates[2]), //depth
                fillOpacity: 0.75,
                weight: 0.75,
                color: "black"
            })
        },
        
        // Give each feature a popup describing the place and time of the earthquake
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p><strong>Time: </strong>" + new Date(feature.properties.time) + "</p>" + 
                "<p><strong>Magnitude: </strong>" + feature.properties.mag + "</p>" + 
                "<p><strong>Depth: </strong>" + feature.geometry.coordinates[2] + " km</p>")
        }
    });
    // Send our earthquakes layer to the createMap function
    createMap(earthquakes);
});

// Determine the color of circle based on the earthquake's depth
function chooseColor(depth) {
  if (depth <= 10) {
      return "#AAFC2C";
  } else if (depth <= 30) {
      return "#82AD2A";
  } else if (depth <= 50) {
      return "#FFFF00";
  } else if (depth <= 70) {
      return "#FFD700";
  } else if (depth <= 90) {
      return "#FFA500";
  } else {
      return "#FF0000";
  };
}

function createMap(earthquakes) {
  // Define satellite, grayscale, outdoors layers
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    // Create the tile layer that will be the background of our map
    var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Create a new layer for tectonicPlates
    var tectonicPlates = new L.LayerGroup();

    // Add tectonic plates data from url to tectonicPlates layer
    d3.json(tectonicPlatesUrl, function(data) {
      L.geoJson(data, {
        color: "orange",
        weight: 2
      }).addTo(tectonicPlates);
    });

  // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Map": satelliteMap,
        "Grayscale Map": grayscaleMap,
        "Outdoors Map": outdoorsMap
    };

  // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

  // Create our map, giving it satelliteMap, earthquakes, and tectonicPlates layers to display on load
    var myMap = L.map("map", {
        center: [42.713956, -89.070507],
        zoom: 3.5,
        layers: [satelliteMap, earthquakes, tectonicPlates]
    });

  // Create a layer control, pass in our baseMaps and overlayMaps, and add to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  // Create a legend to display information about our map
  var info = L.control({
      position: "bottomright"
  });
  
  // When the layer control is added, insert a div with the class of "legend"
  info.onAdd = function() {
      var div = L.DomUtil.create("div", "legend");
      var depth = [-10, 10, 30, 50, 70, 90];
      var attach;
      var legendInfo = "<h2>Depth (km)</h2>"; //add title to legend
      div.innerHTML = legendInfo;
      // Set up legend with values 
      for (var i = 0; i < depth.length; i++) {
        if (depth[i + 1]) {
          attach = '–' + depth[i + 1] + '<br>';
        }
        else { 
          attach = '+ ';
        }
        // 
        div.innerHTML +=
          '<i style="background:' + chooseColor(depth[i] + 1) + '"></i>' +
          depth[i] + attach;
      }
      return div;
  };
  // Add the info legend to the map
  info.addTo(myMap);
}

