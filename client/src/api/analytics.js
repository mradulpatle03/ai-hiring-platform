import api from "./axios";

export const fetchOverview = () =>
  api.get("/analytics/overview").then((r) => r.data);
export const fetchOverTime = () =>
  api.get("/analytics/over-time").then((r) => r.data);
export const fetchScoreDist = () =>
  api.get("/analytics/score-dist").then((r) => r.data);
export const fetchFunnel = () =>
  api.get("/analytics/funnel").then((r) => r.data);
export const fetchTopSkills = () =>
  api.get("/analytics/top-skills").then((r) => r.data);
export const fetchScoreByJob = () =>
  api.get("/analytics/score-by-job").then((r) => r.data);
export const fetchRecentActivity = () =>
  api.get("/analytics/recent").then((r) => r.data);