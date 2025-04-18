export type DiceThrow = {
	id: string;
	d: number;
	value: number;
};

export type WSJoinGameData = {
	game: string;
	name: string;
};

export type WSLeaveGameData = {
	game: string;
	name: string;
};

export type WSNewRollData = {
	game: string;
	name: string;
	mod: number;
	dice: number[];
};
