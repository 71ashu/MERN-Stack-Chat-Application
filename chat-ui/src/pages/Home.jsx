import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { uniqBy } from "lodash";
import axios from 'axios';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Messages from "../components/chat/Messages";
import Sidebar from "../components/sidebar/Sidebar";
import { useNavigate } from "react-router-dom";



const Home = () => {
  const [ws, setWS] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { id, setId, setUsername } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
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
      console.log('Disconnected. Trying to reconnect');
      setTimeout(() => connectToWS(), 1000);
    });
  }

  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      const onlineUsers = messageData.online.filter(({userId}) => userId !== id);
      setOnlinePeople(new Map(onlineUsers));
    } else if ("content" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  const sendMessage = (ev) => {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        chatId: selectedChatId,
        content: newMessageText
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        content: newMessageText,
        senderId: id,
        chatId: selectedChatId,
        _id: Date.now(),
        createdAt: new Date()
      },
    ]);
  };

  const messagesWithoutDupes = uniqBy(messages, "_id");

  useEffect(() => {
    if(selectedChatId) {
      axios.get(`/messages/${selectedChatId}`).then(res => setMessages(res.data));
    }
  }, [selectedChatId]);

  const handleLogout = () => {
    ws.close();
    setWS(null);
    setId(null);
    setUsername(null);
    navigate('/');
  }

  return (
    <div className="bg-blue-50 h-screen">
      <div className="max-w-screen-xl md:w-full flex m-auto h-full shadow">
        <Sidebar selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} onlinePeople={onlinePeople} handleLogout={handleLogout}/>
        <div className="bg-slate-200 flex-1 flex flex-col p-4">
          {!!selectedChatId && (
            <>
              <Messages messages={messagesWithoutDupes} id={id} />
              <div id="input-container" className="mt-4">
                <form className="flex gap-2" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="border-0 flex-1 rounded p-2"
                    placeholder="Type your message here"
                    value={newMessageText}
                    onChange={(ev) => setNewMessageText(ev.target.value)}
                  />
                  <button className="bg-indigo-600 rounded text-white p-2">
                    <PaperAirplaneIcon className="size-5" />
                  </button>
                </form>
              </div>
            </>
          )}
          {!selectedChatId && (
            <div className="flex flex-col flex-1 justify-center items-center text-center text-slate-400">
              <ChatBubbleLeftRightIcon className="size-20 mb-4"/>
              <h4 className="text-xl font-bold">It's nice to chat with someone</h4>
              <p>Pick a person from your left menu <br />and start a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
