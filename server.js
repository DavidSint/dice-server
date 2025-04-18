import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
config()

const origin = process.env.ORIGIN;
if (!origin) throw new Error('This program requires a valid CORS origin value in an environment variable called `ORIGIN` see cors package for more information https://github.com/expressjs/cors#readme')

const app = createServer();
const io = new Server(app, {
  cors: {
    origin: eval(origin),
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
        id: `${randomUUID()}`,
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

app.listen(process.env.PORT ?? 8080);
