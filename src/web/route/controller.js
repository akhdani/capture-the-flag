define([
    'asset/lib/momentjs/moment',
    'asset/lib/socket.io-client/socket.io'
], function(moment, io){
    alt.module('btford.socket-io');
    alt.factory('$socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect(alt.serverUrl)
        });
    });

    return ['$scope', '$routeParams', '$log', '$timeout', '$socket', function($scope, $routeParams, $log, $timeout, $socket){
        $scope.game = {
            is_started: false
        };

        // emit register admin
        $socket.emit('admin', {});

        // start and stop game
        $scope.start = function(){
            $socket.emit('start', {}, function(e, data){
                if(e) $log.error(e);
            });
        };
        $scope.stop = function(){
            $socket.emit('stop', {}, function(e, data){
                if(e) $log.error(e);
            });
        };

        // listening on any change from server
        $socket.on('game', function(data){
            $scope.game = alt.extend($scope.game, data);
            $log.debug($scope.game);

            // redraw position
            if($scope.map.object && google && google.maps){
                $scope.map.redraw();
            }
        });

        // gmap handler
        $scope.map = {
            elementid: 'map',
            object: null,
            zoom: 15,
            latitude: -6.89521975,
            longitude: 107.63844252,
            marker: [],
            circle: null,
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
                    var tmp = alt.extend({
                        type: 'player' + ($scope.game.flag.holder == val.id ? '' : '-off')
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

                        // add circle radius to flag
                        if(markers[i].type == 'flag'){
                            if($scope.map.circle) $scope.map.circle.setMap(null);

                            $scope.map.circle = new google.maps.Circle({
                                center: position,
                                radius: $scope.game.flag.distance,
                                strokeColor: "#FF0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: "#FF0000",
                                fillOpacity: 0.35,
                                map: $scope.map.object
                            });
                        }
                    }
                }

                // ------------- bound map with marker
                /*if ($scope.map.marker.length > 0) {
                    $scope.map.object.fitBounds($scope.map.bounds);
                }*/
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
    }];
});