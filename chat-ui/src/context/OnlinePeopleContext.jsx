import { createContext, useState } from "react";

export const OnlinePeopleContext = createContext([]);

export const OnlinePeopleProvider = ({ children }) => {
    const [onlinePeople, setOnlinePeople] = useState([]);
    return (
        <OnlinePeopleContext.Provider value={{ onlinePeople, setOnlinePeople }}>
            {children}
        </OnlinePeopleContext.Provider>
    );
}