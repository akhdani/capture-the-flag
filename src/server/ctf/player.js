var id = 0;

module.exports = function(name){
    var self = this;

    self.id = id++;
    self.name = name;
    self.game = null;
    self.locations = [];

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

    };

    // grab the flag
    self.grab = function(data){

    };
};