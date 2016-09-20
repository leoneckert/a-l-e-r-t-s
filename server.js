// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

function requestHandler(req, res) {

    var parsedUrl = url.parse(req.url);
    console.log("The Request is: " + parsedUrl.pathname);
        
    fs.readFile(__dirname + parsedUrl.pathname, 
        // Callback function for reading
        function (err, data) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + parsedUrl.pathname);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200);
            res.end(data);
        }
    );
    
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

var userID = {}
var IDuser = {}
// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects


io.sockets.on('connection', 
    // We are given a websocket object in our function
    function (socket) {
    
        console.log("We have a new client: " + socket.id);
        console.log(userID);
        // io.sockets.emit('active_users', userID);

        socket.on('username', function(username) {
            console.log("Received: 'username' " + username);
            userID[username] = socket.id;
            IDuser[socket.id] = username;

            console.log(userID)
            var names = [];
            for (name in userID){
                names.push(name);
            }
            io.sockets.emit('active_users', names);
            // broadcastActiveUsers();
        });

        socket.on('chatalert', function(data) {
            var recipient = data[0];
            var recipient_id = userID[recipient];
            var alert = data[1];
            console.log("Alert for", recipient, " | id:", userID[recipient] ,"| alert:", alert);
            
            io.to(recipient_id).emit('incomingAlert', alert);
        });
        
        // When this user emits, client side: socket.emit('otherevent',some data);
        // socket.on('chatmessage', function(data) {
        //     // Data comes in as whatever was sent, including objects
        //     console.log("Received: 'chatmessage' " + data);
            
        //     // Send it to all of the clients
        //     //socket.broadcast.emit('chatmessage', data);
        //     io.sockets.emit('chatmessage', data);
        // });
        
        
        socket.on('disconnect', function() {
            delete userID[IDuser[socket.id]];
            delete IDuser[socket.id];
            console.log("Client has disconnected " + socket.id);
        });
    }
);