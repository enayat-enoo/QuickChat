import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const searchUser = createAsyncThunk("user/search", async (username) => {
  const { data } = await axios.get(
    `${API}/api/user/search?username=${username}`,
    {
      withCredentials: true,
    }
  );
  return data;
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    searchResults: [],
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchUser.pending, (state) => {
        state.status = "pending";
      })
      .addCase(searchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.searchResults.length = 0;
        state.searchResults.push(action.payload);
      })
      .addCase(searchUser.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default userSlice.reducer;
