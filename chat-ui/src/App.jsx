import axios from 'axios'
import { UserContextProvider } from "./UserContext";
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CheckAuth from './Auth';
import Chat from './Chat';

function App() {
  axios.defaults.baseURL = 'http://localhost:4000';
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <Routes>
        <Route path='' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/chats' element={<CheckAuth><Chat /></CheckAuth>}></Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App
