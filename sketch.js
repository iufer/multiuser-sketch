var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var users = [];

io.sockets.on('connection', function (socket) {

	socket.on('set nickname', function (newname) {
		socket.get('nickname', function(err, name){
			users[ users.indexOf( name ) ] = newname;
			socket.set('nickname', newname);
			socket.broadcast.emit('nickname', {userid: name, name: newname});
		});
	});
	
	socket.emit('userlist', users);
	name = 'user_'+Math.floor(Math.random()*101);
	users.push(name);
	socket.set('nickname', name);
	socket.emit('user', {userid: name});
	io.sockets.emit('user connected', {userid: name});
	
	socket.on('position', function(data){
		socket.broadcast.emit('position', data);
	});
	
	socket.on('draw', function(data){
		socket.broadcast.emit('draw', data);
	});	
	
	socket.on('mousedown', function(data){
		socket.broadcast.emit('mousedown', data);
	});	
	
	socket.on('color', function(data){
		socket.broadcast.emit('color', data);
	});	
	
	socket.on('disconnect', function(){
		socket.get('nickname', function(err, name){
			socket.emit('close');
			users.slice(users.indexOf( name ), 1);
    		io.sockets.emit('user disconnected', {userid: name});			
		});
  	});
		
});