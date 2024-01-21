import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {setUsername: setLoggedInUsername, setId} = useContext(UserContext);
    const navigate = useNavigate();

    const registerAPI = async (ev) => {
        ev.preventDefault();
        const {data} = await axios.post('/register', { username, password });
        setLoggedInUsername(username);
        setId(data.id);
        navigate('/home');
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center justify-center">
            <form action="w-64" onSubmit={registerAPI}>
                <input type="text" name="" id="" placeholder="username" className="block w-full mb-2 p-2 border rounded" onChange={ev => setUsername(ev.target.value)}/>
                <input type="password" name="" id="" placeholder="password" className="block w-full mb-2 p-2 border rounded" onChange={ev => setPassword(ev.target.value)}/>
                <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded">Register</button>
                <div className="text-center mt-2">
                    Already a member? 
                    <Link to={'/'}>Login</Link>
                </div>
            </form>
        </div>
    )
}

export default Register;