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
