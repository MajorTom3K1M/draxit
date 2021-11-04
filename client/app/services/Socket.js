import io from 'socket.io-client';
import { api } from './LobbyAPI';
import { api as apiPlayer } from './PlayerAPI'; 
import { APP_PRODUCTION, DEFAULT_PORT } from "./config";

const { origin, protocol, hostname } = window.location;
const SERVER_URL = APP_PRODUCTION ? origin : `${protocol}//${hostname}:${DEFAULT_PORT}`;

export class Socket {
    constructor() {
        this.socket = io(SERVER_URL);
        this.socket.on('connect', async () => {
            // this.socketId = this.socket.id;
        });
    }

    async joinRoom(roomId, playerName, playerId) {
        this.socket.emit('join', { roomId, playerName, playerId }, function (err) {
            if(err) console.error(err);
        });
    }

    async startGame(roomId) {
        this.socket.emit('start', { roomId }, function (err) {
            if(err) console.error(err);
        })
    }

    async leaveRoom(roomId) {
        this.socket.emit('leave', { roomId }, function (err) {
            if(err) console.error(err);
        });
        this.socket.removeAllListeners();
    }

    async getPlayers(callback) {
        if(!this.socket.hasListeners('getPlayers')) {
            this.socket.on('getPlayers', (players) => {
                callback(players);
            })
        }
    }

    async updatePlayers(roomId) {
        this.socket.emit('players', { roomId }, function (err) {
            if(err) console.error(err);
        });
    }

    async getState(callback) {
        if(!this.socket.hasListeners('getState')) {
            this.socket.on('getState', (state) => {
                callback(state);
            })
        }
    }

    async setState(roomId) {
        this.socket.emit('state', { roomId }, function (err) {
            if(err) console.error(err);
        });
    }

    async reJoin(callback) {
        const roomId = localStorage.getItem("id");
        const playerName = localStorage.getItem("name");
        const player = await apiPlayer.getPlayer(roomId, playerName);
        const { isAlive } = await api.isRoomAlive(roomId);
        if(roomId && player && player?.lastRoomId === roomId) {
            if(isAlive) {
                this.socket.emit('rejoin', { roomId: roomId, playerId: localStorage.getItem("playerId")  }, function (err) {
                    if(err) console.error(err);
                });
            } else {
                callback();
            }
        } else {
            callback();
        }
    }
}

const socket = new Socket();

Object.freeze(socket);

export { socket };