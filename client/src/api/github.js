import api from "./axios";

export const fetchGitHubProfile = () =>
  api.get("/github/profile").then((r) => r.data);
export const syncGitHub = () => api.post("/github/sync").then((r) => r.data);
export const disconnectGitHub = () =>
  api.delete("/github/disconnect").then((r) => r.data);

// Initiates OAuth — full page redirect
export const connectGitHub = () => {
  window.location.href = `${import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}/api/github/connect`;
};
