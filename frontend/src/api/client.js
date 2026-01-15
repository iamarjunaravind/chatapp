import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.12:8000/api"; // Use local IP if testing on physical device

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: (data) => api.post("/chat/signup/", data),
  login: (data) => api.post("/chat/login/", data),
};

export const chatApi = {
  getUsers: () => api.get("/chat/users/"),
  getConversations: () => api.get("/chat/conversations/"),
  createConversation: (participant_id) =>
    api.post("/chat/conversations/", { participant_id }),
  getMessages: (conversation_id) =>
    api.get(`/chat/messages/?conversation_id=${conversation_id}`),
  sendMessage: (formData) =>
    api.post("/chat/messages/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
