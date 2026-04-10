import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const incorrectUserToast = () => {
    toast("Wrong email or password");
  };

  function loginHandler(e) {
    e.preventDefault();
    if (!email || !password) {
      return alert("All fields are required");
    }
    axios
      .post(
        `${API}/api/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        setUser(res.data.user);
        navigate("/");
      })
      .catch((err) => {
        if (err.response.status === 401 || err.response.status === 404) {
          incorrectUserToast();
        }
        console.log(err);
      });
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans px-4 md:px-0">
      <div className="flex flex-col md:flex-row flex-wrap w-full md:w-[900px] md:h-[550px] bg-[#1a1f29] rounded-2xl overflow-hidden shadow-xl">
        {/* LEFT PANEL */}
        <div className="w-full md:w-[40%] bg-[#3c2a55] text-white flex flex-col justify-center items-center p-8 md:p-10">
          <div className="text-2xl font-bold mb-8">QuickChat</div>
          <h2 className="text-2xl font-semibold mb-3">Welcome Back.</h2>
          <div className="text-gray-300 text-sm mb-8">
            <span className="underline font-medium">LOG IN</span>
            <span
              className="opacity-70 ml-2 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              SIGN UP
            </span>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 text-center mt-auto">
            TERMS OF USE AND CONDITIONS
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[60%] bg-[#161b22] flex flex-col items-center justify-center relative px-6 py-8 md:px-10 md:py-0">
          <h2 className="text-white text-xl md:text-2xl font-semibold mb-8 md:mb-10">
            LOG IN
          </h2>

          <form className="w-full max-w-md space-y-5" onSubmit={loginHandler}>
            <input
              type="email"
              placeholder="Email or Username"
              className="w-full bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-gray-400 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="hover:text-white underline whitespace-nowrap"
              >
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
