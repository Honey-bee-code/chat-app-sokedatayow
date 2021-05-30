const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000;
// const PORT =

const router = require("./router");

// const connectionOptions = {
//     cors: {
//         origin: "https://60b202c73754952480cc18f1--xenodochial-allen-cb8b30.netlify.app",
//         // origin: "http://localhost:3000",
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
// };
const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: {} });
// const io = socketio(server);

app.use(router);
app.use(cors());

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        // if (error) return callback(error);
        if (error) callback(error);

        socket.emit("message", { user: "admin", text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name}, has joined!` });

        socket.join(user.room);

        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on("sendMessage", ({ message, name }, callback) => {
        const user = getUser(name.trim().toLowerCase());

        io.to(user.room).emit("message", { user: user.name, text: message });
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        console.log(socket.id);
        if (user) {
            io.to(user.room).emit("message", { user: "admin", text: `${user.name} has left.` });
        }
    });
});

server.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
