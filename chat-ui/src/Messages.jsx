import { useEffect, useRef } from "react";
import { format } from "date-fns";

const formatDate = (date) => {
  if(date) return format(new Date(date), "hh:mm aaa");
  return '';
};

const Messages = ({ messages, id }) => {
  const messagesDivRef = useRef();

  useEffect(() => {
    const div = messagesDivRef.current;
    if (div) div.scrollTo(0, div.scrollHeight);
  }, [messages]);

  return (
    <div
      ref={messagesDivRef}
      className="flex-1 flex flex-col gap-2 overflow-auto scroll-smooth"
    >
      {messages.map((message) => {
        if (message.senderId === id)
          return (
            <div key={message._id} className="self-end grid justify-items-end">
              <div className="inline-flex rounded-md shadow p-2 bg-blue-500 text-white">
                {message.content}
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(message.createdAt)}
              </span>
            </div>
          );
        else
          return (
            <div key={message._id} className="self-start grid justify-items-start">
              <div className="inline-flex rounded-md shadow p-2 bg-white">
                {message.content}
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(message.createdAt)}
              </span>
            </div>
          );
      })}
    </div>
  );
};

export default Messages;
