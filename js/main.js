'use strict';

/*global ko, google, $*/
var hamburg = {
    lat: 53.555,
    lng: 9.929
};

var Loc = function (data) {
    this.name = ko.observable(data.name);
    this.marker = ko.observable(data.marker);
    this.description = ko.observable(data.description);
    this.visible = ko.observable(data.visible);
};

var ViewModel = function () {
    var self = this;

    self.map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 15,
        center: hamburg
    });
    self.service = new google.maps.places.PlacesService(this.map);
    self.locationList = ko.observableArray([]);

    self.collapsedState = ko.observable(false);
    self.isMobile = false;

    /*This function is executed after initial search of place through
      google maps API and it populates observableArray with list of places*/
    self.addLocationCallback = function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0, len = results.length; i < len;  i++) {
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: results[i].geometry.location,
                    title: results[i].name
                });

                self.getFsqReviews(results[i].name, marker);

                self.addListenerForMarker(marker);

                self.locationList.push(new Loc({
                    name: results[i].name,
                    marker: marker,
                    description: results[i].formatted_address,
                    visible: true
                }));
            }
        }


    };

    /*Trigger googlePlaces search to initially populate array with places*/
    self.service.textSearch({
        location: hamburg,
        radius: '1000',
        query: 'restaraunts'
    }, self.addLocationCallback);

    /*service fucntion to add click listeneres on markers*/
    self.addListenerForMarker = function (markerParam) {
        google.maps.event.addListener(markerParam, 'click', function () {
            if (self.isMobile && !self.collapsedState()) {
                $('#accordion').accordion({
                    active: false
                });
                self.setCollapseState();
            }
            self.closeInfoWindows();
            markerParam.myInfoWindow.open(self.map, markerParam);
            markerParam.setAnimation(google.maps.Animation.BOUNCE);
            self.map.setCenter(markerParam.getPosition());
            window.setTimeout(function () {
                markerParam.setAnimation(null);
            }, 2000);
        });
    };

    /*service function to get reviews from foursquare*/
    self.getFsqReviews = function (locationName, marker) {
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
                        for (var i = 0, len = tips.length; i < len;  i++) {
                            result.push({
                                text: tips[i].text,
                                user: tips[i].user.firstName + ' ' + tips[i].user.lastName
                            });
                        }
                        for (i = 0, len = result.length; i < len;  i++) {
                            html += '<p><strong>' + result[i].user + ':</strong>';
                            html += result[i].text + '</p>';
                        }
                        marker.myInfoWindow = new google.maps.InfoWindow({
                            content: html
                        });
                    }
                }).fail(function () {
                    console.log('Ooops, something went wrong');
                });

            }
        }).fail(function () {
            console.log('Ooops, something went wrong');
        });
    };

    self.setCurrentLocation = function () {
        if (self.isMobile) {
            $('#accordion').accordion({
                active: false
            });
            self.setCollapseState();
        }
        self.closeInfoWindows();
        var myMarker = this.marker();
        myMarker.myInfoWindow.open(self.map, myMarker);
        myMarker.setAnimation(google.maps.Animation.BOUNCE);
        self.map.setCenter(myMarker.getPosition());
        window.setTimeout(function () {
            myMarker.setAnimation(null);
        }, 2000);
    };

    self.closeInfoWindows = function () {
        for (var i = 0, len = self.locationList().length; i < len;  i++) {
            self.locationList()[i].marker().myInfoWindow.close();
        }
    };

    self.clearLocations = function () {
        for (var i = 0, len = self.locationList().length; i < len;  i++) {
            self.locationList()[i].marker().setMap(null);
        }
        self.locationList.removeAll();
    };

    self.searchLocation = function (formElement) {
        var name = '',
            desc = '',
            searchTerm = formElement.searchText.value.toLowerCase(),
            myLocations = self.locationList.removeAll();

        self.closeInfoWindows();
        self.clearLocations();

        for (var i = 0, len = myLocations.length; i < len;  i++) {
            name = myLocations[i].name().toLowerCase();
            desc = myLocations[i].description().toLowerCase();
            if (name.search(searchTerm) != -1 || desc.search(searchTerm) != -1) {
                myLocations[i].visible(true);
                myLocations[i].marker().setMap(self.map);
            } else {
                myLocations[i].visible(false);
                myLocations[i].marker().setMap(null);
            }
            self.locationList.push(myLocations[i]);
        }
        var results = self.locationList().filter(function (elem) {
            return elem.visible() === true;
        });
        self.map.setCenter(results[0].marker().getPosition());
    };

    self.setCollapseState = function () {
        if (self.isMobile) {
            self.collapsedState(!self.collapsedState());
            google.maps.event.trigger(self.map, 'resize');
            if (!self.collapsedState()) {
                self.closeInfoWindows();
            }
        }
    };

    $(window).resize(function () {
        self.checkWidthAndLoadAccordion();
    });

    $(document).ready(function () {
        self.checkWidthAndLoadAccordion();
    });

    self.checkWidthAndLoadAccordion = function () {
        if ($(window).width() < 768) {
            self.isMobile = true;
            $('#accordion').accordion({
                collapsible: true
            });
        } else {
            self.isMobile = false;
            try {
                $('#accordion').accordion('destroy');
            } catch (e) {}
            self.collapsedState(false);
        }
    };
};

ko.applyBindings(new ViewModel());
