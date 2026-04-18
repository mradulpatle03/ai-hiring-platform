import api from "./axios";

export const fetchAllJobs = (params) =>
  api.get("/jobs", { params }).then((r) => r.data);
export const fetchMyJobs = () =>
  api.get("/jobs/recruiter/mine").then((r) => r.data);
export const fetchJobById = (id) => api.get(`/jobs/${id}`).then((r) => r.data);
export const createJob = (data) => api.post("/jobs", data).then((r) => r.data);
export const updateJob = (id, d) =>
  api.patch(`/jobs/${id}`, d).then((r) => r.data);
export const closeJob = (id) =>
  api.patch(`/jobs/${id}/close`).then((r) => r.data);