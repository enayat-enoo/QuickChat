import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
export const searchUser = createAsyncThunk("user/search", async (username) => {
  const { data } = await axios.get(`http://localhost:8001/api/user/search?username=${username}`, {
    withCredentials: true,
  });
  return data;
});


const userSlice = createSlice({
    name : "user",
    initialState : {
        searchResults  : [],
        status : "idle"
    },
    reducers : {},
    extraReducers : (builder)=>{
        builder
        .addCase(searchUser.pending, (state)=>{
            state.status = "pending";
        })
        .addCase(searchUser.fulfilled,(state,action)=>{
            state.status = "succeeded";
            state.searchResults.push(action.payload);
        })
        .addCase(searchUser.rejected,(state)=>{
            state.status = "failed";
        })
    }
})

export default userSlice.reducer;