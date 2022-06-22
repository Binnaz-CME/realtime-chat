import { useState, useEffect } from "react";
import "./App.css";
import io from 'socket.io-client'

const socket = io('http://localhost:4000');

function App() {
  const [socketId, setSocketId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(()=> {
    socket.on('connect', () => {
      console.log(`Connected to socketID ${socket.id}`)
    })

    socket.on('disconnect', (reason) =>{
      console.log(`Server disconnected. Reason ${reason}`)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  },[])

  function handleMessage() {
    console.log("message sent");
  }

  function joinRoom() {
    console.log("joined room");
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="message">
          <input
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button onClick={handleMessage}>Send message</button>
        </div>
        <div className="room">
          <input
            name="socketId"
            value={socketId}
            onChange={(e) => setSocketId(e.target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
        </div>
      </header>
    </div>
  );
}

export default App;
