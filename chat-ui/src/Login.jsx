import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {setUsername: setLoggedInUsername, setId} = useContext(UserContext);
    const navigate = useNavigate();

    const loginAPI = async (ev) => {
        ev.preventDefault();
        const {data} = await axios.post('/login', { username, password });
        setLoggedInUsername(username);
        setId(data.id);
        navigate('/chats');
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center justify-center">
            <form action="w-64" onSubmit={loginAPI}>
                <input type="text" name="" id="" placeholder="username" className="block mb-2 p-2 w-full border rounded" onChange={ev => setUsername(ev.target.value)}/>
                <input type="password" name="" id="" placeholder="password" className="block mb-2 w-full p-2 border rounded" onChange={ev => setPassword(ev.target.value)}/>
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Login</button>
                <div className="text-center mt-2">
                    Don't have an account? 
                    <Link to={'/register'}>Register</Link>
                </div>
            </form>
        </div>
    )
}

export default Login;