# Esri-Meetup
A Meetup.com Esri Map

The app demonstrates how to create a map using the ArcGIS JavaScript API and the meetup API.

It uses HTML5 geolocation or address searching (geocoding) to find the users location, and then sends this off in a GET request
to the [open events API](http://www.meetup.com/meetup_api/docs/2/open_events/) mapping these results on to the map. It uses the 
PHP Proxy to allow for routing from the users position. 
