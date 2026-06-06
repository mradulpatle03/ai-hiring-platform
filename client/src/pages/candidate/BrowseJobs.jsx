import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchAllJobs } from "../../api/jobs";
import Layout from "../../components/Layout";
import JobCard from "../../components/JobCard";
import { JobCardSkeleton } from "../../components/Skeleton";

const s = {
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "1rem" },
  filters: { display: "flex", gap: "10px", marginBottom: "1.5rem" },
  search: { flex: 2 },
  loc: { flex: 1 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
    gap: "1rem",
  },
};

export default function BrowseJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", query],
    queryFn: () => fetchAllJobs(query),
  });

  const jobs = data?.jobs || [];

  const handleSearch = () => setQuery({ search, location });

  return (
    <Layout>
      <div style={s.h1}>Browse jobs</div>
      <div style={s.filters}>
        <div style={s.search}>
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div style={s.loc}>
          <input
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          style={{
            padding: "9px 20px",
            background: "#7F77DD",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Search
        </button>
      </div>

      {isLoading ? (
        <div style={s.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>No jobs found.</p>
      ) : (
        <div style={s.grid}>
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onClick={() => navigate(`/candidate/jobs/${job._id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
