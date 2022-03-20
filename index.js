const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
  
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = []

io.on('connection', (socket) => {

  users.push({
    socketId: socket.id,
    name: socket.handshake.query['user']
  })

  io.emit('connection', socket.handshake.query['user'])

  socket.on('chat message', (msg) => {    
    const [sender] = users.filter(user => user.socketId === socket.id)  
      
    io.emit('chat message', `${sender.name}: ${msg}`);
  });

  socket.on('chat private', (receiverName, msg) => {    
    const [userReceiver] = users.filter(user => user.name === receiverName)
    const [userSender] = users.filter(user => user.socketId === socket.id)

    io.to(userReceiver.socketId).emit('chat private', `[PRIVATE MESSAGE FROM: ${userSender.name}] ${userReceiver.name}: ${msg}`);
  });

  socket.on('typing', () => {    
    const [sender] = users.filter(user => user.socketId === socket.id)  
      
    io.emit('typing', sender.name);
  });
  
  socket.on('disconnect', () => {
    const [sender] = users.filter(user => user.socketId === socket.id) 

    io.emit('disconnect message', sender.name)
  })

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});