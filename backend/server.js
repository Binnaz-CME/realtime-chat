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
  return result;
}
//alla meddelanden som finns i rummet ska synas vi inloggning
async function getMessages(room) {
  const result = await knex("messages").select().where({ room: room });
  return result;
}

async function getRooms() {
  const result = await knex("rooms").select();
  return result;
}

async function addRoom(room) {
  const id = await knex("rooms").insert(room);
  return id;
}

async function addMessage({ user, room, message }) {
  console.log("message from addmessage:", message);

  if(!message) {
    return null;
  } else {
    const id = await knex("messages").insert({ user, room, message });
    return id;
  }
}

async function getMessage(id) {
  const newMessage = await knex("messages").select().where({ id: id });
  return newMessage;
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
  socket.emit("rooms", createdRooms);

  socket.on("create_room", (room) => {
    rooms[room] = {
      name: room,
    };
    console.log(`Created room ${room}`);
    addRoom({ room });
    socket.emit("create_room", createdRooms);
  });

  socket.on("join_room", async (room) => {
    //avgöra vilka rum som klient är med i och gå ur det senaste.
    const joinedRooms = Array.from(socket.rooms);
    const roomToLeave = joinedRooms[1];
    socket.leave(roomToLeave);

    //gå med i nytt rum
    socket.join(room);
    socket.currentRoom = room;

    console.log(`${socket.id} has joined ${room}.`);

    socket.emit("join_room", room);
    const messageHistory = await getMessages(socket.currentRoom);
    socket.emit("room_messages", messageHistory);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    console.log(`${socket.id} has left room ${room}.`);
  });

  socket.on("message", async (message) => {
    const id = await addMessage(message);
    const newMessage = await getMessage(id);
    // const [{ message: ifMessage }] = newMessage;

    console.log(`${socket.id} har skickat ${message.message}.`);
    io.to(socket.currentRoom).emit("message", newMessage);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Server has disconnected. Reason ${reason}.`);
  });
});

httpServer.listen(4000);
