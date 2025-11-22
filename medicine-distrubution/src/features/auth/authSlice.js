// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

const initialToken = localStorage.getItem('token');
const initialUser = localStorage.getItem('user');

const initialState = {
  token: initialToken || null,
  user: initialUser ? JSON.parse(initialUser) : null,
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });

      // backend: { success, message, data: { token, user? } }
      const token = res.data?.data?.token;
      const user = res.data?.data?.user || null;

      if (!token) {
        return rejectWithValue({ message: 'Token missing in response' });
      }

      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { message: 'Login failed' }
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
