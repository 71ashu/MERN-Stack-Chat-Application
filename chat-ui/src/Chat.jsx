import { useContext, useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from 'axios';

const Chat = () => {
  const [ws, setWS] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesDivRef = useRef();

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

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
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

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

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

  return (
    <div className="bg-blue-50 h-screen">
      <div className="max-w-screen-xl md:w-full flex m-auto h-full shadow">
        <div className="bg-white basis-1/4">
          <div className="text-blue-600 font-bold mb-4 p-2">MERN Chat</div>
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
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
              <Avatar userId={userId} username={onlinePeople[userId]} />
              <span>{onlinePeople[userId]}</span>
            </div>
          ))}
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
              <div id="input-container" className="p-2">
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
