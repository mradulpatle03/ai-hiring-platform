import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  GitFork as Github,
  Mail,
  Clock,
  Target,
  BarChart2,
  ChevronDown,
  Code2,
  MessageSquare,
  Calendar,
  Shield,
  Activity,
  Award,
  Eye,
} from "lucide-react";

// ─── Animated counter hook ────────────────────────────────────────────
function useCountUp(target, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ─── Intersection observer hook ───────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Stat counter component ───────────────────────────────────────────
function StatCounter({ value, suffix = "", label, prefix = "" }) {
  const [ref, inView] = useInView(0.3);
  const count = useCountUp(value, 1800, inView);
  return (
    <div ref={ref} style={s.statBlock}>
      <div style={s.statNum}>
        {prefix}
        {inView ? count.toLocaleString() : 0}
        {suffix}
      </div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...s.featureCard,
        borderLeftColor: hovered ? accent : "rgba(11,14,20,0.10)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          ...s.featureIcon,
          background: hovered ? accent : "rgba(11,14,20,0.04)",
        }}
      >
        <Icon size={18} color={hovered ? "#fff" : accent} />
      </div>
      <div style={s.featureTitle}>{title}</div>
      <div style={s.featureDesc}>{desc}</div>
    </div>
  );
}

// ─── Score badge (live demo) ──────────────────────────────────────────
function ScoreBar({ label, score, color, delay = 0 }) {
  const [ref, inView] = useInView(0.2);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setWidth(score), delay);
      return () => clearTimeout(t);
    }
  }, [inView, score, delay]);
  return (
    <div ref={ref} style={{ marginBottom: "10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span style={s.barLabel}>{label}</span>
        <span style={{ ...s.barLabel, color, fontWeight: 700 }}>
          {score}/10
        </span>
      </div>
      <div style={s.barTrack}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: color,
            transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, company, score }) {
  return (
    <div style={s.testimonialCard}>
      <div style={s.quoteAccent}>"</div>
      <p style={s.quoteText}>{quote}</p>
      <div style={s.testimonialFooter}>
        <div style={s.testimonialAvatar}>
          {name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <div style={s.testimonialName}>{name}</div>
          <div style={s.testimonialRole}>
            {role} · {company}
          </div>
        </div>
        {score && (
          <div style={s.testimonialScore}>
            <Star size={10} color="#B07A0E" fill="#B07A0E" />
            <span
              style={{
                color: "#B07A0E",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {score}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step item ────────────────────────────────────────────────────────
function StepItem({ num, title, desc, icon: Icon, active, onClick }) {
  return (
    <div
      style={{ ...s.stepItem, ...(active ? s.stepItemActive : {}) }}
      onClick={onClick}
    >
      <div style={{ ...s.stepNum, ...(active ? s.stepNumActive : {}) }}>
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{ ...s.stepTitle, ...(active ? { color: "#0B0E14" } : {}) }}
        >
          {title}
        </div>
        {active && <div style={s.stepDesc}>{desc}</div>}
      </div>
      <Icon size={16} color={active ? "#FF4D2E" : "#8A8D98"} />
    </div>
  );
}

// ─── Main homepage ────────────────────────────────────────────────────
export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-cycle steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep((p) => (p + 1) % 4), 3000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    {
      title: "Post your job",
      desc: "Write a job description and AI instantly extracts skills, seniority level, and role requirements — no tagging or setup needed.",
      icon: Briefcase,
    },
    {
      title: "Candidates apply",
      desc: "Candidates upload their resume. Our system parses the PDF, pulls GitHub data if connected, and queues AI screening in under 60 seconds.",
      icon: Users,
    },
    {
      title: "AI screens and scores",
      desc: "A multi-model pipeline scores each applicant across 5 dimensions: technical skills, experience depth, project impact, communication, and growth potential.",
      icon: Zap,
    },
    {
      title: "You interview the best",
      desc: "Shortlist top candidates, schedule interviews with one click, and send calendar invites automatically. Reject others with one tap.",
      icon: Calendar,
    },
  ];

  return (
    <div style={s.page}>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{ ...s.nav, ...(navScrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.brandWrap}>
            <div style={s.brandIcon}>
              <span style={s.brandMark}>HF</span>
            </div>
            <span style={s.brandName}>HireFlow</span>
          </div>

          <div style={s.navLinks}>
            {["Features", "How it works", "Pricing"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                style={s.navLink}
                onMouseEnter={(e) => (e.target.style.color = "#0B0E14")}
                onMouseLeave={(e) => (e.target.style.color = "#5C5F6B")}
              >
                {link}
              </a>
            ))}
          </div>

          <div style={s.navActions}>
            <Link to="/login" style={s.navLoginBtn}>
              Sign in
            </Link>
            <Link to="/register" style={s.navCta}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Grid background */}
        <div style={s.heroGrid} />

        <div style={s.heroInner}>
          <h1 style={s.heroH1}>
            Hire on signal,
            <br />
            <span style={s.heroH1Accent}>not noise.</span>
          </h1>

          <p style={s.heroSub}>
            HireFlow uses multi-model AI to score every applicant across 5
            dimensions, pull GitHub insights, and surface the best candidates —
            before you read a single resume.
          </p>

          <div style={s.heroCtas}>
            <Link to="/register" style={s.heroPrimary}>
              Start hiring for free
              <ArrowRight size={16} />
            </Link>
            <Link to="/register?role=candidate" style={s.heroSecondary}>
              Find a job →
            </Link>
          </div>

          <div style={s.heroSocialProof}>
            {["TechCorp India", "StartupXYZ", "FinScale", "DevHouse"].map(
              (co) => (
                <span key={co} style={s.heroCompany}>
                  {co}
                </span>
              ),
            )}
            <span style={s.heroCompanyMore}>+240 companies</span>
          </div>
        </div>

        {/* Hero visual — live score card */}
        <div style={s.heroVisual}>
          <div style={s.heroCard}>
            <div style={s.heroCardHeader}>
              <div>
                <div style={s.heroCardTitle}>Mradul Patle</div>
                <div style={s.heroCardSub}>Senior Full Stack Developer</div>
              </div>
              <div style={s.heroCardScore}>
                <div style={s.heroScoreNum}>88</div>
                <div style={s.heroScoreSub}>/100</div>
              </div>
            </div>
            <div style={s.heroCardDivider} />
            <ScoreBar
              label="Technical Skills"
              score={90}
              color="#1D8A4E"
              delay={0}
            />
            <ScoreBar
              label="Experience Depth"
              score={80}
              color="#4D7CFF"
              delay={150}
            />
            <ScoreBar
              label="Project Impact"
              score={90}
              color="#1D8A4E"
              delay={300}
            />
            <ScoreBar
              label="Communication"
              score={80}
              color="#4D7CFF"
              delay={450}
            />
            <ScoreBar
              label="Growth Potential"
              score={80}
              color="#4D7CFF"
              delay={600}
            />
            <div style={s.heroCardFooter}>
              <Github size={12} color="#1D8A4E" />
              <span style={{ ...s.heroCardSub, color: "#1D8A4E" }}>
                GitHub connected · 284 stars
              </span>
              <div style={s.heroStatusBadge}>Shortlisted</div>
            </div>
          </div>

          {/* Floating badges */}
          <div style={{ ...s.floatBadge, bottom: "-12px", right: "-28px" }}>
            <Zap size={11} color="#FF4D2E" />
            Screened in 42s
          </div>
          <div style={{ ...s.floatBadge, top: "64px", left: "-28px" }}>
            <CheckCircle size={11} color="#1D8A4E" />5 AI dimensions
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section style={s.statsBar}>
        <div style={s.statsInner}>
          <StatCounter value={1200} suffix="+" label="Applications screened" />
          <div style={s.statsDivider} />
          <StatCounter value={97} suffix="%" label="Screening accuracy" />
          <div style={s.statsDivider} />
          <StatCounter value={11} label="Avg. days to hire" />
          <div style={s.statsDivider} />
          <StatCounter value={240} suffix="+" label="Active companies" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>
            <BarChart2 size={10} color="#FF4D2E" />
            What makes HireFlow different
          </div>
          <h2 style={s.sectionH2}>Built for signal, not theatre</h2>
          <p style={s.sectionSub}>
            Most ATS tools track applicants. HireFlow evaluates them — using
            multi-model AI pipelines that surface insight instead of paperwork.
          </p>

          <div style={s.featuresGrid}>
            <FeatureCard
              icon={Zap}
              title="XAI: Explainable AI scoring"
              desc="Every candidate gets a 5-dimension breakdown — technical skills, experience, project impact, communication clarity, and growth potential — with reasoning you can read."
              accent="#FF4D2E"
            />
            <FeatureCard
              icon={Github}
              title="GitHub signal integration"
              desc="Candidates connect their GitHub profile. We pull repos, languages, stars, and contribution scores — adding real code evidence to resume claims."
              accent="#1D8A4E"
            />
            <FeatureCard
              icon={Target}
              title="Semantic job matching"
              desc="Candidate embeddings are matched against job embeddings using cosine similarity. The right people rise to the top even if their resume doesn't use your exact keywords."
              accent="#4D7CFF"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real-time candidate messaging"
              desc="Built-in WebSocket chat lets recruiters message shortlisted candidates directly. No email threads, no third-party tools — just clean conversation tied to the application."
              accent="#B07A0E"
            />
            <FeatureCard
              icon={Calendar}
              title="Automated interview scheduling"
              desc="Propose up to 5 interview slots, candidates pick their slot, and both parties receive a .ics calendar file. Google Meet links and notes included."
              accent="#1D9E75"
            />
            <FeatureCard
              icon={BarChart2}
              title="Hiring analytics dashboard"
              desc="Track application funnel, score distribution, top missing skills, and conversion rates — all updated in real time so you can spot bottlenecks fast."
              accent="#FF4D2E"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ ...s.section, background: "#0B0E14" }}
      >
        <div style={s.sectionInner}>
          <div style={{ ...s.sectionEyebrow, color: "rgba(255,255,255,0.5)" }}>
            <Activity size={10} color="#C8FF4D" />
            <span style={{ color: "rgba(255,255,255,0.5)" }}>The pipeline</span>
          </div>
          <h2 style={{ ...s.sectionH2, color: "#fff" }}>
            From job post to shortlist in minutes
          </h2>
          <p style={{ ...s.sectionSub, color: "rgba(255,255,255,0.5)" }}>
            Four steps. Fully automated from the moment a candidate hits submit.
          </p>

          <div style={s.stepsLayout}>
            {/* Step selector */}
            <div style={s.stepsList}>
              {steps.map((step, i) => (
                <StepItem
                  key={i}
                  num={`0${i + 1}`}
                  title={step.title}
                  desc={step.desc}
                  icon={step.icon}
                  active={activeStep === i}
                  onClick={() => setActiveStep(i)}
                />
              ))}
            </div>

            {/* Step visual */}
            <div style={s.stepVisual}>
              {activeStep === 0 && (
                <div style={s.stepVisFade}>
                  <div style={s.stepVisCard}>
                    <div style={s.stepVisLabel}>Job posting</div>
                    <div style={s.stepVisTitle}>
                      Senior Full Stack Developer
                    </div>
                    <div style={s.stepVisSub}>
                      TechCorp India · Bangalore / Remote
                    </div>
                    <div style={s.stepVisRow}>
                      {["React", "Node.js", "MongoDB", "AWS", "Redis"].map(
                        (sk) => (
                          <span key={sk} style={s.skillTag}>
                            {sk}
                          </span>
                        ),
                      )}
                    </div>
                    <div style={{ ...s.stepVisLabel, marginTop: "16px" }}>
                      AI extracted skills ↑
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div style={s.stepVisFade}>
                  <div style={s.stepVisCard}>
                    <div style={s.stepVisLabel}>Candidate application</div>
                    <div style={s.stepVisTitle}>Mradul Patle</div>
                    <div style={s.stepVisSub}>resume.pdf · 248kb</div>
                    <div style={s.progressRow}>
                      <div style={s.progressLabel}>Parsing PDF…</div>
                      <div style={s.progressBar}>
                        <div
                          style={{
                            ...s.progressFill,
                            width: "100%",
                            background: "#1D8A4E",
                          }}
                        />
                      </div>
                    </div>
                    <div style={s.progressRow}>
                      <div style={s.progressLabel}>Syncing GitHub…</div>
                      <div style={s.progressBar}>
                        <div
                          style={{
                            ...s.progressFill,
                            width: "100%",
                            background: "#4D7CFF",
                          }}
                        />
                      </div>
                    </div>
                    <div style={s.progressRow}>
                      <div style={s.progressLabel}>Queuing AI screen…</div>
                      <div style={s.progressBar}>
                        <div
                          style={{
                            ...s.progressFill,
                            width: "60%",
                            background: "#B07A0E",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div style={s.stepVisFade}>
                  <div style={s.stepVisCard}>
                    <div style={s.stepVisLabel}>AI screening result</div>
                    <div style={s.aiScoreDisplay}>
                      <div style={s.aiScoreBig}>88</div>
                      <div style={s.aiScoreLabel}>/100 XAI score</div>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      {[
                        { dim: "Technical", score: 9, c: "#1D8A4E" },
                        { dim: "Experience", score: 8, c: "#4D7CFF" },
                        { dim: "Projects", score: 9, c: "#1D8A4E" },
                      ].map(({ dim, score, c }) => (
                        <div
                          key={dim}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ ...s.stepVisLabel, minWidth: "80px" }}>
                            {dim}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: "3px",
                              background: "rgba(255,255,255,0.1)",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${score * 10}%`,
                                background: c,
                              }}
                            />
                          </div>
                          <span style={{ ...s.stepVisLabel, color: c }}>
                            {score}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <div style={s.stepVisFade}>
                  <div style={s.stepVisCard}>
                    <div style={s.stepVisLabel}>Interview scheduled</div>
                    <div style={s.stepVisTitle}>Mradul Patle × Priya Sharma</div>
                    <div style={s.stepVisSub}>Senior Full Stack Developer</div>
                    <div style={s.calendarBlock}>
                      <Calendar size={14} color="#C8FF4D" />
                      <span
                        style={{
                          color: "#C8FF4D",
                          fontSize: "13px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Thu, Jul 17 2025 · 10:00 AM
                      </span>
                    </div>
                    <div style={s.calendarBlock}>
                      <CheckCircle size={14} color="#1D9E75" />
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "12px",
                        }}
                      >
                        .ics invite sent to both parties
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── XAI showcase ──────────────────────────────────── */}
      <section style={{ ...s.section, background: "#F7F5EF" }}>
        <div style={s.sectionInner}>
          <div style={s.xaiLayout}>
            <div style={s.xaiLeft}>
              <div style={s.sectionEyebrow}>
                <Eye size={10} color="#FF4D2E" />
                Explainable AI
              </div>
              <h2 style={s.sectionH2}>
                You deserve to know
                <br />
                why someone scores 88
              </h2>
              <p style={s.sectionSub}>
                HireFlow doesn't just hand you a number. Every score has a
                reasoning trail — dimension by dimension, with evidence pulled
                directly from the resume and GitHub.
              </p>

              <div style={s.xaiCheckList}>
                {[
                  "5 scored dimensions with reasoning",
                  "Top strengths and critical gaps",
                  "Suggested interview focus areas",
                  "GitHub activity vs resume claims",
                  "Semantic similarity to job embedding",
                ].map((item) => (
                  <div key={item} style={s.xaiCheck}>
                    <CheckCircle size={14} color="#1D8A4E" />
                    <span style={s.xaiCheckText}>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/register" style={s.heroPrimary}>
                See it in action
                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={s.xaiRight}>
              <div style={s.xaiCard}>
                <div style={s.xaiCardHeader}>
                  <div style={s.xaiCardTitle}>
                    <Zap size={12} color="#C8FF4D" />
                    AI Explainability Report
                  </div>
                  <div style={s.xaiRec}>Shortlist</div>
                </div>
                <p style={s.xaiSummary}>
                  Rahul is a strong candidate who exceeds requirements. His
                  combination of professional experience, measurable impact, and
                  active open source work makes him a top-tier applicant.
                </p>
                <div style={s.xaiStrengths}>
                  <div style={s.xaiStrengthTitle}>
                    <TrendingUp size={10} /> Top strengths
                  </div>
                  {[
                    "Full stack experience across the exact required stack",
                    "Proven scalability — 1M daily requests",
                    "Active open source contributor, 200+ stars",
                  ].map((s2) => (
                    <div key={s2} style={s.xaiStrengthItem}>
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          background: "#1D8A4E",
                          flexShrink: 0,
                        }}
                      />
                      {s2}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>
            <Award size={10} color="#FF4D2E" />
            What people say
          </div>
          <h2 style={s.sectionH2}>Recruiters and candidates love it</h2>
          <div style={s.testimonialsGrid}>
            <TestimonialCard
              quote="I used to spend 3 hours per role reviewing applications. With HireFlow's XAI panel, I can evaluate 50 candidates in under 30 minutes and actually understand why each score is what it is."
              name="Priya Sharma"
              role="Head of Talent"
              company="TechCorp India"
              score="4.9"
            />
            <TestimonialCard
              quote="Connecting my GitHub made a huge difference. My score jumped from 62 to 88. Recruiters could actually see my real contributions instead of just reading my resume."
              name="Mradul Patle"
              role="Senior Developer"
              company="Candidate"
              score="5.0"
            />
            <TestimonialCard
              quote="The semantic job matching is incredible. We were finding React devs who described themselves as 'frontend engineers' — people we'd have filtered out manually."
              name="Arjun Mehta"
              role="CTO"
              company="StartupXYZ"
              score="4.8"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" style={{ ...s.section, background: "#0B0E14" }}>
        <div style={s.sectionInner}>
          <div style={{ ...s.sectionEyebrow, color: "rgba(255,255,255,0.5)" }}>
            <Shield size={10} color="#C8FF4D" />
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Pricing</span>
          </div>
          <h2 style={{ ...s.sectionH2, color: "#fff" }}>
            Fair pricing, full signal
          </h2>
          <div style={s.pricingGrid}>
            {[
              {
                tier: "Candidate",
                price: "Free",
                sub: "Always",
                features: [
                  "Browse all open jobs",
                  "AI resume screening feedback",
                  "GitHub profile integration",
                  "Interview slot selection",
                  "Direct recruiter messaging",
                ],
                cta: "Get started free",
                link: "/register?role=candidate",
                accent: false,
              },
              {
                tier: "Recruiter",
                price: "₹0",
                sub: "During beta",
                features: [
                  "Unlimited job postings",
                  "XAI scoring for all applicants",
                  "Advanced candidate search",
                  "Interview scheduling + .ics",
                  "Analytics dashboard",
                  "Real-time messaging",
                ],
                cta: "Start hiring now",
                link: "/register?role=recruiter",
                accent: true,
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                style={{
                  ...s.pricingCard,
                  ...(plan.accent ? s.pricingCardAccent : {}),
                }}
              >
                <div
                  style={{
                    ...s.pricingTier,
                    ...(plan.accent ? { color: "#C8FF4D" } : {}),
                  }}
                >
                  {plan.tier}
                </div>
                <div style={s.pricingPrice}>
                  {plan.price}
                  <span style={s.pricingSub}> · {plan.sub}</span>
                </div>
                <div style={s.pricingDivider} />
                {plan.features.map((f) => (
                  <div key={f} style={s.pricingFeature}>
                    <CheckCircle
                      size={13}
                      color={plan.accent ? "#C8FF4D" : "#1D8A4E"}
                    />
                    <span>{f}</span>
                  </div>
                ))}
                <Link
                  to={plan.link}
                  style={{
                    ...s.pricingCta,
                    ...(plan.accent ? s.pricingCtaAccent : {}),
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack strip ──────────────────────────────── */}
      <section style={{ ...s.section, padding: "2.5rem 0" }}>
        <div style={s.sectionInner}>
          <div style={s.sectionEyebrow}>
            <Code2 size={10} color="#FF4D2E" />
            Built with
          </div>
          <div style={s.techGrid}>
            {[
              "React 19",
              "Node.js",
              "MongoDB",
              "Socket.IO",
              "Bull Queue",
              "Groq LLM",
              "Pinecone",
              "Redis",
              "JWT Auth",
              "Nodemailer",
            ].map((tech) => (
              <div key={tech} style={s.techPill}>
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={s.finalCta}>
        <div style={s.finalCtaGrid} />
        <div style={s.finalCtaInner}>
          <div style={s.finalCtaEyebrow}>
            <Zap size={11} color="#C8FF4D" /> Ready when you are
          </div>
          <h2 style={s.finalCtaH2}>
            Stop reviewing resumes.
            <br />
            Start making offers.
          </h2>
          <p style={s.finalCtaSub}>
            HireFlow is free during beta. No credit card, no setup, no
            guesswork.
          </p>
          <div style={s.heroCtas}>
            <Link
              to="/register"
              style={{
                ...s.heroPrimary,
                background: "#C8FF4D",
                color: "#0B0E14",
              }}
            >
              Start hiring for free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/register?role=candidate"
              style={{
                ...s.heroSecondary,
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              I'm a candidate →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={s.brandWrap}>
              <div style={s.brandIcon}>
                <span style={s.brandMark}>HF</span>
              </div>
              <span style={{ ...s.brandName, color: "#fff" }}>HireFlow</span>
            </div>
            <p style={s.footerTagline}>AI-powered hiring built for speed.</p>
          </div>
          <div style={s.footerLinks}>
            {[
              {
                heading: "Product",
                links: ["Features", "How it works", "Pricing", "Changelog"],
              },
              {
                heading: "Use cases",
                links: [
                  "For recruiters",
                  "For candidates",
                  "For startups",
                  "For agencies",
                ],
              },
              {
                heading: "Resources",
                links: ["Documentation", "API reference", "Status", "Support"],
              },
            ].map((col) => (
              <div key={col.heading} style={s.footerCol}>
                <div style={s.footerColHead}>{col.heading}</div>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={s.footerLink}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255,255,255,0.4)")
                    }
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={s.footerBottom}>
          <span style={s.footerCopy}>
            © 2025 HireFlow. Built with Groq, MongoDB, and React.
          </span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#" style={s.footerLink}>
              Privacy
            </a>
            <a href="#" style={s.footerLink}>
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#F7F5EF",
    minHeight: "100vh",
    overflowX: "hidden",
  },

  // Nav
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: "transparent",
    transition: "background 0.2s, border-bottom 0.2s",
    borderBottom: "1px solid transparent",
  },
  navScrolled: {
    background: "#fff",
    borderBottom: "1px solid rgba(11,14,20,0.10)",
  },
  navInner: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "0 28px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  brandIcon: {
    width: "30px",
    height: "30px",
    background: "#FF4D2E",
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "11px",
    color: "#fff",
  },
  brandName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "17px",
    color: "#0B0E14",
    letterSpacing: "-0.01em",
  },
  navLinks: { display: "flex", gap: "4px", alignItems: "center" },
  navLink: {
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#5C5F6B",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  navActions: { display: "flex", alignItems: "center", gap: "8px" },
  navLoginBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#0B0E14",
    textDecoration: "none",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: "11px",
  },
  navCta: {
    padding: "9px 16px",
    background: "#0B0E14",
    color: "#fff",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    textDecoration: "none",
  },

  // Hero
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "120px 28px 80px",
    maxWidth: "1160px",
    margin: "0 auto",
    gap: "60px",
  },
  heroGrid: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    backgroundImage:
      "linear-gradient(rgba(11,14,20,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,14,20,0.05) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    pointerEvents: "none",
  },
  heroInner: { flex: 1, maxWidth: "580px" },
  heroEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#FF4D2E",
    border: "1px solid rgba(255,77,46,0.25)",
    padding: "5px 10px",
    marginBottom: "24px",
  },
  heroH1: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "clamp(40px, 6vw, 68px)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    color: "#0B0E14",
    margin: "0 0 20px",
  },
  heroH1Accent: { color: "#FF4D2E" },
  heroSub: {
    fontSize: "17px",
    color: "#5C5F6B",
    lineHeight: 1.7,
    margin: "0 0 32px",
    maxWidth: "500px",
  },
  heroCtas: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "32px",
  },
  heroPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 22px",
    background: "#0B0E14",
    color: "#fff",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    textDecoration: "none",
  },
  heroSecondary: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#5C5F6B",
    textDecoration: "none",
    border: "1px solid rgba(11,14,20,0.20)",
    padding: "13px 22px",
  },
  heroSocialProof: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  heroCompany: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    color: "#8A8D98",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    border: "1px solid rgba(11,14,20,0.10)",
    padding: "4px 9px",
  },
  heroCompanyMore: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    color: "#FF4D2E",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  // Hero visual
  heroVisual: { position: "relative", flexShrink: 0 },
  heroCard: {
    width: "320px",
    background: "#fff",
    border: "1px solid rgba(11,14,20,0.10)",
    padding: "20px",
    position: "relative",
  },
  heroCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  heroCardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    color: "#0B0E14",
  },
  heroCardSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#8A8D98",
    marginTop: "3px",
    letterSpacing: "0.04em",
  },
  heroCardScore: { textAlign: "right" },
  heroScoreNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    color: "#1D8A4E",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  heroScoreSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#8A8D98",
  },
  heroCardDivider: {
    borderTop: "1px solid rgba(11,14,20,0.08)",
    margin: "10px 0 14px",
  },
  heroCardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(11,14,20,0.08)",
  },
  heroStatusBadge: {
    marginLeft: "auto",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#1D8A4E",
    background: "rgba(29,138,78,0.10)",
    padding: "3px 8px",
  },
  floatBadge: {
    position: "absolute",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "#fff",
    border: "1px solid rgba(11,14,20,0.10)",
    padding: "6px 10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: "#0B0E14",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  // Score bars
  barLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    color: "#8A8D98",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  barTrack: {
    height: "3px",
    background: "rgba(11,14,20,0.06)",
    overflow: "hidden",
  },

  // Stats bar
  statsBar: {
    background: "#fff",
    borderTop: "1px solid rgba(11,14,20,0.08)",
    borderBottom: "1px solid rgba(11,14,20,0.08)",
  },
  statsInner: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statBlock: { padding: "28px 20px", textAlign: "center" },
  statNum: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "36px",
    color: "#0B0E14",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    color: "#8A8D98",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: "6px",
  },
  statsDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(11,14,20,0.10)",
  },

  // Sections
  section: { padding: "100px 0" },
  sectionInner: { maxWidth: "1160px", margin: "0 auto", padding: "0 28px" },
  sectionEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#FF4D2E",
    marginBottom: "16px",
  },
  sectionH2: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(28px, 4vw, 44px)",
    letterSpacing: "-0.02em",
    color: "#0B0E14",
    margin: "0 0 16px",
    lineHeight: 1.1,
  },
  sectionSub: {
    fontSize: "16px",
    color: "#5C5F6B",
    lineHeight: 1.7,
    margin: "0 0 48px",
    maxWidth: "580px",
  },

  // Features
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1px",
    background: "rgba(11,14,20,0.10)",
    border: "1px solid rgba(11,14,20,0.10)",
  },
  featureCard: {
    background: "#fff",
    padding: "28px",
    borderLeft: "3px solid rgba(11,14,20,0.10)",
    transition: "border-left-color 0.2s",
  },
  featureIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    transition: "background 0.2s",
  },
  featureTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#0B0E14",
    letterSpacing: "-0.01em",
    marginBottom: "8px",
  },
  featureDesc: { fontSize: "13px", color: "#5C5F6B", lineHeight: 1.7 },

  // How it works
  stepsLayout: {
    display: "flex",
    gap: "60px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  stepsList: { flex: 1, minWidth: "280px" },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    cursor: "pointer",
    borderLeft: "2px solid transparent",
    marginBottom: "4px",
    transition: "border-color 0.2s, background 0.2s",
  },
  stepItemActive: {
    borderLeft: "2px solid #FF4D2E",
    background: "rgba(255,77,46,0.05)",
  },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "0.04em",
    flexShrink: 0,
    paddingTop: "2px",
  },
  stepNumActive: { color: "#FF4D2E" },
  stepTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "-0.01em",
    marginBottom: "4px",
  },
  stepDesc: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.65,
    marginTop: "6px",
  },

  stepVisual: { flex: 1, minWidth: "280px", maxWidth: "360px" },
  stepVisFade: { animation: "fadeIn 0.3s ease" },
  stepVisCard: {
    background: "#12161F",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
  },
  stepVisLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  stepVisTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "18px",
    color: "#fff",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  stepVisSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.04em",
  },
  stepVisRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "14px",
  },
  skillTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "3px 9px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  progressRow: { marginTop: "12px" },
  progressLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.04em",
    marginBottom: "5px",
  },
  progressBar: {
    height: "3px",
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", transition: "width 1s ease" },

  aiScoreDisplay: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    margin: "12px 0 4px",
  },
  aiScoreBig: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "56px",
    color: "#C8FF4D",
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  aiScoreLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.04em",
  },

  calendarBlock: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
  },

  // XAI showcase
  xaiLayout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "60px",
    alignItems: "center",
  },
  xaiLeft: {},
  xaiCheckList: { marginBottom: "28px" },
  xaiCheck: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  xaiCheckText: { fontSize: "14px", color: "#5C5F6B" },
  xaiRight: {},
  xaiCard: {
    background: "#0B0E14",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "20px",
  },
  xaiCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  xaiCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  xaiRec: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#1D8A4E",
    background: "rgba(29,138,78,0.15)",
    padding: "3px 9px",
  },
  xaiSummary: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.7,
    marginBottom: "14px",
  },
  xaiStrengths: {
    background: "rgba(29,138,78,0.08)",
    borderLeft: "3px solid #1D8A4E",
    padding: "12px 14px",
  },
  xaiStrengthTitle: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: "#1D8A4E",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },
  xaiStrengthItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.5,
    marginBottom: "5px",
  },

  // Testimonials
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1px",
    background: "rgba(11,14,20,0.10)",
    border: "1px solid rgba(11,14,20,0.10)",
  },
  testimonialCard: {
    background: "#fff",
    padding: "28px",
    position: "relative",
  },
  quoteAccent: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "64px",
    lineHeight: 1,
    color: "#E5E1D4",
    fontWeight: 700,
    marginBottom: "-16px",
  },
  quoteText: {
    fontSize: "14px",
    color: "#5C5F6B",
    lineHeight: 1.75,
    marginBottom: "20px",
  },
  testimonialFooter: { display: "flex", alignItems: "center", gap: "10px" },
  testimonialAvatar: {
    width: "32px",
    height: "32px",
    background: "#0B0E14",
    color: "#C8FF4D",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  testimonialName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    color: "#0B0E14",
  },
  testimonialRole: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#8A8D98",
    letterSpacing: "0.04em",
  },
  testimonialScore: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    marginLeft: "auto",
    background: "rgba(176,122,14,0.10)",
    padding: "3px 8px",
  },

  // Pricing
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    maxWidth: "680px",
    margin: "0 auto",
  },
  pricingCard: {
    background: "#12161F",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "28px",
  },
  pricingCardAccent: { border: "1px solid #C8FF4D" },
  pricingTier: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "12px",
  },
  pricingPrice: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "38px",
    color: "#fff",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  pricingSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 400,
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
  },
  pricingDivider: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    margin: "20px 0",
  },
  pricingFeature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "10px",
  },
  pricingCta: {
    display: "block",
    marginTop: "24px",
    padding: "11px",
    border: "1px solid rgba(255,255,255,0.20)",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    textDecoration: "none",
    textAlign: "center",
  },
  pricingCtaAccent: { background: "#C8FF4D", color: "#0B0E14", border: "none" },

  // Tech
  techGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  techPill: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: 600,
    color: "#5C5F6B",
    border: "1px solid rgba(11,14,20,0.15)",
    padding: "5px 12px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  // Final CTA
  finalCta: {
    position: "relative",
    background: "#0B0E14",
    padding: "120px 28px",
    textAlign: "center",
    overflow: "hidden",
  },
  finalCtaGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(200,255,77,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,77,0.04) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    pointerEvents: "none",
  },
  finalCtaInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: "640px",
    margin: "0 auto",
  },
  finalCtaEyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(200,255,77,0.8)",
    marginBottom: "20px",
  },
  finalCtaH2: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "clamp(32px, 5vw, 52px)",
    letterSpacing: "-0.03em",
    color: "#fff",
    margin: "0 0 16px",
    lineHeight: 1.1,
  },
  finalCtaSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.7,
    margin: "0 auto 36px",
    maxWidth: "440px",
  },

  // Footer
  footer: {
    background: "#0B0E14",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerInner: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "60px 28px 40px",
    display: "flex",
    gap: "60px",
    flexWrap: "wrap",
  },
  footerBrand: { minWidth: "200px" },
  footerTagline: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.3)",
    marginTop: "12px",
    lineHeight: 1.6,
  },
  footerLinks: { flex: 1, display: "flex", gap: "40px", flexWrap: "wrap" },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "120px",
  },
  footerColHead: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  footerLink: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  footerBottom: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "20px 28px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  footerCopy: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.04em",
  },
};
