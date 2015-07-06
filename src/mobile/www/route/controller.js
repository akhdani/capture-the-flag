define([
    'asset/lib/momentjs/min/moment.min',
    'asset/lib/socket.io-client/socket.io'
], function(moment, io){
    alt.module('btford.socket-io');
    alt.factory('$socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect(alt.serverUrl)
        });
    });

    return ['$scope', '$routeParams', '$log', '$timeout', '$socket', '$cordovaGeolocation', function($scope, $routeParams, $log, $timeout, $socket, $cordovaGeolocation){
        $scope.player = {id: -1, isgrabbable: false};
        $scope.game = {
            is_registered: false,
            is_started: false
        };

        // grab function
        $scope.grab = function(){
            $socket.emit('grab', {}, function(e, data){
                if(e) $log.error(e);
            });
        };

        // listening on any change from server
        $socket.on('game', function(data){
            $scope.game = alt.extend($scope.game, data);

            // redraw position
            if($scope.map.object && google && google.maps){
                $scope.map.redraw();
            }
        });

        // gmap handler
        $scope.map = {
            elementid: 'map',
            object: null,
            zoom: 17,
            latitude: -6.89521975,
            longitude: 107.63844252,
            marker: [],
            redraw: function(){
                // reset map marker
                for(var i=0; i<$scope.map.marker.length; i++){
                    $scope.map.marker[i].setMap(null);
                }
                $scope.map.marker = [];
                $scope.map.bounds = new google.maps.LatLngBounds();

                // markers need to draw
                var markers = [];

                // draw flag if not holded by anyone
                if($scope.game.flag && $scope.game.flag.holder == 0) markers.push(alt.extend({
                    type: 'flag',
                    name: 'Flag'
                }, $scope.game.flag));

                // draw all players
                angular.forEach($scope.game.players, function(val, key){
                    if(val.id == $scope.player.id){
                        $scope.player = val;
                        $scope.$apply();
                    }

                    var tmp = alt.extend({
                        type: val.id == $scope.player.id ? ($scope.game.flag.holder == $scope.player.id ? 'me-flag' : 'me') : ('player' + (moment(val.time, 'X').isValid() && moment().diff(moment(val.time, 'X'), 'seconds') <= 120 ? '' : '-off'))
                    }, val);
                    markers.push(tmp);
                });

                for(var i=0; i<markers.length; i++){
                    var latitude = markers[i].latitude,
                        longitude = markers[i].longitude;

                    if (latitude != '' && typeof latitude !== 'undefined' && latitude != null &&
                        longitude != '' && typeof longitude !== 'undefined' && longitude != null) {

                        // create new marker
                        var position = new google.maps.LatLng(latitude, longitude);
                        var marker = new google.maps.Marker({
                            data: markers[i],
                            position: position,
                            map: $scope.map.object,
                            icon: 'asset/img/marker/' + markers[i].type + '.png',
                            infoWindow: {
                                content: '<div style="color: black; min-width: 150px; min-height: 70px; overflow: none;">'
                                + '<h5> Nama : ' + (markers[i].name || '') + '</h5>'
                                + '<h6> Latitude : ' + (markers[i].latitude || '') + '</h6>'
                                + '<h6> Longitude : ' + (markers[i].longitude || '') + '</h6>'
                                + '</div>'
                            }
                        });

                        $scope.map.marker.push(marker);

                        google.maps.event.addListener($scope.map.marker[$scope.map.marker.length - 1], 'click', function(){
                            var marker = this;
                            $scope.map.info.close();
                            $scope.map.info.setContent(marker.infoWindow.content);
                            $scope.map.info.open($scope.map.object, marker);
                        });
                        $scope.map.bounds.extend(position);
                    }
                }

                // ------------- bound map with marker
                if ($scope.map.marker.length > 0) {
                    $scope.map.object.fitBounds($scope.map.bounds);
                }
                google.maps.event.trigger($scope.map.object, "resize");
            }
        };

        // load google maps
        require([
            'async!http://maps.googleapis.com/maps/api/js?key=' + alt.registry.GMAP_KEY + '&sensor=false&language=id'
        ], function(){
            $scope.map.element = document.getElementById($scope.map.elementid);
            $scope.map.center = new window.google.maps.LatLng($scope.map.latitude, $scope.map.longitude);
            $scope.map.options = {
                center: $scope.map.center,
                zoom: $scope.map.zoom,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP
            };

            $scope.map.object = new window.google.maps.Map($scope.map.element, $scope.map.options);
            $scope.map.info = new google.maps.InfoWindow;
            $scope.map.redraw();
        });

        // get current location
        var location_options = {
            frequency : 1000,
            timeout : 1000,
            enableHighAccuracy: true
        };

        // watch location
        $scope.map.watch = $cordovaGeolocation.watchPosition(location_options);

        // on location change
        $scope.map.watch.then(
            null,
            function(err) {
                // error
            },
            function(position) {
                if($scope.game.is_registered){
                    $socket.emit('move', {latitude: position.coords.latitude, longitude: position.coords.longitude}, function(e, data) {
                        if (e) $log.error(e);
                    });
                }else{
                    // register player
                    $socket.emit('register', {name: 'tes', latitude: position.coords.latitude, longitude: position.coords.longitude}, function(e, data){
                        if(e) $log.error(e);
                        $scope.player = data;
                        $socket.emit('join', {}, function(e, data){
                            if(e) $log.error(e);
                            $scope.game.is_registered = true;
                            $scope.$apply();
                        });
                    });
                }
            }
        );
    }];
});