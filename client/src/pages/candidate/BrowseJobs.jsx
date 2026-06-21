import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchAllJobs } from "../../api/jobs";
import Layout from "../../components/Layout";
import JobCard from "../../components/JobCard";
import { JobCardSkeleton } from "../../components/Skeleton";
import { color, font } from "../../styles/theme";

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
      <div style={s.eyebrow}>// opportunities</div>
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
        <button onClick={handleSearch} style={s.searchBtn}>
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
        <p style={s.empty}>No jobs found.</p>
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

const s = {
  eyebrow: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: color.signal,
    marginBottom: "6px",
  },
  h1: {
    fontFamily: font.display,
    fontSize: "23px",
    fontWeight: 700,
    marginBottom: "1.25rem",
    letterSpacing: "-0.02em",
  },
  filters: { display: "flex", gap: "10px", marginBottom: "1.5rem" },
  search: { flex: 2 },
  loc: { flex: 1 },
  searchBtn: {
    padding: "10px 22px",
    background: color.ink,
    color: "#fff",
    border: "none",
    fontFamily: font.mono,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))",
    gap: "1rem",
  },
  empty: { color: color.graphiteDim, fontSize: "14px" },
};
