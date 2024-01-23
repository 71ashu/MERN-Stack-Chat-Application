import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Sidebar from "../components/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import Chat from "../components/chat/Chat";

const Home = () => {
  const [ws, setWS] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { id, setId, setUsername } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    connectToWS();
  }, [selectedChatId]);

  const connectToWS = () => {
    const ws = new WebSocket("ws://localhost:4000");
    setWS(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      console.log("Disconnected. Trying to reconnect");
      setTimeout(() => connectToWS(), 1000);
    });
  };

  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      const onlineUsers = messageData.online.filter(
        ({ userId }) => userId !== id
      );
      setOnlinePeople(new Map(onlineUsers));
    } else if ("content" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      axios
        .get(`/messages/${selectedChatId}`)
        .then((res) => setMessages(res.data));
    }
  }, [selectedChatId]);

  const handleLogout = () => {
    ws.close();
    setWS(null);
    setId(null);
    setUsername(null);
    navigate("/");
  };

  return (
    <div className="bg-blue-50 h-screen">
      <div className="max-w-screen-xl md:w-full flex m-auto h-full shadow">
        <Sidebar
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          onlinePeople={onlinePeople}
          handleLogout={handleLogout}
        />
        <Chat
          ws={ws}
          messages={messages}
          setMessages={setMessages}
          selectedChatId={selectedChatId}
        />
      </div>
    </div>
  );
};

export default Home;
