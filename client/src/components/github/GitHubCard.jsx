import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGitHubProfile,
  connectGitHub,
  syncGitHub,
  disconnectGitHub,
} from "../../api/github";
import { formatDistanceToNow } from "date-fns";
import {
  GitFork as Github,
  RefreshCw,
  Unlink,
  Star,
  GitFork,
  Users,
  Code2,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const s = {
  card: {
    background: "#fff",
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  header: {
    background: "var(--ink)",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid var(--line)",
  },
  avatar: {
    width: "48px",
    height: "48px",
    border: "1px solid var(--line)",
    flexShrink: 0,
    display: "block",
  },
  hName: {
    fontFamily: "var(--font-display)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    letterSpacing: "-0.01em",
    marginBottom: "3px",
  },
  hBio: {
    fontFamily: "var(--font-body)",
    color: "var(--graphite-dim)",
    fontSize: "11px",
    lineHeight: 1.4,
  },
  body: { padding: "18px 20px" },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "1px",
    background: "var(--line-light)",
    border: "1px solid var(--line-light)",
    marginBottom: "18px",
  },
  stat: {
    textAlign: "center",
    background: "var(--paper)",
    padding: "12px 6px",
  },
  statNum: {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    lineHeight: 1,
  },
  statLbl: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginTop: "4px",
  },
  section: { marginBottom: "16px" },
  secTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  secToggle: {
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "var(--graphite-dim)",
    textTransform: "none",
    letterSpacing: 0,
    fontWeight: "400",
  },
  langPill: {
    fontFamily: "var(--font-mono)",
    display: "inline-block",
    padding: "4px 9px",
    border: "1px solid var(--line-light)",
    color: "var(--graphite)",
    fontSize: "10px",
    fontWeight: "600",
    marginRight: "5px",
    marginBottom: "5px",
    borderRadius: "var(--radius-sm)",
  },
  repoCard: {
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    marginBottom: "6px",
    background: "var(--paper)",
  },
  repoName: {
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: "11px",
    letterSpacing: "0.02em",
    color: "var(--wire)",
    marginBottom: "4px",
  },
  repoDesc: {
    fontSize: "12px",
    color: "var(--graphite)",
    marginBottom: "6px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  repoMeta: {
    display: "flex",
    gap: "12px",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--graphite-dim)",
    alignItems: "center",
  },
  scoreWrap: {
    background: "var(--paper)",
    border: "1px solid var(--line-light)",
    borderLeft: "3px solid var(--volt)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  scoreBar: {
    height: "4px",
    background: "var(--paper-3)",
    overflow: "hidden",
    marginTop: "6px",
  },
  scoreFill: {
    height: "100%",
    background: "var(--volt)",
    transition: "width 0.6s ease",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid var(--line-light)",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "var(--ink)",
    color: "#fff",
    border: "1px solid var(--ink)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  btnDanger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "#fff",
    color: "var(--signal)",
    border: "1px solid rgba(255,77,46,0.3)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  // connect state
  connect: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2.5rem 1.5rem",
    textAlign: "center",
  },
  conIconWrap: {
    width: "56px",
    height: "56px",
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  conTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    marginBottom: "8px",
  },
  conSub: {
    fontSize: "13px",
    color: "var(--graphite)",
    marginBottom: "18px",
    lineHeight: 1.6,
    maxWidth: "280px",
  },
  perks: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "20px",
  },
  perk: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    background: "var(--paper)",
    border: "1px solid var(--line-light)",
    padding: "5px 10px",
    borderRadius: "var(--radius-sm)",
  },
  conBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 22px",
    background: "var(--ink)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  loading: {
    padding: "2rem",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.04em",
    color: "var(--graphite)",
    textAlign: "center",
  },
  lastSynced: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.04em",
    color: "var(--graphite-dim)",
    marginBottom: "4px",
  },
};

const ScoreRing = ({ score }) => (
  <div style={s.scoreWrap}>
    <Zap size={14} color="var(--ink)" />
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--graphite)",
          }}
        >
          GitHub Activity Score
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "14px",
            fontWeight: "700",
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
        >
          {score}/100
        </span>
      </div>
      <div style={s.scoreBar}>
        <div style={{ ...s.scoreFill, width: `${score}%` }} />
      </div>
    </div>
  </div>
);

export default function GitHubCard() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["github-profile"],
    queryFn: fetchGitHubProfile,
  });

  const syncMutation = useMutation({
    mutationFn: syncGitHub,
    onSuccess: () => {
      queryClient.invalidateQueries(["github-profile"]);
      toast.success("GitHub data synced!");
    },
    onError: () => toast.error("Sync failed"),
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectGitHub,
    onSuccess: () => {
      queryClient.invalidateQueries(["github-profile"]);
      toast.success("GitHub disconnected");
    },
    onError: () => toast.error("Failed to disconnect"),
  });

  if (isLoading)
    return (
      <div style={s.card}>
        <div style={s.loading}>Loading GitHub profile…</div>
      </div>
    );

  if (!data?.connected)
    return (
      <div style={s.card}>
        <div style={s.connect}>
          <div style={s.conIconWrap}>
            <Github size={26} color="var(--volt)" />
          </div>
          <div style={s.conTitle}>Connect your GitHub</div>
          <div style={s.conSub}>
            Boost your AI score by up to 30%. Recruiters see your real coding
            activity, not just what's on your resume.
          </div>
          <div style={s.perks}>
            {["Top languages", "Repo stars", "Activity", "Projects"].map(
              (p) => (
                <span key={p} style={s.perk}>
                  <Code2 size={10} /> {p}
                </span>
              ),
            )}
          </div>
          <button style={s.conBtn} onClick={connectGitHub}>
            <Github size={14} /> Connect GitHub
          </button>
        </div>
      </div>
    );

  const gh = data.github;

  return (
    <div style={s.card}>
      {/* Dark header */}
      <div style={s.header}>
        {gh.avatarUrl ? (
          <img src={gh.avatarUrl} alt={gh.username} style={s.avatar} />
        ) : (
          <div
            style={{
              ...s.avatar,
              background: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Github size={22} color="var(--graphite)" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.hName}>@{gh.username}</div>
          {gh.bio && (
            <div style={s.hBio}>
              {gh.bio.slice(0, 80)}
              {gh.bio.length > 80 ? "…" : ""}
            </div>
          )}
        </div>
        <a
          href={gh.profileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "var(--graphite)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Github size={16} />
        </a>
      </div>

      <div style={s.body}>
        <ScoreRing score={gh.contributionScore || 0} />

        {/* Stats grid */}
        <div style={s.statGrid}>
          {[
            {
              num: gh.publicRepos,
              label: "Repos",
              icon: <GitFork size={11} color="var(--wire)" />,
            },
            {
              num: gh.totalStars,
              label: "Stars",
              icon: <Star size={11} color="var(--warning)" />,
            },
            {
              num: gh.followers,
              label: "Followers",
              icon: <Users size={11} color="var(--success)" />,
            },
            {
              num: gh.topLanguages?.length || 0,
              label: "Langs",
              icon: <Code2 size={11} color="var(--graphite)" />,
            },
          ].map(({ num, label, icon }) => (
            <div key={label} style={s.stat}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "5px",
                }}
              >
                {icon}
              </div>
              <div style={s.statNum}>{num ?? "—"}</div>
              <div style={s.statLbl}>{label}</div>
            </div>
          ))}
        </div>

        {/* Top languages */}
        {gh.topLanguages?.length > 0 && (
          <div style={s.section}>
            <div style={{ ...s.secTitle, cursor: "default" }}>
              Top languages
            </div>
            {gh.topLanguages.map((lang) => (
              <span key={lang} style={s.langPill}>
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Pinned repos */}
        {gh.pinnedRepos?.length > 0 && (
          <div style={s.section}>
            <div style={s.secTitle} onClick={() => setExpanded((p) => !p)}>
              Top repositories
              <span style={s.secToggle}>
                {expanded ? "▲ hide" : `▼ show ${gh.pinnedRepos.length}`}
              </span>
            </div>
            {expanded &&
              gh.pinnedRepos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div style={s.repoCard}>
                    <div style={s.repoName}>{repo.name}</div>
                    {repo.description && (
                      <div style={s.repoDesc}>{repo.description}</div>
                    )}
                    <div style={s.repoMeta}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Star size={9} /> {repo.stars}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <Code2 size={9} /> {repo.language}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        )}

        {gh.lastSynced && (
          <div style={s.lastSynced}>
            Last synced{" "}
            {formatDistanceToNow(new Date(gh.lastSynced), { addSuffix: true })}
          </div>
        )}

        <div style={s.actions}>
          <button
            style={s.btnPrimary}
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw size={11} />
            {syncMutation.isPending ? "Syncing…" : "Sync now"}
          </button>
          <button
            style={s.btnDanger}
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
          >
            <Unlink size={11} /> Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
