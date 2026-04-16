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
    const hasSession = localStorage.getItem("hg_token") || localStorage.getItem("hg_user");
    if (err.response?.status === 401 && hasSession) {
      localStorage.removeItem("hg_token");
      localStorage.removeItem("hg_user");
      localStorage.removeItem("hg_profile");
      // Only redirect if we're not already on the home page
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
const membersAPI = {
  getAll: () => API.get("/members"),
  add: (data) => API.post("/members", data),
  updateDaily: (id, date, data) =>
    API.put(`/members/${id}/daily`, { date, data }),
  remove: (id) => API.delete(`/members/${id}`),
  linkStatus: (id) => API.get(`/members/${id}/link-status`),
};

export { membersAPI };

export default API;
