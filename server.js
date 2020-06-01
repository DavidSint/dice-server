const app = require('http').createServer()
const io = require('socket.io')(app);

app.listen(8080);

const getRandom = (max) => {
  return Math.floor(Math.random() * (max) + 1);
}

io.on('connection', (socket) => {
  // console.log('a user connected');

  // socket.on('disconnect', reason => {
  //   console.log('user disconnected');
  // });

  socket.on('join game', data => {
    console.log(`${socket.id} (${data.name}) has joined ${data.game}`);
    socket.join(data.game);
  });

  socket.on('leave game', data => {
    console.log(`${socket.id} (${data.name}) has left ${data.game}`);
    socket.leave(data.game)
  });

  socket.on('new roll', data => {

    const diceThrow = data.dice.map((die) => {
      const newRoll = getRandom(die);
      return {
        id: `d${die}:${newRoll}@${new Date().getTime()}`,
        d: die,
        value: newRoll
      }
    })
    name = data.name || 'Anon'
    console.log('game:', data.game, ' name:', name, ' roll:', diceThrow);

    io.sockets.to(data.game).emit('receive roll', [{
      name,
      roll: diceThrow,
      mod: data.mod
    }])
  });
});