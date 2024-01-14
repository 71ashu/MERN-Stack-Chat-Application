import { useContext, useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Users = ({onlinePeople, selectedUserId, setSelectedUserId}) => {
  return (
    <div className="flex-1 overflow-auto">
      {onlinePeople.map(({userId, username}) => (
        <div
          key={userId}
          onClick={() => setSelectedUserId(userId)}
          className={
            "border-b border-gray-100 px-[15px] py-[10px] flex items-center gap-2 relative cursor-pointer " +
            (userId === selectedUserId ? "bg-blue-50" : "")
          }
        >
          {userId === selectedUserId && (
            <div className="w-1 bg-blue-500 h-full rounded-r-md absolute left-0 top-0"></div>
          )}
          <Avatar userId={userId} username={username} />
          <span>{username}</span>
        </div>
      ))}
    </div>
  );
}

const Chat = () => {
  const [ws, setWS] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesDivRef = useRef();
  const [showDropDown, setShowDropDown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    connectToWS();
  }, []);

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
      setOnlinePeople(messageData.online.filter(({userId}) => userId !== id));
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  const sendMessage = (ev) => {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        id: Date.now(),
      },
    ]);
  };

  const messagesWithoutDupes = uniqBy(messages, "_id");

  useEffect(() => {
    const div = messagesDivRef.current;
    if (div) div.scrollTo(0, div.scrollHeight);
  }, [messages]);

  useEffect(() => {
    if(selectedUserId) {
      axios.get(`/messages/${selectedUserId}`).then(res => setMessages(res.data));
    }
  }, [selectedUserId]);

  const logout = () => {
    axios.post('/logout').then(() => {
      setWS(null);
      setId(null);
      setUsername(null);
      navigate('/');
    });
  }

  return (
    <div className="bg-blue-50 h-screen">
      <div className="max-w-screen-xl md:w-full flex m-auto h-full shadow">
        <div className="bg-white basis-1/4 flex flex-col">
          <div className="text-blue-600 font-bold mb-4 p-2">MERN Chat</div>
          <Users onlinePeople={onlinePeople} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />
          <div className="border-t px-[15px] py-[10px] flex items-center gap-2 cursor-pointer" onClick={() => setShowDropDown(!showDropDown)}>
            <Avatar userId={id} username={username} />
            <span className="flex-1">{username}</span>
            <span className="justify-self-end relative">
              :
              <div className={"absolute rounded-md shadow bg-white transition-all right-0 " + (showDropDown ? "bottom-6 opacity-100 visible" : "bottom-0 opacity-0 invisible")}>
                <div className="p-2 cursor-pointer" onClick={logout}>Logout</div>
              </div>
            </span>
          </div>
        </div>
        <div className="bg-slate-200 flex-1 flex flex-col p-4">
          {!!selectedUserId && (
            <>
              <div ref={messagesDivRef} className="flex-1 flex flex-col gap-2 overflow-auto scroll-smooth">
                {messagesWithoutDupes.map((message) => (
                  <div key={message._id}
                    className={
                      "rounded-md shadow p-2 " +
                      (message.sender === id
                        ? "bg-blue-500 text-white self-end"
                        : "bg-white self-start")
                    }
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <div id="input-container" className="mt-4">
                <form className="flex gap-2" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="border-0 flex-1 rounded p-2"
                    placeholder="Type your message here"
                    value={newMessageText}
                    onChange={(ev) => setNewMessageText(ev.target.value)}
                  />
                  <button className="bg-indigo-600 rounded text-white p-2 px-5">
                    Send
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
