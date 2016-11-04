$(document).ready(function() {
	mapboxgl.accessToken = 'pk.eyJ1IjoieWFuY3lzaG1hbmN5IiwiYSI6ImNpdW8yZnNpazAwNTgzb251cGxwdDFhbTcifQ.TuwAZkiKbJOk94JY0v_eQw';
	
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v9',
		center: [-84.39, 33.75],
		zoom: 10,
	});
	
	var overlay = document.getElementById('map-overlay');
	
	var popup = new mapboxgl.Popup({
		closeButton: false
	});
	
	map.on('load', function() {
		
		map.addSource('counties', {
			"type": "vector",
			"url": "mapbox://mapbox.82pkq93d"
		});
		
		map.addLayer({
			"id": "counties",
			"type": "fill",
			"source": "counties",
			"source-layer": "original",
			"paint": {
				"fill-outline-color": "rgba(0,0,0,0.1)",
				"fill-color": "rgba(0,0,0,0.1)"
			}
		}, 'place-city-sm');
		
		map.addLayer({
			"id": "counties-highlighted",
			"type": "fill",
			"source": "counties",
			"source-layer": "original",
			"paint": {
				"fill-outline-color": "#484896",
				"fill-color": "#6e599f",
				"fill-opacity": 0.75
			},
			"filter": ["in", "COUNTY", ""]
		}, 'place-city-sm');
		
		map.on('mousemove', function(e) {
			var features = map.queryRenderedFeatures(e.point, {
				layers: ['counties']
			});

			// Change the cursor style as a UI indicator.
			map.getCanvas().style.cursor = features.length ? 'pointer' : '';

			// Remove things if no feature was found.
			if (!features.length) {
				popup.remove();
				map.setFilter('counties-highlighted', ['in', 'COUNTY', '']);
				overlay.style.display = 'none';
				return;
			}

			// Single out the first found feature on mouseove.
			var feature = features[0];

			// Query the counties layer visible in the map. Use the filter
			// param to only collect results that share the same county name.
			var relatedFeatures = map.querySourceFeatures('counties', {
				sourceLayer: 'original',
				filter: ['in', 'COUNTY', feature.properties.COUNTY]
			});

			// Render found features in an overlay.
			overlay.innerHTML = '';

			// Total the population of all features
			var populationSum = relatedFeatures.reduce(function(memo, feature) {
				return memo + feature.properties.population;
			}, 0);

			var title = document.createElement('strong');
			title.textContent = feature.properties.COUNTY + ' (' + relatedFeatures.length + ' found)';

			var population = document.createElement('div');
			population.textContent = 'Total population: ' + populationSum.toLocaleString();

			overlay.appendChild(title);
			overlay.appendChild(population);
			overlay.style.display = 'block';

			// Add features that share the same county name to the highlighted layer.
			map.setFilter('counties-highlighted', ['in', 'COUNTY', feature.properties.COUNTY]);

			// Display a popup with the name of the county
			popup.setLngLat(e.lngLat)
				.setText(feature.properties.COUNTY)
				.addTo(map);
		});
	})
})

