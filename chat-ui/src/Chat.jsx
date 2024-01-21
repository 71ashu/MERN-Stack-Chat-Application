import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import NewChatForm from "./NewChatForm";
import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/solid';
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Messages from "./Messages";

const ChatsList = ({chats, id, selectedChatId, setSelectedChatId, onlinePeople}) => {
  return (
    <div className="flex-1 overflow-auto flex flex-col gap-2">
      {chats.map(({users, _id: chatId}) => {
        const { username, _id: userId } = users.find(u => u._id !== id);
        return (
          <div
            key={chatId}
            onClick={() => setSelectedChatId(chatId)}
            className={
              "px-[15px] py-[10px] rounded-md flex items-center gap-2 relative cursor-pointer hover:bg-blue-50 " +
              (chatId === selectedChatId ? "bg-blue-50" : "")
            }
          >
            <Avatar userId={userId} username={username} online={onlinePeople.has(userId)}/>
            <span>{username}</span>
          </div>
        );
      })}
    </div>
  );
}

const Chat = () => {
  const [ws, setWS] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [chats, setChats] = useState([]);

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

  const logout = () => {
    axios.post('/logout').then(() => {
      ws.close();
      setWS(null);
      setId(null);
      setUsername(null);
      navigate('/');
    });
  }

  const closeModal = () => {
    setShowForm(false);
  };

  const openModal = () => {
    setShowForm(true);
  };

  useEffect(() => {
    axios.get('/chats').then(res => setChats(res.data));
  }, []);

  return (
    <div className="bg-blue-50 h-screen">
      <div className="max-w-screen-xl md:w-full flex m-auto h-full shadow">
        <div className="bg-white basis-1/4 flex flex-col p-4">
          <div className="flex items-center border-b pb-4 mb-4">
            <div className="text-blue-600 font-bold flex-1">MERN Chat</div>
            <button className="p-1 px-3" onClick={openModal}>
              <PlusIcon className="size-5"/>
            </button>
            <NewChatForm userId={id} showForm={showForm} closeModal={closeModal}/>
          </div>
          <ChatsList chats={chats} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} id={id} onlinePeople={onlinePeople}/>
          <div className="border-t px-[15px] py-[10px] flex items-center gap-2 cursor-pointer" onClick={() => setShowDropDown(!showDropDown)}>
            <Avatar userId={id} username={username} online={true}/>
            <span className="flex-1">{username}</span>
            <span className="justify-self-end relative">
              <EllipsisVerticalIcon className="size-5" />
              <div className={"absolute rounded-md shadow bg-white transition-all right-0 " + (showDropDown ? "bottom-6 opacity-100 visible" : "bottom-0 opacity-0 invisible")}>
                <div className="p-2 cursor-pointer" onClick={logout}>Logout</div>
              </div>
            </span>
          </div>
        </div>
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
