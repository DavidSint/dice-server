import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { parse } from "devalue";
import { config } from "dotenv";
import { Server } from "socket.io";

import type {
	DiceThrow,
	WSJoinGameData,
	WSLeaveGameData,
	WSNewRollData,
} from "./types.ts";

config();

let allowedOrigins = process.env.ORIGIN;
if (!allowedOrigins) {
	throw new Error(
		"This program requires a valid CORS origin value in an environment variable called `ORIGIN` see cors package for more information https://github.com/expressjs/cors#readme",
	);
}
try {
	allowedOrigins = parse(allowedOrigins);
} catch (error) {
	throw new Error(
		`Failed to parse ORIGIN with the devalue library: ${JSON.stringify(error)}`,
	);
}

const app = createServer();
const io = new Server(app, {
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
});

const getRandom = (max: number) => {
	return Math.floor(Math.random() * max + 1);
};

io.on("connection", (socket) => {
	socket.on("connect_error", (err) => {
		console.log(`Connection error due to ${err.message}`);
	});

	socket.on("join game", (data: WSJoinGameData) => {
		console.log(
			`ID: ${socket.id} | Name: "${data.name}" has joined game "${data.game}"`,
		);
		socket.join(data.game);
	});

	socket.on("leave game", (data: WSLeaveGameData) => {
		console.log(
			`ID: ${socket.id} | Name: "${data.name}" has left game "${data.game}"`,
		);
		socket.leave(data.game);
	});

	socket.on("new roll", (data: WSNewRollData) => {
		const diceThrow: DiceThrow[] = data.dice.map((die: number) => {
			const newRoll = getRandom(die);
			return {
				id: randomUUID(),
				d: die,
				value: newRoll,
			};
		});
		const res = {
			game: data.game,
			name: data.name || "Anon",
			roll: diceThrow,
			mod: data.mod,
			total:
				diceThrow.reduce(
					(sum: number, roll: DiceThrow) => sum + roll.value,
					0,
				) + data?.mod,
		};
		console.dir(res, { depth: null });

		io.sockets.to(data.game).emit("receive roll", res);
	});
});

app.listen(process.env.PORT ?? 8080);
