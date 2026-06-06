import dotenv    from 'dotenv'
dotenv.config()

import mongoose  from 'mongoose'
import bcrypt    from 'bcryptjs'
import User        from './models/user.model.js'
import Job         from './models/job.model.js'
import Resume      from './models/resume.model.js'
import Application from './models/application.model.js'
import Conversation from './models/conversation.model.js'
import Message      from './models/message.model.js'
import Interview    from './models/interview.model.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // ── Wipe existing demo data ─────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Resume.deleteMany({}),
      Application.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Interview.deleteMany({}),
    ])
    console.log('Cleared existing data')

    // ── Create recruiters ───────────────────────────────────────────
    const hashedPw = await bcrypt.hash('demo1234', 12)

    const [recruiter1, recruiter2] = await User.create([
      {
        name:     'Priya Sharma',
        email:    'recruiter@demo.com',
        password: hashedPw,
        role:     'recruiter',
        company:  'TechCorp India',
      },
      {
        name:     'Arjun Mehta',
        email:    'recruiter2@demo.com',
        password: hashedPw,
        role:     'recruiter',
        company:  'StartupXYZ',
      },
    ])
    console.log('✅ Recruiters created')

    // ── Create candidates ───────────────────────────────────────────
    const [c1, c2, c3, c4, c5] = await User.create([
      {
        name:     'Rahul Gupta',
        email:    'candidate@demo.com',
        password: hashedPw,
        role:     'candidate',
        github: {
          connected:         true,
          username:          'rahulgupta-dev',
          profileUrl:        'https://github.com/rahulgupta-dev',
          avatarUrl:         'https://avatars.githubusercontent.com/u/1',
          bio:               'Full stack developer | Open source enthusiast',
          followers:         142,
          publicRepos:       38,
          topLanguages:      ['JavaScript', 'TypeScript', 'Python', 'Go'],
          totalStars:        284,
          contributionScore: 74,
          pinnedRepos: [
            { name: 'react-dashboard', description: 'Analytics dashboard built with React and D3', stars: 87, language: 'TypeScript', url: 'https://github.com' },
            { name: 'node-api-starter', description: 'Production-ready Express + MongoDB starter', stars: 143, language: 'JavaScript', url: 'https://github.com' },
          ],
          lastSynced: new Date(),
        },
      },
      {
        name:     'Sneha Patel',
        email:    'candidate2@demo.com',
        password: hashedPw,
        role:     'candidate',
      },
      {
        name:     'Vikram Singh',
        email:    'candidate3@demo.com',
        password: hashedPw,
        role:     'candidate',
      },
      {
        name:     'Ananya Krishnan',
        email:    'candidate4@demo.com',
        password: hashedPw,
        role:     'candidate',
      },
      {
        name:     'Rohan Verma',
        email:    'candidate5@demo.com',
        password: hashedPw,
        role:     'candidate',
      },
    ])
    console.log('✅ Candidates created')

    // ── Create jobs ─────────────────────────────────────────────────
    const [job1, job2, job3] = await Job.create([
      {
        title:           'Senior Full Stack Developer',
        description:     'We are looking for a Senior Full Stack Developer to join our growing engineering team at TechCorp India. You will be responsible for building and maintaining scalable web applications using React, Node.js, and MongoDB. You should have strong experience with REST API design, microservices architecture, and cloud deployments on AWS. Experience with TypeScript, Redis, and CI/CD pipelines is highly preferred. You will work closely with the product and design teams to deliver high-quality features.',
        company:         'TechCorp India',
        location:        'Bangalore / Remote',
        skillsRequired:  ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'Redis', 'REST APIs'],
        experienceYears: 3,
        salary:          '₹18–28 LPA',
        status:          'open',
        recruiter:       recruiter1._id,
      },
      {
        title:           'React Frontend Engineer',
        description:     'StartupXYZ is building the next generation of fintech tools and we need a talented React Frontend Engineer. You will own the frontend architecture, implement pixel-perfect UIs from Figma designs, and optimize performance for our high-traffic dashboard. Must have experience with React hooks, state management (Redux or Zustand), and modern CSS. Experience with React Query, testing with Jest, and accessibility standards is a plus. We move fast and value clean, maintainable code.',
        company:         'StartupXYZ',
        location:        'Remote',
        skillsRequired:  ['React', 'TypeScript', 'Redux', 'Jest', 'CSS', 'Figma', 'React Query'],
        experienceYears: 2,
        salary:          '₹12–20 LPA',
        status:          'open',
        recruiter:       recruiter2._id,
      },
      {
        title:           'Backend Engineer — Node.js',
        description:     'TechCorp India is hiring a Backend Engineer to scale our core platform APIs. You will design and implement high-performance RESTful APIs, work with distributed systems, and optimize database queries. Strong proficiency in Node.js, Express, and SQL/NoSQL databases is required. You should be comfortable with Docker, Kubernetes, and deploying to cloud infrastructure. Experience with message queues (Bull, RabbitMQ) and WebSocket implementation is a big plus.',
        company:         'TechCorp India',
        location:        'Hyderabad / Remote',
        skillsRequired:  ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'Redis', 'Bull Queue'],
        experienceYears: 2,
        salary:          '₹15–22 LPA',
        status:          'open',
        recruiter:       recruiter1._id,
      },
    ])
    console.log('✅ Jobs created')

    // ── Create resumes ──────────────────────────────────────────────
    const resumeTexts = [
      // Rahul — strong candidate
      `Rahul Gupta | rahulgupta@email.com | github.com/rahulgupta-dev
Senior Full Stack Developer — 4 years experience
Skills: React, TypeScript, Node.js, MongoDB, Redis, AWS, Docker, REST APIs, GraphQL
Experience:
  TechSolutions (2021–present): Led development of React dashboard serving 50k users. Built Node.js microservices handling 1M daily requests. Reduced API latency by 40% through Redis caching.
  WebAgency (2020–2021): Built 15+ client projects using React and Node.js.
Education: B.Tech Computer Science, IIT Delhi 2020
Projects: Open source React component library (200+ stars), real-time chat app with WebSockets`,

      // Sneha — decent candidate
      `Sneha Patel | sneha@email.com
Frontend Developer — 2 years experience
Skills: React, JavaScript, CSS, HTML, Git, Redux, REST APIs
Experience:
  DigitalAgency (2022–present): Developed React applications for 5 clients. Implemented Redux for state management. Worked with REST APIs.
  Freelance (2021–2022): Built websites for local businesses.
Education: B.E. Computer Engineering, Pune University 2021`,

      // Vikram — average candidate
      `Vikram Singh | vikram@email.com
Web Developer — 1.5 years experience
Skills: JavaScript, React basics, HTML, CSS, Node.js basics
Experience:
  Startup (2023–present): Working on frontend features using React. Some Node.js backend work.
Education: BCA, Delhi University 2022`,

      // Ananya — strong backend candidate
      `Ananya Krishnan | ananya@email.com
Backend Engineer — 3 years experience
Skills: Node.js, Express, PostgreSQL, MongoDB, Docker, Kubernetes, Redis, Bull Queue, Python
Experience:
  FinTech Corp (2021–present): Designed RESTful APIs handling 500k daily transactions. Built job queue system with Bull. Deployed microservices on Kubernetes.
  DataSystems (2020–2021): Built data pipelines in Python. PostgreSQL optimization.
Education: M.Tech Computer Science, BITS Pilani 2020`,

      // Rohan — junior candidate
      `Rohan Verma | rohan@email.com
Junior Developer — 6 months experience
Skills: HTML, CSS, JavaScript, React (learning), Python basics
Experience:
  Internship at WebCo (2024): Built static pages, minor bug fixes.
Education: B.Tech IT, VIT 2024 (recent graduate)`,
    ]

    const resumes = await Resume.create([
      { candidate: c1._id, fileUrl: 'uploads/seed-resume-1.pdf', fileName: 'rahul_gupta_resume.pdf', parsedText: resumeTexts[0] },
      { candidate: c2._id, fileUrl: 'uploads/seed-resume-2.pdf', fileName: 'sneha_patel_resume.pdf', parsedText: resumeTexts[1] },
      { candidate: c3._id, fileUrl: 'uploads/seed-resume-3.pdf', fileName: 'vikram_singh_resume.pdf', parsedText: resumeTexts[2] },
      { candidate: c4._id, fileUrl: 'uploads/seed-resume-4.pdf', fileName: 'ananya_krishnan_resume.pdf', parsedText: resumeTexts[3] },
      { candidate: c5._id, fileUrl: 'uploads/seed-resume-5.pdf', fileName: 'rohan_verma_resume.pdf', parsedText: resumeTexts[4] },
    ])
    console.log('✅ Resumes created')

    // ── Create applications with pre-filled AI scores ───────────────
    // We pre-fill scores so demo works without hitting Groq API
    const applications = await Application.create([
      // Job 1: Senior Full Stack — 4 candidates applied
      {
        job: job1._id, candidate: c1._id, resume: resumes[0]._id,
        status: 'shortlisted',
        aiScore: 88, embeddingScore: 0.82,
        aiReasoning: 'Rahul is an excellent match — 4 years of directly relevant experience with React, Node.js, MongoDB, and AWS. His open source contributions and measurable impact (40% latency reduction) show strong engineering depth. GitHub activity confirms consistent coding habit.',
        aiMissingSkills: ['TypeScript (intermediate)'],
        aiInterviewQuestions: [
          'Walk me through how you reduced API latency by 40% — what was the bottleneck and how did Redis help?',
          'How do you structure a large React application? What patterns do you use for state management?',
          'Describe a time you had to make a difficult technical trade-off under deadline pressure.',
          'How would you design a system to handle 10M daily API requests on AWS?',
          'What is your experience with microservices — how do you handle inter-service communication?',
        ],
        githubInsights: 'GitHub shows 38 public repos with 284 total stars — strong open source presence. Top languages match the role perfectly. Contribution score of 74/100 indicates consistent coding activity.',
        xai: {
          dimensions: {
            technicalSkills:      { score: 9, reasoning: 'React, Node.js, MongoDB, Redis, AWS all confirmed in resume and GitHub', highlights: ['React dashboard with 50k users', 'Node.js microservices at scale'], gaps: ['TypeScript could be stronger'] },
            experienceDepth:      { score: 8, reasoning: '4 years with measurable impact — 1M daily requests, 50k user dashboard', highlights: ['Led development at TechSolutions', 'Quantified performance improvements'], gaps: [] },
            projectImpact:        { score: 9, reasoning: 'Open source library with 200+ stars shows real-world impact beyond job work', highlights: ['200+ star React library', 'Real-time chat app'], gaps: [] },
            communicationClarity: { score: 8, reasoning: 'Resume uses strong action verbs and quantified achievements throughout', highlights: ['Clear metrics', 'Well structured sections'], gaps: [] },
            growthPotential:      { score: 8, reasoning: 'Active GitHub, open source contributor, strong trajectory from 2020', highlights: ['Consistent contributions', 'Self-directed learning visible'], gaps: [] },
          },
          summary: 'Rahul is a strong candidate who exceeds requirements for this role. His combination of professional experience, measurable impact, and active open source work makes him a top-tier applicant.',
          topStrengths:   ['Full stack experience across the exact required stack', 'Proven scalability experience with quantified results', 'Active open source contributor'],
          criticalGaps:   ['TypeScript depth unclear'],
          interviewFocus: ['System design and scalability thinking', 'TypeScript proficiency assessment'],
        },
      },
      {
        job: job1._id, candidate: c2._id, resume: resumes[1]._id,
        status: 'screened',
        aiScore: 58, embeddingScore: 0.51,
        aiReasoning: 'Sneha has solid React and Redux skills but lacks the backend depth (Node.js, MongoDB) required for a full stack senior role. 2 years of experience falls short of the 3+ year requirement. Worth a conversation but not an immediate shortlist.',
        aiMissingSkills: ['Node.js', 'MongoDB', 'AWS', 'Redis', 'TypeScript'],
        aiInterviewQuestions: [
          'How comfortable are you picking up Node.js backend development alongside React work?',
          'Tell me about the most complex Redux implementation you have worked on.',
          'How do you approach performance optimization in React applications?',
        ],
        xai: {
          dimensions: {
            technicalSkills:      { score: 6, reasoning: 'Strong frontend skills, limited backend exposure', highlights: ['React and Redux experience'], gaps: ['No Node.js or MongoDB', 'No cloud experience'] },
            experienceDepth:      { score: 5, reasoning: '2 years total, mostly agency work without measurable scale', highlights: ['5 client projects'], gaps: ['No large-scale systems', 'Below seniority requirement'] },
            projectImpact:        { score: 4, reasoning: 'Client websites — functional but limited scope', highlights: [], gaps: ['No open source', 'No quantified impact'] },
            communicationClarity: { score: 7, reasoning: 'Clear resume structure', highlights: ['Well organized'], gaps: [] },
            growthPotential:      { score: 6, reasoning: 'Shows progression from freelance to agency', highlights: ['Self-starter'], gaps: [] },
          },
          summary: 'Sneha is a capable frontend developer but the role requires strong full stack skills. She meets about 60% of the requirements.',
          topStrengths:   ['Solid React and Redux skills', 'Clean portfolio'],
          criticalGaps:   ['No backend experience', 'Below experience requirement'],
          interviewFocus: ['Backend learning willingness', 'Depth of frontend knowledge'],
        },
      },
      {
        job: job1._id, candidate: c3._id, resume: resumes[2]._id,
        status: 'screened',
        aiScore: 32, embeddingScore: 0.28,
        aiReasoning: 'Vikram is at a junior level with only 1.5 years of experience and basic skills. This role requires 3+ years and senior-level expertise. Not a match for this position but may be suitable for junior roles.',
        aiMissingSkills: ['TypeScript', 'AWS', 'Redis', 'MongoDB', 'Node.js (advanced)', 'Microservices'],
        aiInterviewQuestions: [
          'What are your career goals for the next 2 years?',
          'What is the most complex React application you have built?',
        ],
        xai: {
          dimensions: {
            technicalSkills:      { score: 3, reasoning: 'Basic React and JavaScript only', highlights: [], gaps: ['Missing most required skills'] },
            experienceDepth:      { score: 2, reasoning: '1.5 years, basic tasks only', highlights: [], gaps: ['Significantly below seniority level'] },
            projectImpact:        { score: 2, reasoning: 'No notable projects mentioned', highlights: [], gaps: [] },
            communicationClarity: { score: 5, reasoning: 'Resume is clear but thin on substance', highlights: [], gaps: [] },
            growthPotential:      { score: 6, reasoning: 'Early career, potential to grow', highlights: ['Young career'], gaps: [] },
          },
          summary: 'Vikram is too junior for this senior role. Not recommended for this position.',
          topStrengths:   ['Growth potential'],
          criticalGaps:   ['Insufficient experience', 'Missing core technical skills'],
          interviewFocus: ['Long-term career goals'],
        },
      },
      // Job 2: React Frontend — 2 candidates applied
      {
        job: job2._id, candidate: c2._id, resume: resumes[1]._id,
        status: 'shortlisted',
        aiScore: 76, embeddingScore: 0.71,
        aiReasoning: 'Sneha is a good match for this frontend role — her React, Redux, and API experience directly align. The role is more focused than the senior full stack position and matches her 2-year profile well.',
        aiMissingSkills: ['TypeScript', 'Jest testing', 'Figma'],
        aiInterviewQuestions: [
          'How do you optimize React application performance for large datasets?',
          'Walk me through a Redux architecture you designed from scratch.',
          'How do you approach responsive design and cross-browser compatibility?',
          'Have you written unit tests for React components? What tools do you use?',
        ],
        xai: {
          dimensions: {
            technicalSkills:      { score: 7, reasoning: 'React and Redux are strong, TypeScript and testing missing', highlights: ['React expertise', 'Redux state management'], gaps: ['No TypeScript', 'No Jest'] },
            experienceDepth:      { score: 6, reasoning: '2 years matches the requirement for this role', highlights: ['Agency experience'], gaps: [] },
            projectImpact:        { score: 5, reasoning: 'Client projects done but limited quantified impact', highlights: [], gaps: [] },
            communicationClarity: { score: 7, reasoning: 'Clear resume', highlights: [], gaps: [] },
            growthPotential:      { score: 7, reasoning: 'Solid trajectory', highlights: [], gaps: [] },
          },
          summary: 'Sneha is a reasonable match for this React-focused role. Her core skills align well.',
          topStrengths:   ['React and Redux proficiency', 'Relevant experience level'],
          criticalGaps:   ['TypeScript not mentioned', 'No testing experience shown'],
          interviewFocus: ['TypeScript comfort level', 'Testing philosophy'],
        },
      },
      // Job 3: Backend Node.js — Ananya applied
      {
        job: job3._id, candidate: c4._id, resume: resumes[3]._id,
        status: 'shortlisted',
        aiScore: 91, embeddingScore: 0.88,
        aiReasoning: 'Ananya is an exceptional match — her 3 years of backend experience at a fintech company directly mirrors this role. PostgreSQL, MongoDB, Docker, Kubernetes, Bull Queue are all confirmed. Strong technical depth with measurable production impact.',
        aiMissingSkills: [],
        aiInterviewQuestions: [
          'How did you design the job queue system at FinTech Corp — what was the scale and what challenges did you face?',
          'How do you approach database query optimization when you have 500k daily transactions?',
          'Walk me through your experience with Kubernetes — what have you deployed and managed?',
          'How do you handle distributed system failures and ensure data consistency?',
          'Describe your approach to API versioning and backward compatibility.',
        ],
        xai: {
          dimensions: {
            technicalSkills:      { score: 10, reasoning: 'Every required skill confirmed — Node.js, PostgreSQL, MongoDB, Docker, Kubernetes, Redis, Bull Queue', highlights: ['All required skills matched', 'Advanced Kubernetes experience'], gaps: [] },
            experienceDepth:      { score: 9, reasoning: '3 years at fintech scale with 500k daily transactions', highlights: ['Production fintech systems', 'Data pipeline experience'], gaps: [] },
            projectImpact:        { score: 9, reasoning: 'Quantified impact — 500k transactions, Kubernetes deployments', highlights: ['Real production scale', 'Measurable results'], gaps: [] },
            communicationClarity: { score: 8, reasoning: 'Resume is concise and achievement-focused', highlights: [], gaps: [] },
            growthPotential:      { score: 9, reasoning: 'M.Tech from BITS Pilani, strong progression', highlights: ['Top tier education', 'Consistent growth'], gaps: [] },
          },
          summary: 'Ananya is an outstanding candidate — she exceeds all requirements for this backend role with directly relevant fintech experience at scale.',
          topStrengths:   ['Perfect technical skill match', 'Fintech production experience', 'Kubernetes and cloud expertise'],
          criticalGaps:   [],
          interviewFocus: ['System design depth', 'Leadership and ownership style'],
        },
      },
    ])
    console.log('✅ Applications created')

    // ── Create a scheduled interview ────────────────────────────────
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 3)
    futureDate.setHours(10, 0, 0, 0)

    await Interview.create({
      application:   applications[0]._id,
      job:           job1._id,
      recruiter:     recruiter1._id,
      candidate:     c1._id,
      slots:         [{ dateTime: futureDate, available: true }],
      confirmedSlot: futureDate,
      meetLink:      'https://meet.google.com/demo-link',
      notes:         'This will be a 1-hour technical interview covering system design and React.',
      status:        'scheduled',
    })
    console.log('✅ Interview created')

    // ── Create a conversation with messages ─────────────────────────
    const conv = await Conversation.create({
      job:             job1._id,
      application:     applications[0]._id,
      recruiter:       recruiter1._id,
      candidate:       c1._id,
      lastMessage:     'Looking forward to speaking with you!',
      lastMessageAt:   new Date(),
      unreadRecruiter: 0,
      unreadCandidate: 1,
    })

    await Message.create([
      {
        conversation: conv._id,
        sender:       recruiter1._id,
        senderRole:   'recruiter',
        text:         'Hi Rahul, we loved your profile! Would you be available for a technical interview next week?',
        read:         true,
        createdAt:    new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        conversation: conv._id,
        sender:       c1._id,
        senderRole:   'candidate',
        text:         'Hi Priya! Yes, absolutely. I am very excited about this opportunity at TechCorp.',
        read:         true,
        createdAt:    new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        conversation: conv._id,
        sender:       recruiter1._id,
        senderRole:   'recruiter',
        text:         'Looking forward to speaking with you!',
        read:         false,
        createdAt:    new Date(),
      },
    ])
    console.log('✅ Conversations and messages created')

    // ── Print credentials ───────────────────────────────────────────
    console.log('\n🌱 Seed complete! Demo credentials:\n')
    console.log('RECRUITERS:')
    console.log('  recruiter@demo.com  / demo1234  (TechCorp India)')
    console.log('  recruiter2@demo.com / demo1234  (StartupXYZ)\n')
    console.log('CANDIDATES:')
    console.log('  candidate@demo.com  / demo1234  (Rahul — strong, GitHub connected)')
    console.log('  candidate2@demo.com / demo1234  (Sneha — mid level)')
    console.log('  candidate3@demo.com / demo1234  (Vikram — junior)')
    console.log('  candidate4@demo.com / demo1234  (Ananya — strong backend)')
    console.log('  candidate5@demo.com / demo1234  (Rohan — entry level)\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()