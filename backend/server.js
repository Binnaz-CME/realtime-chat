const { Socket } = require("dgram");
const express = require("express");
const { createServer } = require("http");
const { join } = require("path");
const { Server } = require("socket.io");
const knex = require("./data/db.js");

const app = express();
const httpServer = createServer(app);

async function getMessages(room) {
  const result = await knex("messages").select().where({ room: room });
  return result;
}

async function getRooms() {
  const result = await knex("rooms").select();
  return result;
}

async function getRoom(id) {
  const foundRoom = await knex("rooms").select().where({ id: id });
  return foundRoom;
}

async function addRoom(room) {
  const id = await knex("rooms").insert(room);
  return id;
}

async function addMessage({ user, room, message }) {
  if (message) {
    const id = await knex("messages").insert({ user, room, message });
    return id;
  } else {
    return null;
  }
}

async function getMessage(id) {
  const newMessage = await knex("messages").select().where({ id: id });
  return newMessage;
}

async function deleteRoom(room) {
  await knex("rooms").where({ room: room }).del();
}

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

  socket.on("create_room", async (room) => {
    const foundRoom = createdRooms.find((r) => r.room === room);

    if (!foundRoom) {
      const roomId = await addRoom({ room });
      const newRoom = await getRoom(roomId);
      socket.emit("create_room", newRoom);
    }
  });

  socket.on("join_room", async (room) => {
    console.log(`${socket.id} has joined ${room}.`);

    //avgöra vilka rum som klient är med i och gå ur det senaste.
    const joinedRooms = Array.from(socket.rooms);
    const roomToLeave = joinedRooms[1];
    socket.leave(roomToLeave);

    //gå med i nytt rum
    socket.join(room);
    socket.currentRoom = room;

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

    io.to(socket.currentRoom).emit("message", newMessage);
  });

  socket.on("delete_room", async (room) => {
    await deleteRoom(room);
    const newRooms = await getRooms();

    socket.emit("delete_room", newRooms);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Server has disconnected. Reason ${reason}.`);
  });
});

httpServer.listen(4000);
