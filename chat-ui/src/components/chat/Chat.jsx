import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import Messages from "./Messages";
import { useContext, useState } from "react";
import { uniqBy } from "lodash";
import { UserContext } from "../../context/UserContext";
import ChatHeader from "./ChatHeader";

const Chat = ({ ws, messages, setMessages, selectedChat }) => {
  const [newMessageText, setNewMessageText] = useState("");
  const { id } = useContext(UserContext);

  const sendMessage = (ev) => {
    ev.preventDefault();
    ws.send(
      JSON.stringify({
        chatId: selectedChat._id,
        content: newMessageText
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        content: newMessageText,
        senderId: id,
        chatId: selectedChat._id,
        _id: Date.now(),
        createdAt: new Date()
      },
    ]);
  };

  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className="bg-slate-200 flex-1 flex flex-col">
      {!!selectedChat && (
        <>
          <ChatHeader selectedChat={selectedChat} id={id}/>
          <Messages messages={messagesWithoutDupes} id={id} />
          <div id="input-container" className="p-4">
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
      {!selectedChat && (
        <div className="flex flex-col flex-1 justify-center items-center text-center text-slate-400">
          <ChatBubbleLeftRightIcon className="size-20 mb-4" />
          <h4 className="text-xl font-bold">It's nice to chat with someone</h4>
          <p>
            Pick a person from your left menu <br />
            and start a conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
