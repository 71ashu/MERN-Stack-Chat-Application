import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/24/outline";
import NewChatForm from './NewChatForm';
import Avatar from "../Avatar";

const ChatsList = ({
  chats,
  id,
  selectedChatId,
  setSelectedChatId,
  onlinePeople,
}) => {
  return (
    <div className="flex-1 overflow-auto flex flex-col gap-2">
      {chats.map(({ users, _id: chatId }) => {
        const { username, _id: userId } = users.find((u) => u._id !== id);
        return (
          <div
            key={chatId}
            onClick={() => setSelectedChatId(chatId)}
            className={
              "px-[15px] py-[10px] rounded-md flex items-center gap-2 relative cursor-pointer hover:bg-blue-50 " +
              (chatId === selectedChatId ? "bg-blue-50" : "")
            }
          >
            <Avatar
              userId={userId}
              username={username}
              online={onlinePeople.has(userId)}
            />
            <span>{username}</span>
          </div>
        );
      })}
    </div>
  );
};

const Sidebar = ({ selectedChatId, setSelectedChatId, onlinePeople, handleLogout }) => {
	const [showDropDown, setShowDropDown] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [chats, setChats] = useState([]);
	const { username, id } = useContext(UserContext);
	

  const logout = () => {
    axios.post('/logout').then(handleLogout);
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
    <div className="bg-white basis-1/4 flex flex-col p-4">
      <div className="flex items-center border-b pb-4 mb-4">
        <div className="text-blue-600 font-bold flex-1">MERN Chat</div>
        <button className="p-1 px-3" onClick={openModal}>
          <PlusIcon className="size-5" />
        </button>
        <NewChatForm userId={id} showForm={showForm} closeModal={closeModal} />
      </div>
      <ChatsList
        chats={chats}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        id={id}
        onlinePeople={onlinePeople}
      />
      <div
        className="border-t px-[15px] py-[10px] flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDropDown(!showDropDown)}
      >
        <Avatar userId={id} username={username} online={true} />
        <span className="flex-1">{username}</span>
        <span className="justify-self-end relative">
          <EllipsisVerticalIcon className="size-5" />
          <div
            className={
              "absolute rounded-md shadow bg-white transition-all right-0 " +
              (showDropDown
                ? "bottom-6 opacity-100 visible"
                : "bottom-0 opacity-0 invisible")
            }
          >
            <div className="p-2 cursor-pointer" onClick={logout}>
              Logout
            </div>
          </div>
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
