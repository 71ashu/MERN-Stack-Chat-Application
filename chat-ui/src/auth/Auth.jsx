import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Login from "../pages/Login";


const CheckAuth = ({ children }) => {
    const {username} = useContext(UserContext);
  
    if(username) return children;
  
    return <Login />;
}

export default CheckAuth;