import { Octokit } from '@octokit/rest'

// ─── Exchange OAuth code for access token ────────────────────────────
export const exchangeCodeForToken = async (code) => {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri:  process.env.GITHUB_REDIRECT_URI,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error_description || 'GitHub OAuth failed')
  return data.access_token
}

// ─── Fetch full GitHub profile data ──────────────────────────────────
export const fetchGitHubProfile = async (accessToken) => {
  const octokit = new Octokit({ auth: accessToken })

  // 1. Basic profile
  const { data: profile } = await octokit.rest.users.getAuthenticated()

  // 2. All public repos (paginated, max 100)
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort:      'updated',
    per_page:  100,
    visibility:'public',
  })

  // 3. Language breakdown across all repos
  const languageCounts = {}
  let   totalStars     = 0

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  }

  // Sort languages by repo count
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang]) => lang)

  // 4. Contribution score (proxy via recent commits + stars + followers)
  const contributionScore = Math.min(100, Math.round(
    (Math.log1p(totalStars)    * 12) +
    (Math.log1p(profile.followers) * 10) +
    (Math.log1p(repos.length)  * 8)  +
    (profile.public_gists > 0 ? 5 : 0)
  ))

  // 5. Pinned / top repos (top 6 by stars)
  const pinnedRepos = repos
    .sort((a, b) => (b.stargazers_count - a.stargazers_count))
    .slice(0, 6)
    .map(r => ({
      name:        r.name,
      description: r.description || '',
      stars:       r.stargazers_count,
      language:    r.language || 'Unknown',
      url:         r.html_url,
    }))

  return {
    username:          profile.login,
    profileUrl:        profile.html_url,
    avatarUrl:         profile.avatar_url,
    bio:               profile.bio || '',
    followers:         profile.followers,
    publicRepos:       profile.public_repos,
    topLanguages,
    totalStars,
    contributionScore,
    pinnedRepos,
    lastSynced:        new Date(),
  }
}

// ─── Build a text summary for AI consumption ─────────────────────────
export const buildGitHubSummary = (github) => {
  if (!github?.connected) return ''

  const repoSummaries = github.pinnedRepos
    ?.slice(0, 4)
    .map(r => `- ${r.name} (${r.language}, ${r.stars}★): ${r.description}`)
    .join('\n') || ''

  return `
GITHUB PROFILE SUMMARY:
Username: ${github.username}
Public repos: ${github.publicRepos}
Total stars earned: ${github.totalStars}
Followers: ${github.followers}
Top languages: ${github.topLanguages?.join(', ')}
GitHub activity score: ${github.contributionScore}/100

TOP REPOSITORIES:
${repoSummaries}
`.trim()
}