import {useNavigate} from "react-router-dom";
export default function Sidebar(props) {
  const navigate = useNavigate();
  const { contacts} = props;
  console.log(contacts);
  return (
    <div>
      {contacts.map((c) => (
        <div
          key={c.id}
          className={`p-3 rounded-lg cursor-pointer ${
            c.active ? "bg-[#161b22]" : "hover:bg-[#2a2f3a]"
          }`}
          onClick={()=>navigate(`/chat/${c._id}`)}
        >
          <p className="font-medium text-gray-300">{c.participants[1].name}</p>
          <p className="text-sm text-gray-400 truncate">{c.lastMessage.content}</p>
        </div>
      ))}
    </div>
  );
}
