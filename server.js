import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = createServer();
const io = new Server(app, {
  cors: {
    origin: [
      // "http://localhost:3000",
      /\-\-dand\.netlify\.app$/,
      /sint\.dev$/
    ],
    credentials: true
  }
});

const getRandom = (max) => {
  return Math.floor(Math.random() * (max) + 1);
}

io.on('connection', (socket) => {
  socket.on("connect_error", (err) => {
    console.log(`Connection error due to ${err.message}`);
  });

  socket.on('join game', data => {
    console.log(`ID: ${socket.id} | Name: "${data.name}" has joined game "${data.game}"`);
    socket.join(data.game);
  });

  socket.on('leave game', data => {
    console.log(`ID: ${socket.id} | Name: "${data.name}" has left game "${data.game}"`);
    socket.leave(data.game)
  });

  socket.on('new roll', data => {
    const diceThrow = data.dice.map((die) => {
      const newRoll = getRandom(die);
      return {
        id: `${uuidv4()}`,
        d: die,
        value: newRoll
      }
    })
    const res = {
      game: data.game,
      name: data.name || 'Anon',
      roll: diceThrow,
      mod: data.mod,
      total: diceThrow.reduce((sum, roll) => sum + roll.value, 0) + data?.mod
    }
    console.dir(res, { depth: null });

    io.sockets.to(data.game).emit('receive roll', res)
  });
});

app.listen(8080);
