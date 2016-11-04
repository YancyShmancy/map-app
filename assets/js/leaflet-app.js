(function leafletMap() {
    
    
    var mapboxAccessToken = 'pk.eyJ1IjoieWFuY3lzaG1hbmN5IiwiYSI6ImNpdW8yZnNpazAwNTgzb251cGxwdDFhbTcifQ.TuwAZkiKbJOk94JY0v_eQw';
    var map = L.map('map').setView([33.761354, -84.380788], 9);
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapboxAccessToken, {
        id: 'mapbox.dark',
        attribution: '...'
    }).addTo(map);
    
    function getColor(d) {
        return d == 1 ? 'red' :
               d == 2 ? 'Orange' :
               d == 3 ? 'Yellow' :
               d == 4 ? 'Green' :
               d == 5 ? 'Dark Green' :
                        'Transparent';
    };
    
    function getBorderColor(d) {
        return d == true ? 'white' :
                           'Transparent';
    }
        
    
    function style(feature) {
        var scoreColor;
        var borderColor;
        
        $.each(data, function(zip, zipValue) {
            if (zip == feature.properties.ZIP) {
                console.log(zipValue[0]["Overall Score Color"]);
                scoreColor = zipValue[0]["Overall Score Color"];
                borderColor = true;
            } else {
                borderColor = false;
            }
        });
        
        return {
            fillColor: getColor(scoreColor),
            weight: 2,
            opacity: 1,
            color: getBorderColor(borderColor),
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    
    L.geoJson(zipData, {style: style}).addTo(map);
    
    function highlightFeature(e) {
        var layer = e.target;
        
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
    
    
    
})()

