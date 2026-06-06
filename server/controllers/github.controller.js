import User from "../models/user.model.js";
import {
  exchangeCodeForToken,
  fetchGitHubProfile,
} from "../services/github.service.js";

// ─── Step 1: Redirect to GitHub OAuth ────────────────────────────────
export const initiateOAuth = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: "read:user public_repo",
    state: req.user._id.toString(), // CSRF protection
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

// ─── Step 2: Handle OAuth callback ───────────────────────────────────
export const handleCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(
      `${process.env.CLIENT_URL}/candidate/profile?github=error`,
    );
  }

  try {
    const accessToken = await exchangeCodeForToken(code);
    const profile = await fetchGitHubProfile(accessToken);

    // state contains userId (set in initiateOAuth)
    await User.findByIdAndUpdate(state, {
      github: {
        connected: true,
        accessToken,
        ...profile,
      },
    });

    res.redirect(
      `${process.env.CLIENT_URL}/candidate/profile?github=connected`,
    );
  } catch (err) {
    console.error("GitHub OAuth error:", err.message);
    res.redirect(`${process.env.CLIENT_URL}/candidate/profile?github=error`);
  }
};

// ─── Get connected GitHub profile ────────────────────────────────────
export const getGitHubProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("github");
  if (!user?.github?.connected) {
    return res.json({ success: true, connected: false });
  }
  // Never send access token to frontend
  const { accessToken, ...safe } = user.github.toObject();
  res.json({ success: true, connected: true, github: safe });
};

// ─── Sync / refresh GitHub data ──────────────────────────────────────
export const syncGitHub = async (req, res) => {
  const user = await User.findById(req.user._id).select("github");
  if (!user?.github?.connected || !user.github.accessToken) {
    return res.status(400).json({ message: "GitHub not connected" });
  }

  try {
    const profile = await fetchGitHubProfile(user.github.accessToken);
    await User.findByIdAndUpdate(req.user._id, {
      github: {
        connected: true,
        accessToken: user.github.accessToken,
        ...profile,
      },
    });
    const { accessToken, ...safe } = { ...user.github.toObject(), ...profile };
    res.json({ success: true, github: safe });
  } catch (err) {
    res.status(500).json({ message: "Failed to sync GitHub data" });
  }
};

// ─── Disconnect GitHub ────────────────────────────────────────────────
export const disconnectGitHub = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    github: { connected: false },
  });
  res.json({ success: true });
};
