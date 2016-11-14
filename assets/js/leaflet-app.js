$(document).ready(function() {
    var allFields = [],
        mode = 'overall',
        modeButtons = $('#map-overlay .one-fourth').toArray(),
        overallScores = [];
    
    $.ajax({
        url: 'http://localhost:8888/map-test/zip_code?query=all',
        method: 'GET',
        dataType: 'json',
        success: function(d) {
            console.log(d);
            for(var i=0; i < d.length; i++) {
                allFields[i] = d[i];
            }
//            console.log(allFields);
            leafletMap();
        },
        complete: function() {
            $('#loader').fadeOut('slow', function() {
                $(this).hide();
            });
            
//            console.log(allFields);
        }
    });
    
    $(document).on('update-buttons', function(event, properties) {
        props = properties.properties;
        overallScores = [];
        $.each(props, function(key, value) {
            overallScores.push(value);
        });
        for(var i=0; i < modeButtons.length; i++) {
            $(modeButtons[i]).children('.score').html(overallScores[i]);
        }
    });
    
    
    
    
    function leafletMap() {
        $('#map').innerHTML = "";
        
        var mapboxAccessToken = 'pk.eyJ1IjoieWFuY3lzaG1hbmN5IiwiYSI6ImNpdW8yZnNpazAwNTgzb251cGxwdDFhbTcifQ.TuwAZkiKbJOk94JY0v_eQw';
        var map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([33.761354, -84.380788], 9);
        
        
        // ajax call to all on load
        // when button is pressed to filter, filter data

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapboxAccessToken, {
            id: 'mapbox.streets-basic',
            attribution: '...'
        }).addTo(map);

        function getColor(d) {
            return d == 1 ? '#D53F3A' :
                   d == 2 ? '#F7B77C' :
                   d == 3 ? '#FFE59C' :
                   d == 4 ? '#ABD185' :
                   d == 5 ? '#019B5C' :
                            'Transparent';
        };

        function getBorderColor(d) {
            return d === true ? 'rgba(0,0,0,0.5)' :
                               'transparent';
        }


        function style(feature) {
            var scoreColor;
            var borderColor = false;

            $.each(allFields, function(zip, zipValues) {
                if (zipValues.zip_code == feature.properties.ZIP) {
                    if (mode == 'overall') {
                        scoreColor = zipValues.score_colors.overall_score_color;
                    } else if (mode == 'child') {
                        scoreColor = zipValues.score_colors.child_score_color;
                    } else if (mode == 'family') {
                        scoreColor = zipValues.score_colors.family_score_color;
                    } else if (mode == 'community') {
                        scoreColor = zipValues.score_colors.community_score_color;
                    }
                    
                    borderColor = true;
                }
            });

            return {
                fillColor: getColor(scoreColor),
                weight: 1,
                opacity: 1,
                color: getBorderColor(borderColor),
                dashArray: '0',
                fillOpacity: 1
            };
        }

        var geojson;

    //    L.geoJson(zipData, {style: style}).addTo(map);

        // Hover State Logic

        function highlightFeature(e) {
            var layer = e.target;
            
            $.each(allFields, function(zip, zipValues) {
                if (zipValues.zip_code == layer.feature.properties.ZIP) {
                    layer.setStyle({
                        weight: 2,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });

                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
                    $(document).trigger('update-buttons', {properties: zipValues.overall_scores});
                    info.update(layer.feature.properties);
                } else {
                    return;
                }
            });
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);

            info.update();
        }

        function zoomToFeature(e) {
            var layer = e.target;
            var layerData; 

            $.each(allFields, function(zip, zipValues) {
                if (zipValues.zip_code == layer.feature.properties.ZIP) {
                    layerData = zipValues;
                    map.fitBounds(layer.getBounds());
                    $(document).trigger('info-window', {props: layerData});
                } else {
                    return;
                }
            });
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
            
            // this._div.innerHTML = (props ? '<h1>'+props.ZIP+' Statistics</h1>' : 'Hover over a state');
//            modeButtons.forEach(function(button) {
//                button.child().hasClass('one-fourth').
//            })
        };

        info.addTo(map);

        // Show Legend

//        var legend = L.control();
//
//        legend.onAdd = function(map) {
//            var div = L.DomUtil.create('div', 'info legend'),
//                grades = [1, 2, 3, 4, 5],
//                labels = [];
//            
//            
//            div.innerHTML += '<div class="legend-container"><h2>Levels of Child Well-Being</h2><span style="float:left; width: 33.3%;">Low</span><span style="float:left; text-align: center; width: 33.3%;">Average</span><span style="float:left; width: 33.3%; text-align: right;">High</span>';
//            
//            div.innerHTML += '<br>';
//
//            for (var i = 0; i < grades.length; i++) {
//                div.innerHTML += 
//                    '<i style="background:' + getColor(grades[i]) + '; float:left"></i> ';
//            }
//            
//            div.innerHTML +='</div>';
//
//            return div;
//        }
//
//        legend.addTo(map);
        var searchControl = new L.Control.Search({
            layer: geojson,
            propertyName: 'ZIP',
            circleLocation: true,
            moveToLocation: function(latlng, title, map) {
                var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                map.setView(latlng, zoom);
            }
        });
        
        searchControl.on('search:locationfound', function(e) {
            e.layer.setStyle({ 
                weight: 4,
                fillOpacity: 0.7,
                color: '#666'
            })
        }).on('search:collapsed', function(e) {
            geojson.eachLayer(function(layer) {
                geojson.resetStyle(layer);
                
            });
            map.setView([33.761354, -84.380788], 9);
        });
        
        map.addControl(searchControl);
        
        
        $(document).on('reset-view', function(event) {
            map.setView([33.761354, -84.380788], 9);
        });
        
        $(document).on('redraw-tiles', function(event) {
            map.removeLayer(geojson);
            geojson = L.geoJson(zipData, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        });
        
    };
    
    $('.one-fourth').on('click', function() {
        var target = $(this).attr('data-target');

        mode = target;
        $(document).trigger('redraw-tiles');
    });


    $(document).on('info-window', function(event, properties) {
        var $infoDiv = $('div#info-window');
        var count = 0;
        console.log(properties);
        if ($infoDiv.hasClass('active')) {
            $infoDiv.removeClass('active');
        }
        var data = properties.props,
            childData = data.child_fields,
            familyData = data.family_fields,
            communityData = data.community_fields,
            overallData = data.overall_scores,
            popData = data.population_details,
            regionalData = data.regional_data;

        $infoDiv.addClass('active');
        
        $('#info-window .big-zip').html(data.zip_code);
        $('#info-window .overall-score').html(overallData.overall_cwb_score);
        $('#info-window .score-ratio').html('Score ' + overallData.overall_cwb_score + ' / 100');
        $('#info-window .child-score').html(overallData.overall_child_score);
        $('#info-window .family-score').html(overallData.overall_family_score);
        $('#info-window .community-score').html(overallData.overall_community_score);
        $('#info-window .total-numbers .population').html('Population: ' + popData.total_population);
        $('#info-window .total-numbers .total-children').html('Children: ' + popData.total_children);
        $('#info-window .total-numbers .total-families').html('Families: ' + popData.total_families);

        var $childTable = $('#childTable'),
            $childDataFields = $('#childTable td.data'),
            $childTableHeader = $('#childTable .zip-code-header');

        $childTableHeader.html(data.zip_code);

        $.each(childData, function(property, value) {
            count++;
            console.log($.type(value));

            if ($.type(value) == 'object') {
                $.each(value, function(subProperty, subValue) {
                    // $childTable.append('<tr><td>' + property + subProperty + '</td><td>' + subValue + '</td><td>'+regionalData+'</td></tr>')
                    $$childDataFields[count - 1].innerHTML = "";
                    $childDataFields[count - 1].append(subValue);
                });
            } else {
                // $childTable.append('<tr><td>' + property + '</td><td>' + value + '</td></tr>');
                $childDataFields[count - 1].innerHTML = "";
                $childDataFields[count - 1].append(value);
            }
        });

        count = 0;
        var $familyTable = $('#familyTable'),
            $familyTableFields = $('#familyTable td.data'),
            $familyTableHeader = $('#familyTable .zip-code-header');

        $familyTableHeader.html(data.zip_code);

        $.each(familyData, function(property, value) {
            count++;

            if ($.type(value) == 'object') {
                $.each(value, function(subProperty, subValue) {
                    $familyTableFields[count - 1].innerHTML = "";
                    $familyTableFields[count - 1].append(subValue);
                });
            } else {
                $familyTableFields[count - 1].innerHTML = "";
                $familyTableFields[count - 1].append(value);
            }
        });
        count = 0;


        var $communityTable = $('#communityTable'),
            $communityTableFields = $('#communityTable td.data'),
            $communityTableHeader = $('#communityTable .zip-code-header');

        $communityTableHeader.html(data.zip_code);
        $.each(communityData, function(property, value) {

            count++;

            if ($.type(value) == 'object') {
                $.each(value, function(subProperty, subValue) {
                    $communityTableFields[count - 1].innerHTML = "";
                    $communityTableFields[count - 1].append(subValue);
                });
            } else {
                $communityTableFields[count - 1].innerHTML = "";
                $communityTableFields[count - 1].append(value);
            }
        });
        count = 0;

//        var $closeButton = $('<div class="close-btn"><span></span><span></span><span></span><span></span></div>');
        
        var $closeButton = $('<div class="close-btn">X</div>')
        $closeButton.on('click', function() {
            $infoDiv.removeClass('active');
            $(document).trigger('reset-view');
        });
        $infoDiv.append($closeButton);

    });
})




