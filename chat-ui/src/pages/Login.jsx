import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const navigate = useNavigate();

  const loginAPI = async (ev) => {
    ev.preventDefault();
    const { data } = await axios.post("/login", { username, password });
    setLoggedInUsername(username);
    setId(data.id);
    navigate("/home");
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center justify-center">
      <div className="rounded bg-white p-12 shadow sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="text-center text-2xl font-semibold leading-9 tracking-tight text-gray-900 mb-10">
          Sign in to your account
        </h2>
        <form onSubmit={loginAPI}>
          <div>
            <label
              for="username"
              className="inline text-sm font-medium leading-6 text-gray-900"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <label
                for="password"
                className="inline text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              {/* <div className="text-sm">
                <a
                  href="#"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div> */}
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </div>
          </div>
          <div className="mt-10">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 px-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
          <div className="text-center mt-2">
            Don't have an account?{' '}
            <Link
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              to={"/register"}
              hrefLang="#"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
