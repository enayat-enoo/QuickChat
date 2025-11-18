import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
    } else {
      setAvatar(null);
      setPreviewAvatar(null);
    }
  };

  function registerHandler(e) {
    e.preventDefault();
    if (!name || !email || !username || !password || !confirmPassword) {
      return alert("All fields are required");
    }
    if (password !== confirmPassword) {
      return alert("Password and Confirm Password do not match");
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    //API call
    axios
      .post("http://localhost:8001/api/register", formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        //Business logic
        navigate("/login");
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans">
      <div className="flex w-[900px] h-[550px] bg-[#1a1f29] rounded-2xl overflow-hidden shadow-xl">
        <div className="w-[40%] bg-[#3c2a55] text-white flex flex-col justify-center items-center p-10">
          <div className="text-2xl font-bold mb-8">QuickChat</div>
          <h2 className="text-2xl font-semibold mb-3">
            New User Registration.
          </h2>
          <div className="text-gray-300 text-sm mb-8">
            <span className="opacity-70" onClick={() => navigate("/login")}>
              LOG IN{" "}
            </span>
            <span className="underline ml-2 font-medium">SIGN UP</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-auto">
            TERMS OF USE AND CONDITIONS
          </p>
        </div>

        <div className="w-[60%] bg-[#161b22] flex flex-col items-center justify-center relative px-10">
          <h2 className="text-white text-2xl font-semibold mb-6">SIGN UP</h2>

          <div className="relative mb-6">
            <label htmlFor="avatar-upload">
              <img
                src={
                  previewAvatar ||
                  "https://via.placeholder.com/80x80/1e1e1e/ffffff?text=+"
                }
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 cursor-pointer"
              />
              <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
                +
              </div>
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <form
            className="grid grid-cols-2 gap-4 w-full max-w-md"
            onSubmit={registerHandler}
          >
            <input
              type="text"
              placeholder="Full Name"
              className="bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              className="bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="col-span-2 bg-[#20262e] text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-[#20262e] w-full text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
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

            <div className="relative">
              <input
                type={showRepeat ? "text" : "password"}
                placeholder="Repeat"
                className="bg-[#20262e] w-full text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowRepeat(!showRepeat)}
                className="absolute right-3 top-2.5 text-gray-400"
              >
                {showRepeat ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="col-span-2 flex justify-center mt-4">
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
