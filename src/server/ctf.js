var Player = require('./ctf/player');

var Ctf = function(config){
    config = config || {};
    var self = this;

    // set game configuration
    self.config = {
        name: config.name || '',
        password: config.password || null,
        creator: config.creator
    };

    // set game creator
    if(self.config.creator) self.config.creator.game = self;

    // all actions happened in the game
    self.history = [];
    self.record = function(player, action, data){
        self.history.push({
            player: player,
            action: action,
            data: data
        });
    };

    // set creator as join
    self.players = self.config.creator ? [self.config.creator] : [];

    // is game started
    self.is_started = false;

    // flag, currently only 1 flag supported
    self.flag = null;

    // called when player join game
    self.join = function(player, password){
        password = password || null;

        if(self.config.password && self.config.password != password) throw new Error('Password not same');
        if(self.is_started) throw new Error('Game already started');
        if(!(player instanceof Player)) throw new Error('Player not allowed');

        // set additional info
        player.game = self;

        // set game creator
        if(self.config.creator == null) self.config.creator = player;

        self.players.push(player);
    };

    // called when player leave game
    self.leave = function(player){
        var index = self.players.indexOf(player);

        // delete player from list
        self.players.splice(index, 1);

        if(self.creator == player) self.stop(player);
    };

    // called when player (creator) start the game
    self.start = function(){
        if(self.is_started) throw new Error('Game already started');

        // mark game as started
        self.is_started = true;
    };

    // called when player stop the game
    self.stop = function(){
        self.is_started = false;
        self.players = [];
        self.history = [];
    };

    // send all data needed by player in client
    self.data = function(player){
        var data = {};

        return data;
    };
};

Uno.prototype.Deck = Deck;
Uno.prototype.Player = Player;

module.exports = Uno;