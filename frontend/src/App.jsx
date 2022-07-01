import { useState, useEffect } from "react";
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
  const [joinRoomMessage, setJoinRoomMessage] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`Connected to socketID ${socket.id}.`);
    });

    socket.on("create_room", (createdRoom) => {
      setRooms((prevrooms) => [...prevrooms, ...createdRoom]);
    });

    socket.on("join_room", (room) => {
      console.log("from join_room(socket.on) function:", room);
      setJoinRoomMessage(`You joined room ${room}`);
      setJoined(true);
    });

    socket.on("room_messages", (messages) => {
      setMessageHistory(messages);
    });

    socket.on("message", (newMessage) => {
      console.log("from message(socket.on) function", newMessage);
      setMessageHistory((prevmessageHistory) => [
        ...prevmessageHistory,
        ...newMessage,
      ]);
    });

    socket.on("rooms", (availableRooms) => {
      setRooms(availableRooms);
    });

    socket.on("leave_room", (room) => {
      console.log(`You left room ${room}`);
      setJoined(false);
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
    console.log("from handleMessage function", message);
    socket.emit("message", message);
  }

  function joinRoom(roomname) {
    console.log("from joinRoom function:", roomname);
    socket.emit("join_room", roomname);
  }

  function leaveRoom(roomname) {
    console.log("from leaveRoom function:", roomname);
    socket.emit("leave_room", roomname);
    joinRoom("default");
  }

  function createRoom(createdRoom) {
    socket.emit("create_room", createdRoom);
  }

  function handleUsername(username) {
    if (username) {
      setReady(true);
    }
    joinRoom("default");
  }

  function deleteRoom(roomname) {
    socket.emit("delete_room", roomname);
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
              <textarea
                rows="5"
                cols="50"
                className="chatInput"
                name="message"
                value={message.message}
                onChange={(e) =>
                  // låt servern hantera allt förrutom message.
                  setMessage({
                    timestamp: Date(),
                    user: username,
                    room: roomname,
                    message: e.target.value,
                  })
                }
              ></textarea>
              <button onClick={() => handleMessage(message)}>
                Send message
              </button>
            </div>
            <div className="room">
              <p>
                Hi, {username}! Choose a room to join or create one to chat:
              </p>
              <select onChange={(e) => setRoomname(e.target.value)}>
                {rooms.map(({ id, room }) => (
                  <option key={id} name="room" value={room}>
                    {room}
                  </option>
                ))}
              </select>
              <button onClick={() => joinRoom(roomname)}>Join room</button>
              <button onClick={() => leaveRoom(roomname)}>Leave room</button>
              <button onClick={() => deleteRoom(roomname)}>Delete room</button>
            </div>
            <p>{joined ? joinRoomMessage : null}</p>
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
