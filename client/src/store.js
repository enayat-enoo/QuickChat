import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./store/userSlice";
import chatReducer from "./store/chatSlice";

const store = configureStore({
    reducer : {
        user : userReducer,
        chat : chatReducer
    }
})

export default store;