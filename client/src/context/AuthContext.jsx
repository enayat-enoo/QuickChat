import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        axios.get('http://localhost:8001/api/user', {withCredentials: true})
        .then((res)=>{
            setUser(res.data.data);
            setLoading(false);
        })
        .catch((err)=>{
            console.log(err);
            setLoading(false);
        })
    },[]);
    return (
    <AuthContext.Provider value={{ user,setUser, loading }}>
        {children}
    </AuthContext.Provider>
)
}

