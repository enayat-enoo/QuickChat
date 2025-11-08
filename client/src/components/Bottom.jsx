
import { LogOut, Settings } from "lucide-react";
export default function Bottom({props}){
    const { logoutHandler } = props;
    return(
         <div className="border-t border-gray-600 pt-4 flex justify-between">
            <button className="flex items-center text-gray-300 hover:text-white gap-2 text-sm">
              <Settings size={18} /> Settings
            </button>
            <button
              className="flex items-center text-gray-300 hover:text-white gap-2 text-sm"
              onClick={logoutHandler}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
    )
}