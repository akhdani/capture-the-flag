var Rx = require('rx'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    Ctf = require('./src/server/ctf'),
    Player = require('./src/server/ctf/player'),
    game = new Ctf(),
    players = {};

// Set static folder
app.use(express.static("./src/client"));

// Http and socket listen port
server.listen(process.env.PORT || 5000);

// Broadcast function, loop through players
var broadcast = function(){
    for(var sid in players) if(players.hasOwnProperty(sid)){
        players[sid].socket.emit('game', game.data(players[sid].data));
    }
};

// Listening to socket
io.on('connection', function (socket) {
    // player register to server
    socket.on('register', function(data, fn){
        try{
            players[socket.id] = {
                socket: socket,
                data: new Player(data.name)
            };
            fn(null, players[socket.id].data);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player disconnect
    socket.on('disconnect', function(){
        try{
            if(players[socket.id] && players[socket.id].data.game){
                players[socket.id].data.leave();
                delete players[socket.id];
                broadcast();
            }
        }catch(e){
            console.log(e);
        }
    });

    // player join on game
    socket.on('join', function(data, fn){
        try{
            players[socket.id].join(game);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player leave game
    socket.on('leave', function(data, fn){
        try{
            players[socket.id].leave();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player start game
    socket.on('start', function(data, fn){
        try{
            players[socket.id].start();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player stop game
    socket.on('stop', function(data, fn){
        try{
            players[socket.id].stop();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player on the move
    socket.on('move', function(data, fn){
        try{
            players[socket.id].move(data);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

});