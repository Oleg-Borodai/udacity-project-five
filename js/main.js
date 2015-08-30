var hamburg = {
    lat: 53.555,
    lng: 9.929
};

var Loc = function(data) {
    this.name = ko.observable(data.name);
    this.marker = ko.observable(data.marker);
    this.description = ko.observable(data.description);
};

var ViewModel = function() {
    var self = this;

    this.map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 15,
        center: hamburg
    });
    this.service = new google.maps.places.PlacesService(this.map);

    this.locationList = ko.observableArray([]);

    this.addLocationCallback = function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                /* marker is an object with additional data about the pin for
                a single location */
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: results[i].geometry.location,
                    title: results[i].name
                });

                marker.myInfoWindow = new google.maps.InfoWindow({
                    content: results[i].name
                });

                (function(markerParam) {
                    google.maps.event.addListener(markerParam, 'click', function() {
                        self.closeInfoWindows();
                        markerParam.myInfoWindow.open(self.map, markerParam);
                        markerParam.setAnimation(google.maps.Animation.BOUNCE);
                        window.setTimeout(function() {
                            markerParam.setAnimation(null)
                        }, 2000);
                    });
                })(marker);


                self.locationList.push(new Loc({
                    name: results[i].name,
                    marker: marker,
                    description: results[i].vicinity,
                }));
            }
        }
    };

    self.service.textSearch({
        location: hamburg,
        radius: '1000',
        query: 'restaraunts'
    }, self.addLocationCallback);

    this.currentLocation = ko.observable(this.locationList()[0]);

    this.setCurrentLocation = function() {
        self.closeInfoWindows();
        var myMarker = this.marker();
        myMarker.myInfoWindow.open(self.map, myMarker);
        myMarker.setAnimation(google.maps.Animation.BOUNCE);
        self.map.setCenter(myMarker.getPosition());
        self.currentLocation(this);
        window.setTimeout(function() {
            myMarker.setAnimation(null)
        }, 2000);
    };

    this.closeInfoWindows = function() {
        for(var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker().myInfoWindow.close();
        }
    };

    this.clearLocations = function() {
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker().setMap(null);
        }
        self.locationList.removeAll();
    };

    this.addLocation = function(formElement) {
        self.clearLocations();
        self.service.textSearch({
            location: hamburg,
            radius: '1000',
            query: formElement.searchText.value
        }, self.addLocationCallback);
    };

};

ko.applyBindings(new ViewModel());

// /*
// Start here! initializeMap() is called when page is loaded.
// */
// function initializeMap() {

//     var locations;

//     var mapOptions = {
//         disableDefaultUI: false
//     };

//     // This next line makes `map` a new Google Map JavaScript Object and attaches it to
//     // <div id="map">, which is appended as part of an exercise late in the course.
//     map = new google.maps.Map(document.querySelector('#map'), mapOptions);


//     /*
//     locationFinder() returns an array of every location string from the JSONs
//     written for bio, education, and work.
//     */
//     function locationFinder() {

//         // initializes an empty array
//         var locations = [];

//         // adds the single location property from bio to the locations array
//         locations.push('Hamburg, Altona');

//         return locations;
//     }

//     /*
//     createMapMarker(placeData) reads Google Places search results to create map pins.
//     placeData is the object returned from search results containing information
//     about a single location.
//     */
//     function createMapMarker(placeData) {

//         // The next lines save location data from the search result object to local variables
//         var lat = placeData.geometry.location.lat(); // latitude from the place service
//         var lon = placeData.geometry.location.lng(); // longitude from the place service
//         var name = placeData.formatted_address; // name of the place from the place service
//         var bounds = window.mapBounds; // current boundaries of the map window

//         // marker is an object with additional data about the pin for a single location
//         var marker = new google.maps.Marker({
//             map: map,
//             position: placeData.geometry.location,
//             title: name
//         });

//         // infoWindows are the little helper windows that open when you click
//         // or hover over a pin on a map. They usually contain more information
//         // about a location.
//         var infoWindow = new google.maps.InfoWindow({
//             content: name
//         });

//         // hmmmm, I wonder what this is about...
//         google.maps.event.addListener(marker, 'click', function() {
//             infoWindow.open(map, marker);
//         });

//         // this is where the pin actually gets added to the map.
//         // bounds.extend() takes in a map location object
//         bounds.extend(new google.maps.LatLng(lat, lon));
//         // fit the map to the new marker
//         map.fitBounds(bounds);
//         // center the map
//         map.setCenter(bounds.getCenter());
//     }

//     /*
//     callback(results, status) makes sure the search returned results for a location.
//     If so, it creates a new map marker for that location.
//     */
//     function callback(results, status) {
//         if (status == google.maps.places.PlacesServiceStatus.OK) {
//             createMapMarker(results[0]);
//         }
//     }

//     /*
//     pinPoster(locations) takes in the array of locations created by locationFinder()
//     and fires off Google place searches for each location
//     */
//     function pinPoster(locations) {

//         // creates a Google place search service object. PlacesService does the work of
//         // actually searching for location data.
//         var service = new google.maps.places.PlacesService(map);

//         // Iterates through the array of locations, creates a search object for each location
//         for (var place in locations) {

//             // the search request object
//             var request = {
//                 query: locations[place]
//             };

//             // Actually searches the Google Maps API for location data and runs the callback
//             // function with the search results after each search.
//             service.textSearch(request, callback);
//         }
//     }

//     // Sets the boundaries of the map based on pin locations
//     window.mapBounds = new google.maps.LatLngBounds();

//     // locations is an array of location strings returned from locationFinder()
//     locations = locationFinder();

//     // pinPoster(locations) creates pins on the map for each location in
//     // the locations array
//     pinPoster(locations);

// }

// Calls the initializeMap() function when the page loads
//window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
// window.addEventListener('resize', function(e) {
//   // Make sure the map bounds get updated on page resize
//   map.fitBounds(mapBounds);
// });
