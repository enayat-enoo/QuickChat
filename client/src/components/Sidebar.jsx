import {useNavigate} from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveChat } from "../store/chatSlice";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
export default function Sidebar(props) {
  const navigate = useNavigate();
  const { contacts} = props;
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);

  return (
    <div>
      {contacts.map((c) => (
        <div
          key={c.id}
          className={`p-3 rounded-lg cursor-pointer ${
            c.active ? "bg-[#161b22]" : "hover:bg-[#2a2f3a]"
          }`}
          onClick={()=>{
            dispatch(setActiveChat(c))
            navigate(`/chat/${c._id}`)}
          }
        >
          <p className="font-medium text-gray-300">{c.participants[1].username===user.username ? c.participants[0].name : c.participants[1].name}</p>
          <p className="text-sm text-gray-400 truncate">{c.lastMessage.content}</p>
        </div>
      ))}
    </div>
  );
}
