import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hg_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hg_token");
      localStorage.removeItem("hg_user");
      // Redirect to login if token expired
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

// ── Health Logs ──────────────────────────
export const logsAPI = {
  getAll: () => API.get("/logs"),
  getToday: () => API.get("/logs/today"),
  save: (log) => API.post("/logs", log),
  remove: (date) => API.delete(`/logs/${date}`),
};

// ── Family Members ───────────────────────
export const membersAPI = {
  getAll: () => API.get("/members"),
  add: (data) => API.post("/members", data),
  updateDaily: (id, date, data) =>
    API.put(`/members/${id}/daily`, { date, data }),
  remove: (id) => API.delete(`/members/${id}`),
};

export default API;
