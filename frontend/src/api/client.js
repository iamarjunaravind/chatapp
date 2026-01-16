import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_DOMAIN = "chatapp-backend-production-46fb.up.railway.app";
const API_URL = `https://${BASE_DOMAIN}/api`;
export const WS_URL = `wss://${BASE_DOMAIN}/ws/chat`;

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
