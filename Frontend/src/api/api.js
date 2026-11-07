import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function clearAuth() {
  const keys = [
    "token",
    "user",
    "userId",
    "userName",
    "userEmail",
    "userRole",
  ];

  keys.forEach((key) => localStorage.removeItem(key));

  window.dispatchEvent(new Event("auth-changed"));
}

export function saveAuth(token, user) {
  if (!token || !user?._id) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("userId", user._id);
  localStorage.setItem("userName", user.name);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userRole", user.role || "attendee");

  window.dispatchEvent(new Event("auth-changed"));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem("token");
    const authorization = error.config?.headers?.Authorization;
    const isLogin = error.config?.url === "/auth/login";

    if (
      error.response?.status === 401 &&
      !isLogin &&
      token &&
      authorization === `Bearer ${token}`
    ) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;