import axios from "axios";

const api = axios.create({
  baseURL: "https://event-display-backend.vercel.app/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function clearAuth() {
  [
    "token",
    "user",
    "userId",
    "userName",
    "userEmail",
    "userRole",
  ].forEach((key) => localStorage.removeItem(key));

  window.dispatchEvent(new Event("auth-changed"));
}

export function saveAuth(token, user) {
  if (typeof token !== "string" || !user?._id) {
    throw new Error("Invalid login response from server");
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
    const requestUrl = error.config?.url || "";
    const isLoginRequest = requestUrl === "/auth/login";
    const sentAuthorization = error.config?.headers?.Authorization;
    const currentToken = localStorage.getItem("token");

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      currentToken &&
      sentAuthorization === `Bearer ${currentToken}`
    ) {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;