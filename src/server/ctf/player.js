var id = 0;

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
    self.time = null;

    // join game
    self.join = function(game, password){
        if(self.game != null) throw new Error('Player ' + self.name + ' is already in game');

        self.game.join(self, password);
        self.game = game;
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
        if(self.game.flag == null)  throw new Error('Game flag is not set');

        self.game.flag.grab(self);
    };

    // return player as normal js object
    self.data = function(){
        return {
            id: self.id,
            name: self.name,
            latitude: self.latitude,
            longitude: self.longitude
        }
    };
};