    var map;

    require([

    "esri/map",
    "esri/InfoTemplate",
    "esri/geometry/webMercatorUtils",
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Point",
    "esri/dijit/Search",
    "esri/tasks/RouteTask",            
    "esri/tasks/RouteParameters",
    "esri/tasks/FeatureSet",   
    "esri/Color",
    "esri/urlUtils",
    "dojo/domReady!"

    ], function (Map, infoTemplate, webMercatorUtils, GraphicsLayer, Graphic, PictureMarkerSymbol, SimpleLineSymbol, Point, Search, RouteTask, RouteParameters, FeatureSet, Color, urlUtils) {
        
        
        
        urlUtils.addProxyRule({
            urlPrefix: "route.arcgis.com",  
            proxyUrl: "proxy/proxy.php"
        });
    
        map = new Map("map", {
            basemap: "dark-gray",
            center: [-1, 50.159], // lon, lat
            zoom: 7
        });

        var search = new Search({
            map: map,
            enableButtonMode: true,
        }, "search");
        search.startup();
        
        var userLocation;
        var routesLayer;
        
        function attemptGeolocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latitude =  position.coords.latitude;
                    var longitude = position.coords.longitude; 
                    userLocation = new Point(longitude, latitude);
                    if (map != undefined) {
                        var userGraphic = new Graphic(userLocation, new PictureMarkerSymbol("imgs/pin2.png", 36, 36));
                        map.graphics.add(userGraphic);
                        map.centerAndZoom(userLocation, 14);
                        requestMeetups(latitude, longitude);
                    }
                });
            } else {
                console.log("Geolocation not supported by this browser!");
            }
        }
        
        function requestMeetups(lat, lon) {
            var eventsUrl = "http://api.meetup.com/2/open_events.json?";
            var radius = "&radius=15"; //In miles
            var lat = "&lat=" + lat;
            var lon = "&lon=" +lon;
            var url = eventsUrl+radius+lat+lon;
            
          
            $.ajax({
                type: "GET",
                url: "ajax/key.php",
                data: {url: url},
                dataType: "json",
                error: function() { console.log("Error occured") },
                success: function(data) {
                    console.log(data);
                    var meetups = data.results;
                    for (var i = 0; i < meetups.length -1; i++) {
                        meetup = meetups[i];
                        if (meetup.venue) {
                           
                            var eventName = meetup.name;
                            var eventLon = meetup.venue.lon;
                            var eventLat = meetup.venue.lat;
                            var distance = meetup.distance;
                            var address = meetup.venue.address_1;
                            var eventUrl = meetup.event_url;
                            var groupName = meetup.group.name;
                 
                            var date = new Date(0); // The 0 there is the key, which sets the date to the epoch
                            date.setTime(meetup.time);
                            date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + (date.getYear() + 1900) + " at " + date.toLocaleTimeString();
                        
                            var content = "";
                            if (address) {
                                content += "<b>Address: </b>" + address + "<br>";
                            }
                            if (groupName) {
                                content += "<b>Group Name: </b>" + groupName + "<br>"; 
                            }
                            if (distance) {
                                content += "<b>Distance: </b> " + distance.toFixed(2) + " miles <br>";
                            }
                            if (date) {
                                content += "<b>Date: </b>" + date + "<br>";
                            }
                            if (eventUrl){
                                content += "<b><a href=" + eventUrl + ">Event Url </a></b><br>";
                            }
                            var meetupInfoTemplate = new infoTemplate("<b>"+eventName+"</b>", content);
                            var symbol = new PictureMarkerSymbol("imgs/logo-meetup.png", 25, 17);
                            var point = new Point(eventLon, eventLat);
                            var meetupGraphic = new Graphic(point, symbol, {}, meetupInfoTemplate);
                            //console.log(meetupGraphic);
                            map.graphics.add(meetupGraphic);
                        }
                    }
                }
            });
        }
    
        map.on("load", function() {
            attemptGeolocation();
            map.graphics.on("click", function(graphic) {
                getRoute(graphic, userLocation);
            });
        });
        
        
        function getRoute(graphic, userLocation) {
            var meetupGraphic = graphic.graphic;
            var userLocation = new Graphic(userLocation);
            if (userLocation && meetupGraphic) {
                routeTask = new RouteTask("http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World");
                routeParams = new RouteParameters();
                routeParams.stops = new FeatureSet();
                routeParams.outSpatialReference = { "wkid" : 102100 };
                console.log("meetupGraphic, userLocation", meetupGraphic, userLocation);
                routeParams.stops.features.push(meetupGraphic);
                routeParams.stops.features.push(userLocation);
                routeTask.solve(routeParams);
                routeTask.on("solve-complete", showRoute);
            }
        }
        
        function showRoute(evt) {
            //console.log(evt.result)
            if (routesLayer == undefined) {
                routesLayer = new GraphicsLayer();
                map.addLayer(routesLayer);
            }
            else {
                routesLayer.clear();
            }
            var routeSymbol = new SimpleLineSymbol().setColor(new Color([0, 0, 255, 0.5])).setWidth(5);
            routesLayer.add(evt.result.routeResults[0].route.setSymbol(routeSymbol));
        }
       
        
        search.on('select-result', function(e) {
            console.log ('selected result', e);
            var geom = webMercatorUtils.webMercatorToGeographic(new Point(e.result.feature.geometry.x, e.result.feature.geometry.y));
            console.log(geom);
            userLocation = new Point(geom.x, geom.y);
            requestMeetups(geom.y, geom.x);   
        });

        
        
        
        
    });

