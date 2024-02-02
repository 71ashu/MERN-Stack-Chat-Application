import axios from 'axios'
import { UserContextProvider } from "./context/UserContext";
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckAuth from './auth/Auth';
import Home from './pages/Home';
import { OnlinePeopleProvider } from './context/OnlinePeopleContext';

function App() {
  axios.defaults.baseURL = 'http://localhost:4000';
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <Routes>
        <Route path='' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/home' element={
        <CheckAuth>
          <OnlinePeopleProvider>
            <Home />
          </OnlinePeopleProvider>
        </CheckAuth>
        }></Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App
