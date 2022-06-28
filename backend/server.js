const { Socket } = require("dgram");
const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");
const knex = require("./data/db.js");

const app = express();
const httpServer = createServer(app);

//spara meddelande i en array som läses in från databasen vem/meddelande/tis/rum.
async function getTable() {
  const result = await knex("messages").select();
  console.log(result);
  return result;
}
//alla meddelanden som finns i rummet ska synas vi inloggning
async function getMessages(room) {
  const result = await knex("messages").select().where({ room: room });
  console.log(result);
  return result;
}

async function getRooms() {
  const result = await knex("rooms").select();
  console.log(result);
  return result;
}

const rooms = {
  default: {
    name: "default room",
  },
};

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  socket.join("default");
  socket.currentRoom = "default";
  const createdRooms = await getRooms();
  console.log("created rooms", createdRooms);
  socket.emit("rooms", createdRooms);

  socket.on("create_room", (room) => {
    rooms[room] = {
      name: room,
    };
    console.log(`Created room ${room}`);
    console.log("rooms:", rooms);
    socket.emit("create_room", room);
  });

  socket.on("join_room", async (room) => {
    //avgöra vilka rum som klient är med i och gå ur det senaste.
    const joinedRooms = Array.from(socket.rooms);
    console.log("joined rooms:", joinedRooms);
    const roomToLeave = joinedRooms[1];
    socket.leave(roomToLeave);

    //gå med i nytt rum
    socket.join(room);
    socket.currentRoom = room;

    console.log(`${socket.id} has joined ${room}.`);

    console.log("currentroom:", socket.currentRoom);
    socket.emit("join_room", room);
    const messageHistory = await getMessages(socket.currentRoom);
    console.log(messageHistory);
    socket.emit("room_messages", messageHistory);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`${socket.id} has left room ${room}.`);

    console.log(socket.rooms);
  });

  socket.on("message", (message) => {
    console.log(`${socket.id} har skickat ${message}.`);

    console.log("curretRoom:", socket.currentRoom);

    io.to(socket.currentRoom).emit("message", message);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Server has disconnected. Reason ${reason}.`);
  });
});

httpServer.listen(4000);
