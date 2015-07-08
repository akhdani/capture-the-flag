var id = 1,
    moment = require('moment'),
    helper = require('./helper');

module.exports = function(name, latitude, longitude){
    var self = this;

    self.id = id++;
    self.name = name;
    self.game = null;

    // player location history
    self.locations = [];

    // player location
    self.latitude = latitude;
    self.longitude = longitude;

    // player last active time
    self.time = moment().format('X');

    // join game
    self.join = function(game, password){
        if(self.game != null) throw new Error('Player ' + self.name + ' is already in game');

        game.join(self, password);
        self.time = moment().format('X');
    };

    // leave game
    self.leave = function(){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');

        self.game.leave();
    };

    // start game
    self.start = function(){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');
        if(self.game.creator != self) throw new Error('Player is not the game creator');

        self.game.start();
        self.time = moment().format('X');
    };

    // stop game
    self.stop = function(){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');
        if(self.game.creator != self) throw new Error('Player is not the game creator');
        if(!self.game.is_started) throw new Error('Game is not started');

        self.game.stop();
    };

    // on the move
    self.move = function(data){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');

        // set player location
        self.latitude = data.latitude;
        self.longitude = data.longitude;
        self.time = moment().format('X');

        // save to player location history
        self.locations.push({
            latitude: self.latitude,
            longitude: self.longitude,
            time: self.time
        });

        // if player is holding flag, change flag location too
        if(self.game.flag.holder == self){
            self.game.flag.move(self);
        }
    };

    // grab the flag
    self.grab = function(data){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');
        if(!self.game.is_started)  throw new Error('Game flag is not started');
        if(self.game.flag == null)  throw new Error('Game flag is not set');

        self.game.flag.grab(self);
    };

    // release the flag
    self.release = function(data){
        if(self.game == null) throw new Error('Player ' + self.name + ' is not in game');
        if(!self.game.is_started)  throw new Error('Game flag is not started');
        if(self.game.flag == null)  throw new Error('Game flag is not set');

        self.game.flag.release(self);
    };

    // return player as normal js object
    self.data = function(){
        var isgrabbable = false,
            distance = Math.ceil(helper.get_distance(self.latitude, self.longitude, self.game.flag.latitude, self.game.flag.longitude)),
            direction = helper.get_direction(self.latitude, self.longitude, self.game.flag.latitude, self.game.flag.longitude);

        try{
            self.game.flag.isgrabbable(self);
            isgrabbable = true;
        }catch(e){
            isgrabbable = false;
        }

        return {
            id: self.id,
            name: self.name,
            latitude: self.latitude,
            longitude: self.longitude,
            isgrabbable: isgrabbable,
            time: self.time,
            distance: distance || 0,
            direction: direction || 0
        };
    };
};