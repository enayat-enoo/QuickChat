import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatList: [],
    status: "idle",
    activeChat: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    updateChatList: (state, action) => {
      const  data  = action.payload;
      const existingChat = state.chatList.find((chat) => chat._id === data.chatId);

      if (existingChat) {
        existingChat.lastMessage = data.lastMessage;

        state.chatList = [
          existingChat,
          ...state.chatList.filter((c) => c._id !== data.chatId),
        ];
      } else {
        state.chatList.unshift(data);
      }
    },
  },

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

export const { setActiveChat, updateChatList } = chatSlice.actions;
export default chatSlice.reducer;
