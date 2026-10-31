import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const fetchChatList = createAsyncThunk(
  "chat/fetchChatList",
  async () => {
    const { data } = await axios.get(`${API}/api/message/getchats`, {
      withCredentials: true,
    });
    return data.data || data;
  },
);

// Helper — pick a sortable timestamp from a chat. Falls back to the chat's
// own updatedAt if lastMessage has none (shouldn't happen, but defensive).
function chatTimestamp(chat) {
  const raw = chat.lastMessage?.updatedAt || chat.updatedAt;
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(t) ? 0 : t;
}

// Helper — mutate every participant matching userId in both the chatList
// and the activeChat, then keep chatList sorted.
function patchParticipantStatus(state, userId, isOnline, lastSeen) {
  const apply = (participant) => {
    if (participant._id !== userId) return;
    participant.isOnline = isOnline;
    if (lastSeen !== undefined) participant.lastSeen = lastSeen;
  };

  state.chatList.forEach((chat) => {
    (chat.participants || []).forEach(apply);
  });
  if (state.activeChat) {
    (state.activeChat.participants || []).forEach(apply);
  }
}

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatList: [],
    status: "idle",
    error: null,
    activeChat: null,
  },

  reducers: {
    setActiveChat: (state, action) => {
      const payload = action.payload;
      const chat = payload?.chat ?? payload;
      const userId = payload?.userId ?? null;

      state.activeChat = chat;

      if (!chat?._id) return;

      const existing = state.chatList.find((c) => c._id === chat._id);
      if (!existing?.participantInfo || !userId) return;

      const mine = existing.participantInfo[String(userId)];
      if (mine && typeof mine.unreadCount === "number") {
        mine.unreadCount = 0;
      }
    },

    updateChatList: (state, action) => {
      const data = action.payload;
      const existingChat = state.chatList.find((c) => c._id === data.chatId);

      if (!existingChat) {
        // Do NOT unshift a raw { chatId, content } payload — it would
        // render as a chat with no _id / participants. The caller should
        // refetch chatList if this happens (e.g. chat created via search).
        return;
      }

      const now = new Date().toISOString();
      existingChat.lastMessage = {
        ...(existingChat.lastMessage || {}),
        content: data.content,
        updatedAt: now,
      };
      existingChat.updatedAt = now;

      // Re-sort so the active chat jumps to the top.
      state.chatList.sort((a, b) => chatTimestamp(b) - chatTimestamp(a));
    },

    updateOnlineStatus: (state, action) => {
      patchParticipantStatus(state, action.payload, true, undefined);
    },

    updateOfflineStatus: (state, action) => {
      const { userId, lastSeen } = action.payload;
      patchParticipantStatus(state, userId, false, lastSeen);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChatList.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchChatList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chatList = action.payload;
      })
      .addCase(fetchChatList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load chats";
      });
  },
});

export const {
  setActiveChat,
  updateChatList,
  updateOnlineStatus,
  updateOfflineStatus,
} = chatSlice.actions;
export default chatSlice.reducer;
