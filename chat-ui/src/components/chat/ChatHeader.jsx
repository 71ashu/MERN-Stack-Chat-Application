import { useEffect } from "react";
import Avatar from "../Avatar";

const ChatHeader = ({ selectedChat, id }) => {
    const { username, _id: userId } = selectedChat.users.find((u) => u._id !== id);
    return (
        <div className="p-4 pb-0">
            <div className="flex items-center">
                <Avatar
                userId={userId}
                username={username}
                //   online={onlinePeople.has(userId)}
                />
                <span className="ml-2">{username}</span>
            </div>
            <hr className="border-slate-300 mt-4"/>
        </div>
    );
};

export default ChatHeader;