var id = 1,
    moment = require('moment'),
    helper = require('./helper');

module.exports = function(config){
    var self = this;

    self.id = id++;
    self.game = config.game;

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

    // called when admin reset the flag position
    self.reset = function(){
        self.latitude = self.game.config.flag.latitude;
        self.longitude = self.game.config.flag.longitude;
        self.locations = [];
        self.holders = [];
        self.holder = null;
        self.last_grabbed = null;
        self.longest_grabber = null;
        self.longest_grabbed = 0;
    };

    // called when player try to grab a flag
    self.grab = function(player){
        // check if flag is grabbable
        self.isgrabbable(player);

        // previous holder release
        self.release(self.holder);

        // set current holder
        self.holder = player;
        self.last_grabbed = moment().format('X');

        // add to history
        self.holders.push({
            player: player.id,
            start_grab: self.last_grabbed,
            stop_grab: null,
            duration: 0
        });

        // move flag
        self.move(player);
    };

    // called when player release a flag
    self.release = function(player){
        // set previous holder
        if(self.holders.length > 0){
            if(self.holder != player.id) throw new Error('Player is not the flag holder');

            // set previous holder history
            self.holders[self.holders.length-1].stop_grab = moment().format('X');
            self.holders[self.holders.length-1].duration = Math.abs(moment(self.holders[self.holders.length-1].stop_grab, 'X').diff(moment(self.holders[self.holders.length-1].start_grab, 'X'), 'seconds'));

            // check if longest grabber
            if(self.holders[self.holders.length-1].duration > self.longest_grabbed){
                self.longest_grabber = self.holders[self.holders.length-1].player;
                self.longest_grabbed = self.holders[self.holders.length-1].duration;
            }
        }
    };

    // isgrabbable
    self.isgrabbable = function(player){
        // check if game is started
        if(!self.game.is_started) throw new Error('Game is not started yet');

        // check time is allowed to grab
        if(moment().diff(self.last_grabbed, 'seconds') < self.time) throw new Error('Flag is still in stale time');

        // check distance
        if(helper.get_distance(self.latitude, self.longitude, player.latitude, player.longitude) > self.distance) throw new Error('The distance to grab the flag is insufficient');
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
            distance: self.distance,
            last_grabbed: self.last_grabbed,
            holder: self.holder ? self.holder.id : 0,
            holders: self.holders,
            longest_grabber: self.longest_grabber,
            longest_grabbed: self.longest_grabbed
        }
    };

    // move flag
    self.move(self);
};