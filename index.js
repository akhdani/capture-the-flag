var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    Ctf = require('./src/server/ctf'),
    Player = require('./src/server/ctf/player'),
    game = new Ctf(),
    players = {},
    admin = {};

// Set static folder
app.use(express.static("./src/web"));

// Http and socket listen port
server.listen(process.env.PORT || 5000);

// Broadcast function, loop through players
var broadcast = function(){
    for(var sid in players) if(players.hasOwnProperty(sid)){
        players[sid].socket.emit('game', game.data(players[sid].data));
    }
    for(var sid in admin) if(admin.hasOwnProperty(sid)){
        admin[sid].emit('game', game.data());
    }
};

// start the game
game.start();

// Listening to socket
io.on('connection', function (socket) {
    broadcast();

    // admin connect
    socket.on('admin', function(data, fn){
        admin[socket.id] = socket;
        broadcast();
    });

    // player register to server
    socket.on('register', function(data, fn){
        try{
            players[socket.id] = {
                socket: socket,
                data: new Player(data.name, data.latitude, data.longitude)
            };
            broadcast();
            fn(null, players[socket.id].data);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player reconnect, get by playerid
    socket.on('reconnect', function(data, fn){
        var player = null;
        for(var i in players) if(players.hasOwnProperty(i)){
            if(players[i].data.id == data.id){
                players[i].move(data);

                players[socket.id] = {
                    socket: socket,
                    data: players[i].data
                };
                break;
            }
        }
        if(!players[socket.id]){
            fn(null, players[socket.id].data);
            broadcast();
        }
    });

    // player disconnect
    socket.on('disconnect', function(){
        try{
            if(players[socket.id] && players[socket.id].data.game){
                players[socket.id].data.leave();
                delete players[socket.id];
                broadcast();
            }else if(admin[socket.id]){
                delete admin[socket.id];
                broadcast();
            }
        }catch(e){
            console.log(e);
        }
    });

    // player join on game
    socket.on('join', function(data, fn){
        try{
            players[socket.id].data.join(game);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player leave game
    socket.on('leave', function(data, fn){
        try{
            players[socket.id].data.leave();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // admin start game
    socket.on('start', function(data, fn){
        try{
            game.start();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // admin stop game
    socket.on('stop', function(data, fn){
        try{
            game.stop();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player on the move
    socket.on('move', function(data, fn){
        try{
            players[socket.id].data.move(data);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player grab
    socket.on('grab', function(data, fn){
        try{
            players[socket.id].data.grab(data);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

});