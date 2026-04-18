import api from "./axios";

export const applyToJob = (formData) =>
  api
    .post("/applications", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const fetchMyApplications = () =>
  api.get("/applications/mine").then((r) => r.data);
export const fetchJobApplicants = (jobId) =>
  api.get(`/applications/job/${jobId}`).then((r) => r.data);
export const fetchRecommendedJobs = () =>
  api.get("/applications/recommended").then((r) => r.data);
export const updateAppStatus = (id, status) =>
  api.patch(`/applications/${id}/status`, { status }).then((r) => r.data);