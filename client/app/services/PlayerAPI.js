import { socket } from './Socket';
import { APP_PRODUCTION, DEFAULT_PORT } from "./config";
import ky from 'ky';

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export class PlayerAPI {
    constructor() {
        this.api = ky.create({
            prefixUrl: `${SERVER_URL}/player`
        });
        this.socket = socket;
    }

    async createPlayer(roomId, name) {
        try {
            const res = await this.api.post(roomId + "/create", { json: { name: name  } }).json();
            return res;
        } catch(err) {
            console.log("failed to create player:", err);
        }
    }

    async getPlayer(roomId, name) {
        try {
            const res = await this.api.get(roomId, { searchParams: { name: name } }).json();
            return res;
        } catch(err) {
            console.log("failed to get player:", err);
        }
    }

    async gameContinue(roomId, playerId) {
        try {
            const res = await this.api.post(roomId + "/continue", { json: { playerId: playerId } }).json();
            return res;
        } catch (err) {
            console.log("failed to continue game:", err);
        }
    }
}

const api = new PlayerAPI();

export { api };