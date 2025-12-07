import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";

//API call to fetch chat list
export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async () => {
    const { data } = await axios.get(
      "http://localhost:8001/api/message/getchats",
      {
        withCredentials: true,
      }
    );
    return data.data || data;
  }
);


// Redux slice for chat state management to store chat list and active chat
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatList: [],
    status: "idle",
    activeChat: null,
  },

  // Reducers for chat state management
  reducers: {

    //It keeps track of the user which is currently being chatted
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    //It updates the chat list when a new message is received
    updateChatList: (state, action) => {
      const data = action.payload;
      const existingChat = state.chatList.find(
        (chat) => chat._id === data.chatId
      );
      if (existingChat) {
        existingChat.lastMessage = {
          ...existingChat.lastMessage,
          content: data.content,
          updatedAt: new Date().toISOString(),
        };
      } else {
        state.chatList.unshift(data);
      }
    },

    //It updates the online status of the users in the chat list
    updateOnlineStatus : (state,action)=>{
      const userId = action.payload;
      state.chatList.forEach(chat => chat.participants.forEach(participant=> participant._id === userId && (participant.isOnline = true)));
      if(state.activeChat){
        state.activeChat.participants.forEach(participant=> participant._id === userId && (participant.isOnline = true));
      }
    },

    //It updates the offline status of the users in the chat list
    updateOfflineStatus : (state,action)=>{
      const {userId, lastSeen} = action.payload;
      state.chatList.forEach(chat => chat.participants.forEach(participant=> participant._id === userId && (participant.isOnline = false,participant.lastSeen = lastSeen)));
      if(state.activeChat){
        state.activeChat.participants.forEach(participant=> participant._id === userId && (participant.isOnline = false,participant.lastSeen = lastSeen));
      }
    },
  },


  // Extra reducers for chat state management
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chatList = action.payload;
      })
      .addCase(fetchChatList.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setActiveChat, updateChatList,updateOnlineStatus,updateOfflineStatus } = chatSlice.actions;
export default chatSlice.reducer;
