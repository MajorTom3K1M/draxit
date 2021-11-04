import { socket } from './Socket';
import { APP_PRODUCTION, DEFAULT_PORT } from "./config";
import ky from 'ky';

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export class CardAPI {
    constructor() {
        this.api = ky.create({
            prefixUrl: `${SERVER_URL}/card`
        })
        this.socket = socket;
    }

    async createCard(roomId, playerId, image, round) {
        try {
            const res = await this.api.post(roomId + "/create", { json: { playerId: playerId, image: image, round: round } }).json();
            this.socket.updatePlayers(roomId);
            return res
        } catch(err) {
            console.log("failed to create card:", err);
        }
    }

    async getCards(roomId, round) {
        try {
            const res = await this.api.get(roomId, { searchParams: { round: round } }).json();
            this.socket.updatePlayers(roomId);
            // this.socket.updateCards(roomId);
            return res
        } catch(err) {
            console.log("failed to get card:", err);
        }
    }

    async selectCard(roomId, cardId, playerId) {
        try {
            const res = await this.api.post(roomId + "/select", { json: { playerId: playerId, cardId: cardId } });
            this.socket.updatePlayers(roomId);
            return res
        } catch(err) {
            console.log("failed to select card:", err);
        }
    }
}

const api = new CardAPI();

export { api };