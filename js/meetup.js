    var map;

    require([

    "esri/map",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Point",
    "esri/dijit/Search",
    "dojo/domReady!"

    ], function (Map, Graphic, SimpleMarkerSymbol, Point, Search) {
        map = new Map("map", {
            basemap: "dark-gray",
            center: [-1, 50.159], // lon, lat
            zoom: 7
        });

         var s = new Search({
            map: map,
            enableButtonMode: true,
         }, "search");
         s.startup();


        var key = "";
        var eventsUrl = "https://api.meetup.com/2/open_events.json?";

        function attemptGeolocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var latitude =  position.coords.latitude;
                    var longitude = position.coords.longitude; 
                    var userLocation = new Point(longitude, latitude);
                    if (map != undefined) {
                        map.centerAndZoom(userLocation, 10);
                        requestMeetups(latitude, longitude);
                    }
                });
            } else {
                console.log("Geolocation not supported by this browser!");
            }
        }
        
        function requestMeetups(lat, lon) {
            var radius = "&radius=25"; //In miles
            var lat = "&lat=" + lat;
            var lon = "&lon=" +lon;
            var url = eventsUrl+radius+lat+lon+key
            
          
            $.ajax({
                
                type: "GET",
                url: url,
                dataType: "jsonp",
                success: function(data) {
                    var meetups = data.results;
                    console.log(data);
                    for (var i = 0; i < meetups.length; i++) {
                        meetup = meetups[i];
                        var eventName = meetup.name;
                        var eventLon = meetup.venue.lon;
                        var eventLat = meetup.venue.lat;
                        var distance = meetup.distance;
                        var address = meetup.venue.address;
                        var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10);
                        var point = new Point(eventLon, eventLat);
                        var meetupGraphic = new Graphic(point, symbol);
                        console.log(meetupGraphic);
                        map.graphics.add(meetupGraphic);
                    }
                }
                
            });
        }
        
        attemptGeolocation();

        
        
    });