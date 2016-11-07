(function leafletMap() {
    
    var count = 0;
    var mapboxAccessToken = 'pk.eyJ1IjoieWFuY3lzaG1hbmN5IiwiYSI6ImNpdW8yZnNpazAwNTgzb251cGxwdDFhbTcifQ.TuwAZkiKbJOk94JY0v_eQw';
    var map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([33.761354, -84.380788], 9);
    
    $(document).on('scroll', function(e) {
        e.preventDefault();
    })
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapboxAccessToken, {
        id: 'mapbox.light',
        attribution: '...'
    }).addTo(map);
    
    function getColor(d) {
        return d == 1 ? 'red' :
               d == 2 ? 'Orange' :
               d == 3 ? 'Yellow' :
               d == 4 ? '#228B22' :
               d == 5 ? '#004400' :
                        'Transparent';
    };
    
    function getBorderColor(d) {
        return d === true ? 'rgba(0,0,0,0.5)' :
                           'transparent';
    }
        
    
    function style(feature) {
        var scoreColor;
        var borderColor = false;
        
        
        $.each(data, function(zip, zipValue) {
            
            if (zip == feature.properties.ZIP) {
                count++;
//                console.log(count, zip);
                scoreColor = zipValue[0]["Overall Score Color"];
                borderColor = true;
            }
        });
        
        return {
            fillColor: getColor(scoreColor),
            weight: 1,
            opacity: 1,
            color: getBorderColor(borderColor),
            dashArray: '0',
            fillOpacity: 0.8
        };
    }
    
    var geojson;
    
//    L.geoJson(zipData, {style: style}).addTo(map);
    
    // Hover State Logic
    
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
        
        info.update(layer.feature.properties);
    }
    
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        
        info.update();
    }
    
    function zoomToFeature(e) {
        var layer = e.target;
        
        map.fitBounds(e.target.getBounds());
        
        var layerData; 
        
        $.each(data, function(zip, zipValue) {
            if (zip == layer.feature.properties.ZIP) {
                zipValue[0].zipCode = zip;
                layerData = zipValue[0];
            }
        });
        
        $(document).trigger('info-window', {props: layerData});
    }
    
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
    
    // Render Map
    
    geojson = L.geoJson(zipData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    
    // Custom Info Control
    
    var info = L.control();
    
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with class "info"
        this.update();
        return this._div;
    }
    
    info.update = function(props) {
        this._div.innerHTML = (props ? '<h1>'+props.ZIP+' Statistics</h1>' : 'Hover over a state');
    };
    
    info.addTo(map);
    
    // Show Legend
    
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 2, 3, 4, 5],
            labels = [];
        
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += 
                '<i style="background:' + getColor(grades[i]) + '"></i> ' + 
                grades[i] + '<br>';
        }
        
        return div;
    }
    
    legend.addTo(map);
    
    
    
    $(document).on('info-window', function(event, properties) {
        var $infoDiv = $('div#info-window');
        
        if ($infoDiv.hasClass('active')) {
            $infoDiv.removeClass('active');
        }
        var properties = properties.props;
        
        $infoDiv.addClass('active');
        $infoDiv.html('<div>'+properties.zipCode+'</div>');
        
        var $closeButton = $('<span class="close"><i class="fa fa-times"></i></span>');
        $closeButton.on('click', function() {
            $infoDiv.removeClass('active');
            map.setView([33.761354, -84.380788], 9);
            
        })
        $infoDiv.append($closeButton);
        
    })
})()

