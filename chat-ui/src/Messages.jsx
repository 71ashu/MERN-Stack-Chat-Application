import { useEffect, useRef } from "react";
import { compareAsc, format } from "date-fns";

const Messages = ({ messages, id }) => {
  const messagesDivRef = useRef();

  useEffect(() => {
    const div = messagesDivRef.current;
    if (div) div.scrollTo(0, div.scrollHeight);
  }, [messages]);

  const formatMessageTimestamp = (date) => {
    if (date) return format(new Date(date), "hh:mm aaa");
    return "";
  };

  const MessageDate = ({ index }) => {
    let dateFormat = "MMM dd";
    let currentDate = new Date(messages[index].createdAt);
    const currentYear = new Date().getFullYear();
    if(currentYear !== currentDate.getFullYear()) dateFormat = "MMM dd, yyyy";
    currentDate = format(currentDate, dateFormat);

    const DateDiv = ({ date }) => (
      <div className="flex items-center">
        <hr className="flex-1 border-slate-300" />
        <div className="text-slate-400 text-sm px-2">{date}</div>
        <hr className="flex-1 border-slate-300" />
      </div>
    );

    if(index > 0) {
      const previousDate = format(new Date(messages[index - 1].createdAt), dateFormat);
      const newDateFound = compareAsc(currentDate, previousDate) === 1;
      return (<>{newDateFound && (<DateDiv date={currentDate} />)}</>);
    }
    return (<DateDiv date={currentDate} />);
  }

  return (
    <div ref={messagesDivRef} className="flex-1 grid overflow-auto scroll-smooth">
      <div className="flex flex-col gap-2 self-end">
        {messages.map((message, index) => (
          <>
            <MessageDate index={index} />
            {message.senderId === id ? (
              <div key={message._id} className="self-end grid justify-items-end">
                <div className="inline-flex rounded-md shadow p-2 bg-blue-500 text-white">
                  {message.content}
                </div>
                <span className="text-xs text-slate-400">
                  {formatMessageTimestamp(message.createdAt)}
                </span>
              </div>
            ) : (
              <div key={message._id} className="self-start grid justify-items-start">
                <div className="inline-flex rounded-md shadow p-2 bg-white">
                  {message.content}
                </div>
                <span className="text-xs text-slate-400">
                  {formatMessageTimestamp(message.createdAt)}
                </span>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default Messages;
