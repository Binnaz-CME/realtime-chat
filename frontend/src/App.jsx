import { useState, useEffect, useReducer } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [roomname, setRoomname] = useState("default");
  const [message, setMessage] = useState({ message: "" });
  const [createdRoom, setCreatedRoom] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [username, setUsername] = useState("");
  const [ready, setReady] = useState(false);
  const [ifJoinedRoom, setJoinedRomm] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected to socketID ${socket.id}.`);
    });

    socket.on("join_room", (room) => {
      console.log(` ${socket.id} has joined the room: ${room}.`);
    });

    socket.on("room_messages", (messages) => {
      setMessageHistory(messages);
    });

    socket.on("leave_room", (room) => {
      console.log(`${room} has left the room.`);
    });

    socket.on("message", (newMessage) => {
      setMessageHistory((prevmessageHistory) => [
        ...prevmessageHistory,
        ...newMessage,
      ]);
    });

    socket.on("create_room", (createdRoom) => {
      console.log("createdroom:", createdRoom);
      setRooms((prevrooms) => [...prevrooms, ...createdRoom]);
    });

    socket.on("rooms", (availableRooms) => {
      setRooms(availableRooms);
    });

    socket.on("delete_room", (newRooms) => {
      setRooms(newRooms);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Server disconnected. Reason ${reason}.`);
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
    setJoinedRomm(true);
  }

  function leaveRoom(roomname) {
    socket.emit("leave_room", roomname);
    joinRoom("default");
    setJoinedRomm(false);
  }

  function createRoom(createdRoom) {
    socket.emit("create_room", createdRoom);
  }

  function handleUsername(username) {
    console.log(username);
    if (username) {
      setReady(true);
    }
    joinRoom("default");
  }

  function deleteRoom(roomname) {
    socket.emit("delete_room", roomname);
    console.log(`Room deleted: ${roomname}`);
  }

  return (
    <div className="App App-header">
      {!ready ? (
        <div className="username">
          <h2>Create a username to join chat</h2>
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => handleUsername(username)}>Join chat</button>
        </div>
      ) : (
        <div className="App">
          <header className="App-header">
            <div className="chatbox">
              {messageHistory.map(({ id, user, created_at, message }) => (
                <p key={id}>
                  <small>{created_at}:</small> <em>{user}:</em> {message}
                </p>
              ))}
            </div>
            <div className="message">
              <input
                name="message"
                value={message.message}
                onChange={(e) =>
                  setMessage({
                    user: username,
                    room: roomname,
                    message: e.target.value,
                  })
                }
              />
              <button onClick={() => handleMessage(message)}>
                Send message
              </button>
            </div>
            <div className="room">
              <p>Choose a room to join or create one:</p>
              <select onChange={(e) => setRoomname(e.target.value)}>
                {rooms.map(({ id, room }) => (
                  <option key={id} name="room" value={room}>
                    {room}
                  </option>
                ))}
              </select>
              <p>
                {ifJoinedRoom
                  ? `You joined room ${roomname}!`
                  : `You left room ${roomname}!`}
              </p>
              <button onClick={() => joinRoom(roomname)}>Join room</button>
              <button onClick={() => leaveRoom(roomname)}>Leave room</button>
              <button onClick={() => deleteRoom(roomname)}>Delete room</button>
            </div>
            <div className="create_room">
              <input
                name="createdRoom"
                value={createdRoom}
                onChange={(e) => setCreatedRoom(e.target.value)}
              />
              <button onClick={() => createRoom(createdRoom)}>
                Create Room
              </button>
            </div>
          </header>
        </div>
      )}
    </div>
  );
}

export default App;
