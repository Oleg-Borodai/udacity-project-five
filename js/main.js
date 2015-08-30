var hamburg = {
    lat: 53.555,
    lng: 9.929
};

var Loc = function (data) {
    this.name = ko.observable(data.name);
    this.marker = ko.observable(data.marker);
    this.description = ko.observable(data.description);
};

var ViewModel = function () {
    var self = this;

    this.map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 15,
        center: hamburg
    });
    this.service = new google.maps.places.PlacesService(this.map);

    this.locationList = ko.observableArray([]);

    this.addLocationCallback = function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                /* marker is an object with additional data about the pin for
                a single location */
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: results[i].geometry.location,
                    title: results[i].name
                });

                var popUpContent = self.getFsqReviews(results[i].name, marker);


                (function (markerParam) {
                    google.maps.event.addListener(markerParam, 'click', function () {
                        self.closeInfoWindows();
                        markerParam.myInfoWindow.open(self.map, markerParam);
                        markerParam.setAnimation(google.maps.Animation.BOUNCE);
                        window.setTimeout(function () {
                            markerParam.setAnimation(null)
                        }, 2000);
                    });
                })(marker);


                self.locationList.push(new Loc({
                    name: results[i].name,
                    marker: marker,
                    description: results[i].formatted_address
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

    this.getFsqReviews = function (locationName, marker) {
        var venueRequestUrl = 'https://api.foursquare.com/v2/venues/search?ll=53.55,9.93&client_id=QZHN3TDUICZBINB31CE3SZP3PYUZC5BLRYHZEFVYL0I51AU3&client_secret=U2IBTFX4XYW0TKFJI35U0JURW2YUVOWO1FX0COBHTTT3QK0Z&v=20150830&inten=match&limit=1&query=' + locationName;
        var tipRequestStartUrl = 'https://api.foursquare.com/v2/venues/';
        var tipRequestEndUrl = '/tips?client_id=QZHN3TDUICZBINB31CE3SZP3PYUZC5BLRYHZEFVYL0I51AU3&client_secret=U2IBTFX4XYW0TKFJI35U0JURW2YUVOWO1FX0COBHTTT3QK0Z&v=20150830&sort=popular&limit=2';
        var result = [];
        var html = '<h4>' + locationName + '</h4>';
        marker.myInfoWindow = new google.maps.InfoWindow({
                            content: html
                        });
        $.getJSON(venueRequestUrl, function (data) {
            if (data.meta.code == 200 && data.response.venues.length > 0) {
                var venueId = data.response.venues[0].id;
                var tipRequestUrl = tipRequestStartUrl + venueId + tipRequestEndUrl;
                $.getJSON(tipRequestUrl, function (data) {
                    if (data.meta.code == 200) {
                        var tips = data.response.tips.items;
                        for (var i = 0; i < tips.length; i++) {
                            result.push({
                                text: tips[i].text,
                                user: tips[i].user.firstName + ' ' + tips[i].user.lastName
                            });
                        }
                        for (var i = 0; i < result.length; i++) {
                            html += '<p><strong>' + result[i].user + ':</strong>';
                            html += result[i].text + '</p>';
                        }
                        marker.myInfoWindow = new google.maps.InfoWindow({
                            content: html
                        });
                    }
                }).error(function (e) {
                    alert('Ooops, something went wrong');
                });

            }
        }).error(function (e) {
            alert('Ooops, something went wrong');
        });
    };

    this.setCurrentLocation = function () {
        self.closeInfoWindows();
        var myMarker = this.marker();
        myMarker.myInfoWindow.open(self.map, myMarker);
        myMarker.setAnimation(google.maps.Animation.BOUNCE);
        self.map.setCenter(myMarker.getPosition());
        self.currentLocation(this);
        window.setTimeout(function () {
            myMarker.setAnimation(null)
        }, 2000);
    };

    this.closeInfoWindows = function () {
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker().myInfoWindow.close();
        }
    };

    this.clearLocations = function () {
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker().setMap(null);
        }
        self.locationList.removeAll();
    };

    this.addLocation = function (formElement) {
        self.clearLocations();
        self.service.textSearch({
                location: hamburg,
                radius: '1000',
                query: formElement.searchText.value
            },
            self.addLocationCallback);
    };

};

ko.applyBindings(new ViewModel());
