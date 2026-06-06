import api from "./axios";

export const proposeInterviewSlots = (data) =>
  api.post("/interviews", data).then((r) => r.data);
export const confirmInterviewSlot = (id, slotId) =>
  api.post(`/interviews/${id}/confirm`, { slotId }).then((r) => r.data);
export const cancelInterview = (id) =>
  api.patch(`/interviews/${id}/cancel`).then((r) => r.data);
export const completeInterview = (id) =>
  api.patch(`/interviews/${id}/complete`).then((r) => r.data);
export const fetchInterviewByApp = (applicationId) =>
  api.get(`/interviews/application/${applicationId}`).then((r) => r.data);
export const fetchMyInterviews = () =>
  api.get("/interviews").then((r) => r.data);
