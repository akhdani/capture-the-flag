var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    Ctf = require('./src/server/ctf'),
    Player = require('./src/server/ctf/player'),
    game = new Ctf({name: 'Demo Version'}),
    players = {},
    admin = {};

// Set static folder
app.use(express.static("./src/web"));

// Http and socket listen port
server.listen(process.env.PORT || 5000);

// Broadcast function, loop through players
var broadcast = function(){
    var data;

    for(var sid in players) if(players.hasOwnProperty(sid)){
        data = game.data(players[sid].data);
        players[sid].socket.emit('game', data);
        //console.log('send data to player ' + players[sid].data.id, data);
    }

    for(var sid in admin) if(admin.hasOwnProperty(sid)){
        data = game.data();
        admin[sid].emit('game', data);
        //console.log('send data to admin', data);
    }
};

// start the game
game.start();

// Listening to socket
io.on('connection', function (socket) {
    console.log('new client connected');
    broadcast();

    // admin connect
    socket.on('admin', function(data, fn){
        admin[socket.id] = socket;
        broadcast();
    });

    // admin start game
    socket.on('start', function(data, fn){
        console.log('game start', data);
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
        console.log('game stop', data);
        try{
            game.stop();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // admin reset game
    socket.on('reset', function(data, fn){
        console.log('game reset', data);
        try{
            game.reset();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player register to server
    socket.on('register', function(data, fn){
        console.log('player register', data);
        try{
            var player = new Player(data.name, data.latitude, data.longitude);

            players[player.id] = {
                socket: socket,
                data: player
            };
            broadcast();
            fn(null, players[player.id].data);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player disconnect
    socket.on('disconnect', function(){
        try{
            for(var i in players) if(players.hasOwnProperty(i)){
                if(players[i].socket == socket){
                    players[i].data.leave();
                    delete players[i];
                }
            }

            if(admin[socket.id]){
                delete admin[socket.id];
            }

            broadcast();
        }catch(e){
            console.log(e);
        }
    });

    // player join on game
    socket.on('join', function(data, fn){
        console.log('player join', data);
        try{
            if(!players[data.id]){
                var player = new Player(data.name, data.latitude, data.longitude);
                player.id = data.id;

                players[player.id] = {
                    socket: socket,
                    data: player
                };


                players[data.id].data.join(game);
            }

            players[data.id].data.join(game);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player leave game
    socket.on('leave', function(data, fn){
        console.log('player leave', data);
        try{
            if(!players[data.id]){
                var player = new Player(data.name, data.latitude, data.longitude);
                player.id = data.id;

                players[player.id] = {
                    socket: socket,
                    data: player
                };


                players[data.id].data.join(game);
            }

            players[data.id].data.leave();
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player on the move
    socket.on('move', function(data, fn){
        console.log('player move', data);
        try{
            if(!players[data.id]){
                var player = new Player(data.name, data.latitude, data.longitude);
                player.id = data.id;

                players[player.id] = {
                    socket: socket,
                    data: player
                };


                players[data.id].data.join(game);
            }

            players[data.id].data.move(data);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });

    // player grab
    socket.on('grab', function(data, fn){
        console.log('player grab', data);
        try{
            if(!players[data.id]){
                var player = new Player(data.name, data.latitude, data.longitude);
                player.id = data.id;

                players[player.id] = {
                    socket: socket,
                    data: player
                };

                players[data.id].data.join(game);
            }

            players[data.id].data.grab(data);
            broadcast();
            fn(null, null);
        }catch(e){
            console.log(e);
            fn(e.message, null);
        }
    });

    // player release
    socket.on('release', function(data, fn){
        console.log('player release', data);
        try{
            if(!players[data.id]){
                var player = new Player(data.name, data.latitude, data.longitude);
                player.id = data.id;

                players[player.id] = {
                    socket: socket,
                    data: player
                };


                players[data.id].data.join(game);
            }

            players[socket.id].data.release(data);
            broadcast();
            fn(null, null);
        }catch(e){
            fn(e.message, null);
        }
    });
});