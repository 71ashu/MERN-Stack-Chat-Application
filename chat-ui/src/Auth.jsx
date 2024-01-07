import { useContext } from "react";
import { UserContext } from "./UserContext";
import Login from "./Login";


const CheckAuth = ({ children }) => {
    const {username} = useContext(UserContext);
  
    if(username) return children;
  
    return <Login />;
}

export default CheckAuth;