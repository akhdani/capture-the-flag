var id = 0,
    moment = require('momentjs');

// compare distance
function get_distance(latitude1, longitude1, latitude2, longitude2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude2-latitude1);  // deg2rad below
    var dLon = deg2rad(longitude2-longitude1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(latitude1)) * Math.cos(deg2rad(latitude2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // distance in metres
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

module.exports = function(config){
    var self = this;

    self.id = id++;

    // flag position
    self.latitude = config.latitude;
    self.longitude = config.longitude;

    // location history
    self.locations = [];

    // minimum distance to grab the flag, in meters
    self.distance = config.distance;

    // time limit before flag can grabbed again, in seconds
    self.time = config.time;

    // flag holder history
    self.holders = [];

    // last holder of a flag
    self.holder = null;

    // last grabbed time
    self.last_grabbed = null;

    // longest grabber
    self.longest_grabber = null;

    // longest grabbed time
    self.longest_grabbed = 0;

    // called when player try to grab a flag
    self.grab = function(player){
        // check if flag is grabbable
        self.isgrabbable(player);

        // set current holder
        self.holder = player;
        self.last_grabbed = moment().format('X');

        // set previous holder history
        self.holders[self.holders.length-1].stop_grab = self.last_grabbed;
        self.holders[self.holders.length-1].duration = Math.abs(moment(self.holders[self.holders.length-1].stop_grab, 'X').diff(moment(self.holders[self.holders.length-1].start_grab, 'X'), 'seconds'));

        // check if longest grabber
        if(self.holders[self.holders.length-1].duration > self.longest_grabbed){
            self.longest_grabber = self.holders[self.holders.length-1].player;
            self.longest_grabbed = self.holders[self.holders.length-1].duration;
        }

        // set to history
        self.holders.push({
            player: player.id,
            start_grab: self.last_grabbed,
            stop_grab: null,
            duration: 0
        });

        // move flag
        self.move(player);
    };

    // isgrabbable
    self.isgrabbable = function(player){
        // check time is allowed to grab
        if(moment().diff(self.last_grabbed, 'seconds') < self.time) throw new Error('Flag is still in stale time');

        // check distance
        if(get_distance(self.latitude, self.longitude, player.latitude, player.longitude) < self.distance) throw new Error('The distance to grab the flag is insufficient');
    };

    // move the flag
    self.move = function(data){
        self.latitude = data.latitude;
        self.longitude = data.longitude;

        self.locations.push({
            latitude: data.latitude,
            longitude: data.longitude,
            time: moment().format('X')
        })
    };

    // return flag as normal js object
    self.data = function(){
        return {
            id: self.id,
            latitude: self.latitude,
            longitude: self.longitude,
            holder: self.holder.id,
            holders: self.holders,
            longest_grabber: self.longest_grabber,
            longest_grabbed: self.longest_grabbed
        }
    };

    // move flag
    self.move(self);
};