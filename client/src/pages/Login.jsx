import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { toast } from "react-toastify";
import  axios from "axios";
import { useSocket } from "../context/SocketContext";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { socket } = useSocket();
  const incorrectUserToast = () => {
    toast("Wrong email or password");
  }

  function loginHandler(e){
      e.preventDefault();
      if(!email || !password){
        return alert("All fields are required");
      }
      axios.post(`${API}/api/login`,{
        email,
        password,
      },{withCredentials: true})
      .then((res)=>{
        setUser(res.data.user);
        socket?.connect();
        navigate('/');
      })
      .catch((err)=>{
        if(err.response.status === 401 || err.response.status === 404){
          incorrectUserToast();
        }
        console.log(err);
      })
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans">
      <div className="flex w-[900px] h-[550px] bg-[#1a1f29] rounded-2xl overflow-hidden shadow-xl">
        <div className="w-[40%] bg-[#3c2a55] text-white flex flex-col justify-center items-center p-10">
          <div className="text-2xl font-bold mb-8">QuickChat</div>
          <h2 className="text-2xl font-semibold mb-3">Welcome Back.</h2>
          <div className="text-gray-300 text-sm mb-8">
            <span className="underline font-medium">LOG IN</span>
            <span className="opacity-70 ml-2" onClick={()=>navigate('/register')}>SIGN UP</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-auto">
            TERMS OF USE AND CONDITIONS
          </p>
        </div>

        <div className="w-[60%] bg-[#161b22] flex flex-col items-center justify-center relative px-10">
          <h2 className="text-white text-2xl font-semibold mb-10">LOG IN</h2>

          <form className="w-full max-w-md space-y-5" onSubmit={loginHandler}>
            <input
              type="email"
              placeholder="Email or Username"
              className="w-full bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                Remember me
              </label>
              <button type="button" className="hover:text-white underline">
                Forgot Password?
              </button>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-white text-black font-bold px-5 py-2 rounded-md hover:bg-gray-200 transition flex items-center justify-center"
              >
                »
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
