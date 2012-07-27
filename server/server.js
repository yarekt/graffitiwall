var io = require('socket.io').listen(12346);
io.set('log level', 2);
io.set('transports', ['websocket']);

var db = require('./db');

io.sockets.on('connection', function (socket) {

    io.sockets.emit('count', count());
    socket.on('disconnect', function () {
        io.sockets.emit('count', count()-1);
    });

    // Chat
    socket.on('message', function (a) {
        socket.broadcast.emit('message', a);
    });

    // Actual events
    socket.on('draw', function(data) {
        socket.broadcast.emit('draw', data);

        // Save later on
        db.insert(data);
    });

    socket.on('replay', function(data) {
        db.replay(function(list, end){
            socket.emit('replay', {
                data: list,
                end: end
            });
        });
    });
});

function count() {
    var c=0,i;
    for(i in io.sockets.sockets)c++;
    return c;
}