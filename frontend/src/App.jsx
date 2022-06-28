import { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";
//import { nanoid } from "nanoid";

const socket = io("http://localhost:4000");
//const key = nanoid(4);

function App() {
  const [roomname, setRoomname] = useState("");
  const [message, setMessage] = useState("");
  const [createdRoom, setCreatedRoom] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [rooms, setRooms] = useState([]);
  // const [selectedRoom, setSelectedRoom] = useState(0)

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected to socketID ${socket.id}.`);
    });

    socket.on("join_room", (room) => {
      console.log(` ${socket.id} has joined the room: ${room}.`);
    });

    socket.on("room_messages", (messageHistory) => {
      setMessageHistory(messageHistory);
    });

    socket.on("leave_room", (room) => {
      console.log(`${room} has left the room.`);
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Server disconnected. Reason ${reason}.`);
    });

    socket.on("create_room", (data) => {
      console.log(`User ${socket.id} created room: ${data}.`);
    });

    socket.on("rooms", (availableRooms) => {
      setRooms(availableRooms);
    });

    return () => {
      socket.off();
    };
  }, []);

  function handleMessage(message) {
    socket.emit("message", message);
  }

  function joinRoom(roomname) {
    socket.emit("join_room", roomname);
  }

  function leaveRoom(roomname) {
    socket.emit("leave_room", roomname);
  }

  function createRoom(createdRoom) {
    socket.emit("create_room", createdRoom);
  }

  // if (!messageHistory) return <p>Loading...</p>;
  // console.log(messageHistory);

  return (
    // lägg till en ul- med meddelanden som visas och vilket rum man befinner sig i inkl. användare hämtat från databas.
    <div className="App">
      <header className="App-header">
        <div className="chatbox">
          {messageHistory.map(({ user, created_at, message }) => (
            <p>
              {user}, {created_at}: {message}.
            </p>
          ))}
        </div>
        <div className="message">
          <input
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={() => handleMessage(message)}>Send message</button>
        </div>

        {/* lägg till rullist med rumnamn som hämtas från databas istället för inputfält! */}
        <div className="room">
          {/* <input
            name="roomname"
            value={roomname}
            onChange={(e) => setRoomname(e.target.value)}
          /> */}

          <select onChange={(e) => setRoomname(e.target.value)}>
            {rooms.map(({ id, room }) => (
              <option name="room" value={room}>
                {room}
              </option>
            ))}
          </select>

          <button onClick={() => joinRoom(roomname)}>Join room</button>
          <button onClick={() => leaveRoom(roomname)}>Leave room</button>
        </div>
        {/*  Se ovan */}

        <div className="create_room">
          <input
            name="createdRoom"
            value={createdRoom}
            onChange={(e) => setCreatedRoom(e.target.value)}
          />
          <button onClick={() => createRoom(createdRoom)}>Create Room</button>
        </div>
      </header>
    </div>
  );
}

export default App;
