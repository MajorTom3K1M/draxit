const socketIO = require('socket.io');
const PlayerControllers = require("../controllers/Players");
const RoomControllers = require("../controllers/Rooms");

module.exports = (server) => {
    const io = socketIO(server);
    io.on("connection", async (socket) => {
        socket.on('join', async (params, callback) => {
            try {
                const { roomId, playerId } = params;
                socket.join(roomId);

                socket['data'] = { roomId, playerId };

                io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
            } catch(err) {
                callback(err);
            }
        });

        socket.on('leave', async (params, callback) => {
            try {
                const { roomId } = params;
                io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
                socket.leave(roomId);
            } catch(err) {
                callback(err);
            }
        });

        socket.on('rejoin', async (params, callback) => {
            try {
                const { roomId, playerId } = params;
                if(!socket.adapter.rooms.get(roomId).has(socket.id)) {
                    console.log(playerId, "reJoin!");
                    socket.join(roomId);
                    // store value in socket
                    socket['data'] = { roomId, playerId };
                    await RoomControllers.reConnect(roomId, playerId);
                    io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
                }

            } catch(err) {
                callback(err);
            }
        });

        socket.on('start', async (params, callback) => {
            try {
                const { roomId } = params;
                io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
                io.to(roomId).emit('getState', await RoomControllers.getRoom(roomId));
            } catch(err) {
                callback(err);
            }
        });

        socket.on('players', async (params, callback) => {
            try {
                const { roomId } = params;
                io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
            } catch (err) {
                callback(err);
            }
        })

        socket.on('state', async (params) => {
            try {
                const { roomId } = params;
                io.to(roomId).emit('getPlayers', await RoomControllers.getPlayers(roomId));
                io.to(roomId).emit('getState', await RoomControllers.getRoom(roomId));
            } catch(err) {
                callback(err);
            }
        });

        socket.on('disconnect', async () => {
            try {
                if (socket['data'].roomId && socket['data'].playerId) {
                    console.log(socket['data'].playerId, "disconnected!!");

                    socket.leave(socket['data'].roomId);
                    await RoomControllers.leaveRoom(socket['data'].roomId, socket['data'].playerId);
                    io.to(socket['data'].roomId).emit('getPlayers', await RoomControllers.getPlayers(socket['data'].roomId));
                }
                socket.disconnect();
            } catch(err) {
                console.log("don't know just let it error")
                console.log(err)
            }
        });
    })
    return io;
}