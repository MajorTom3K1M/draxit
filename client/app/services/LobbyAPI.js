import { socket } from './Socket';
import { APP_PRODUCTION, DEFAULT_PORT } from "./config";
import ky from 'ky';

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export class LobbyAPI {
    constructor() {
        this.api = ky.create({
            prefixUrl: `${SERVER_URL}/games`
        });
        this.socket = socket;
    }

    async createRoom(playerCount) {
        try {
            const res = await this.api.post("create", { json: { playerCount: playerCount } }).json();
            return res.roomId;
        } catch(err) {
            console.log("failed to create room:", err);
        }
    }

    async joinRoom(roomId, playerName, isRoomOwner) {
        try {   
            const res = await this.api.post(roomId + "/join", { json: { playerName: playerName, isRoomOwner } }).json();
            this.socket.joinRoom(roomId, playerName, res.player._id);
            
            return res;
        } catch(err) {
            console.log("failed to join room:", err);
        }
    }

    async leaveRoom(roomId, playerId) {
        try {
            await this.api.post(roomId + "/leave", { json: { playerId: playerId } }).json();
            this.socket.leaveRoom(roomId);
        } catch(err) {
            console.log("failed to leave room:", err);
        }
    }

    async isRoomAlive(roomId) {
        try {
            const res = await this.api.get(roomId + "/health").json();
            return res;
        } catch(err) {
            console.log("failed to get room health:", err);
        }
    }

    async getPlayers(roomId) {
        const res = await this.api.get(roomId).json();
        return res;
    }

    async startGame(roomId) {
        try {
            const res = await this.api.post(roomId + "/start").json();
            this.socket.startGame(roomId);
            return res;
        } catch (err) {
            console.log("failed to start game:", err);
        }
    }

    async setState(roomId, state, stateOptions = {}) {
        try {
            const res = await this.api.post(roomId + "/state", { json: { state: state, stateOptions } }).json();
            this.socket.setState(roomId);
            return res;
        } catch(err) {
            console.log("failed to set state:", err)
        }
    }
}

const api = new LobbyAPI();

export { api };