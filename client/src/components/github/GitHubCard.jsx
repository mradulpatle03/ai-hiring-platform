import { useState }  from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchGitHubProfile, connectGitHub, syncGitHub, disconnectGitHub } from '../../api/github'
import { formatDistanceToNow } from 'date-fns'
import { Github, RefreshCw, Unlink, Star, GitFork, Users, Code2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const s = {
  card:     { background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' },
  header:   { background: '#0d1117', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' },
  avatar:   { width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #333' },
  hName:    { color: '#fff', fontWeight: '600', fontSize: '16px', marginBottom: '2px' },
  hBio:     { color: '#8b949e', fontSize: '12px', lineHeight: 1.4 },
  body:     { padding: '1.25rem' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '1.25rem' },
  stat:     { textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', padding: '10px 6px' },
  statNum:  { fontSize: '18px', fontWeight: '600', color: '#1a1a1a', lineHeight: 1 },
  statLbl:  { fontSize: '10px', color: '#888', marginTop: '3px' },
  section:  { marginBottom: '1.25rem' },
  secTitle: { fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' },
  langPill: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: '#f0effc', color: '#5a52c0', fontSize: '12px', marginRight: '5px', marginBottom: '5px', fontWeight: '500' },
  repoCard: { border: '1px solid #eee', borderRadius: '8px', padding: '10px 12px', marginBottom: '6px' },
  repoName: { fontWeight: '600', fontSize: '13px', color: '#7F77DD', marginBottom: '3px' },
  repoDesc: { fontSize: '12px', color: '#888', marginBottom: '5px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  repoMeta: { display: 'flex', gap: '12px', fontSize: '11px', color: '#aaa', alignItems: 'center' },
  scoreBar: { height: '6px', background: '#f0effc', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' },
  scoreFill:{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #7F77DD, #1D9E75)', transition: 'width 0.6s ease' },
  actions:  { display: 'flex', gap: '8px', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f5f5f5' },
  btn:      (v) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
    border: '1px solid', cursor: 'pointer',
    background: v === 'danger' ? '#fff0f0' : v === 'primary' ? '#0d1117' : '#f5f5f5',
    color:      v === 'danger' ? '#c0392b' : v === 'primary' ? '#fff'    : '#555',
    borderColor:v === 'danger' ? '#fde0e0' : v === 'primary' ? '#0d1117' : '#e0e0e0',
  }),
  connect:  { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem', textAlign: 'center' },
  conIcon:  { marginBottom: '12px' },
  conTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  conSub:   { fontSize: '13px', color: '#888', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '300px' },
  conBtn:   { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: '#0d1117', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  perks:    { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' },
  perk:     { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#555', background: '#f5f5f5', padding: '5px 10px', borderRadius: '999px' },
}

const ScoreRing = ({ score }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f8ff', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.25rem' }}>
    <Zap size={16} color="#7F77DD"/>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#555' }}>GitHub Activity Score</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#7F77DD' }}>{score}/100</span>
      </div>
      <div style={s.scoreBar}>
        <div style={{ ...s.scoreFill, width: `${score}%` }}/>
      </div>
    </div>
  </div>
)

export default function GitHubCard() {
  const queryClient  = useQueryClient()
  const [expanded, setExpanded] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['github-profile'],
    queryFn:  fetchGitHubProfile,
  })

  const syncMutation = useMutation({
    mutationFn: syncGitHub,
    onSuccess:  () => { queryClient.invalidateQueries(['github-profile']); toast.success('GitHub data synced!') },
    onError:    () => toast.error('Sync failed'),
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectGitHub,
    onSuccess:  () => { queryClient.invalidateQueries(['github-profile']); toast.success('GitHub disconnected') },
    onError:    () => toast.error('Failed to disconnect'),
  })

  if (isLoading) return (
    <div style={s.card}>
      <div style={{ padding: '2rem', color: '#ddd', textAlign: 'center', fontSize: '13px' }}>Loading GitHub profile...</div>
    </div>
  )

  // Not connected
  if (!data?.connected) return (
    <div style={s.card}>
      <div style={s.connect}>
        <div style={s.conIcon}><Github size={48} color="#0d1117"/></div>
        <div style={s.conTitle}>Connect your GitHub</div>
        <div style={s.conSub}>
          Boost your AI score by up to 30%. Recruiters see your real coding activity, not just what's on your resume.
        </div>
        <div style={s.perks}>
          {['Top languages', 'Repo stars', 'Contribution activity', 'Pinned projects'].map(p => (
            <span key={p} style={s.perk}><Code2 size={11}/> {p}</span>
          ))}
        </div>
        <button style={s.conBtn} onClick={connectGitHub}>
          <Github size={16}/> Connect GitHub
        </button>
      </div>
    </div>
  )

  const gh = data.github

  return (
    <div style={s.card}>
      {/* Dark header */}
      <div style={s.header}>
        {gh.avatarUrl
          ? <img src={gh.avatarUrl} alt={gh.username} style={s.avatar}/>
          : <div style={{ ...s.avatar, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Github size={24} color="#8b949e"/>
            </div>
        }
        <div style={{ flex: 1 }}>
          <div style={s.hName}>@{gh.username}</div>
          {gh.bio && <div style={s.hBio}>{gh.bio.slice(0, 80)}{gh.bio.length > 80 ? '…' : ''}</div>}
        </div>
        <a href={gh.profileUrl} target="_blank" rel="noreferrer"
          style={{ color: '#8b949e', display: 'flex', alignItems: 'center' }}>
          <Github size={18}/>
        </a>
      </div>

      <div style={s.body}>
        {/* Activity score */}
        <ScoreRing score={gh.contributionScore || 0}/>

        {/* Stats grid */}
        <div style={s.statGrid}>
          {[
            { num: gh.publicRepos,  label: 'Repos',     icon: <GitFork size={12} color="#7F77DD"/> },
            { num: gh.totalStars,   label: 'Stars',     icon: <Star    size={12} color="#EF9F27"/> },
            { num: gh.followers,    label: 'Followers', icon: <Users   size={12} color="#1D9E75"/> },
            { num: gh.topLanguages?.length || 0, label: 'Languages', icon: <Code2 size={12} color="#378ADD"/> },
          ].map(({ num, label, icon }) => (
            <div key={label} style={s.stat}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div>
              <div style={s.statNum}>{num ?? '—'}</div>
              <div style={s.statLbl}>{label}</div>
            </div>
          ))}
        </div>

        {/* Top languages */}
        {gh.topLanguages?.length > 0 && (
          <div style={s.section}>
            <div style={s.secTitle}>Top languages</div>
            {gh.topLanguages.map(lang => (
              <span key={lang} style={s.langPill}>{lang}</span>
            ))}
          </div>
        )}

        {/* Pinned repos — expandable */}
        {gh.pinnedRepos?.length > 0 && (
          <div style={s.section}>
            <div style={{ ...s.secTitle, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setExpanded(p => !p)}>
              Top repositories
              <span style={{ fontWeight: '400', color: '#aaa', textTransform: 'none' }}>
                {expanded ? '▲ hide' : `▼ show ${gh.pinnedRepos.length}`}
              </span>
            </div>
            {expanded && gh.pinnedRepos.map(repo => (
              <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer"
                style={{ textDecoration: 'none' }}>
                <div style={s.repoCard}>
                  <div style={s.repoName}>{repo.name}</div>
                  {repo.description && <div style={s.repoDesc}>{repo.description}</div>}
                  <div style={s.repoMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={10}/>{repo.stars}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Code2 size={10}/>{repo.language}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Last synced */}
        {gh.lastSynced && (
          <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '4px' }}>
            Last synced {formatDistanceToNow(new Date(gh.lastSynced), { addSuffix: true })}
          </div>
        )}

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.btn('primary')} onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}>
            <RefreshCw size={13}/> {syncMutation.isPending ? 'Syncing...' : 'Sync now'}
          </button>
          <button style={s.btn('danger')} onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}>
            <Unlink size={13}/> Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}