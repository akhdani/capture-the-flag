var Player = require('./ctf/player'),
    Flag = require('./ctf/flag');

module.exports =  function(config){
    config = config || {};
    var self = this;

    // set game configuration
    self.config = {
        name: config.name || '',
        password: config.password || null,

        // flag
        flag: {
            latitude: config.latitude || -6.89570614,
            longitude: config.longitude || 107.63962269,
            distance: config.distance || 50,
            time: config.time || 120,
            game: self
        }

    };

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
    self.players = [];

    // is game started
    self.is_started = false;

    // flag, currently only 1 flag supported
    self.flag = new Flag(self.config.flag);

    // called when player join game
    self.join = function(player, password){
        password = password || null;

        if(self.config.password && self.config.password != password) throw new Error('Password not same');
        if(!(player instanceof Player)) throw new Error('Player not allowed');

        // set additional info
        player.game = self;

        self.players.push(player);
    };

    // called when player leave game
    self.leave = function(player){
        var index = self.players.indexOf(player);

        // delete player from list
        self.players.splice(index, 1);
    };

    // called when admin start the game (from browser)
    self.start = function(){
        if(self.is_started) throw new Error('Game already started');

        // mark game as started
        self.is_started = true;
    };

    // called when admin stop the game (from browser)
    self.stop = function(){
        if(!self.is_started) throw new Error('Game is not started');

        // when stopped, mark flag last holder
        if(self.flag.holder) self.flag.grab(self.flag.holder);

        // mark as not started
        self.is_started = false;
    };

    // called when admin reset the game (from browser)
    self.reset = function(){
        if(!self.is_started) throw new Error('Game is not started');

        // when reset the flag
        self.flag.reset();
        self.players = [];
    };

    // send all data needed by player in client
    self.data = function(player){
        var data = {
            name: self.name,
            is_started: self.is_started,
            flag: self.flag.data(),
            players: []
        };

        for(var i=0; i<self.players.length; i++){
            data.players.push(self.players[i].data());
        }

        return data;
    };
};