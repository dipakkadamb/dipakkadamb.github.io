import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Bot, Server, Workflow, Database, Code2, Mail, Linkedin, Phone,
  MapPin, ExternalLink, ChevronDown, Cpu, Globe, Shield, LayoutTemplate,
  GitBranch, Terminal, Activity, Menu, X, ArrowUpRight, Zap,
} from 'lucide-react'

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['About', 'Stack', 'Experience', 'Services', 'Contact']

const TECH_STACK = [
  {
    category: 'Web & AI',
    icon: <Bot size={20} />,
    color: 'from-royal to-accent-cyan',
    borderColor: 'border-royal/30',
    glowColor: 'rgba(26,86,219,0.25)',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React.js', 'ChatGPT API', 'GitHub Copilot'],
  },
  {
    category: 'Zoho Ecosystem',
    icon: <Workflow size={20} />,
    color: 'from-accent-teal to-royal',
    borderColor: 'border-accent-teal/30',
    glowColor: 'rgba(20,184,166,0.2)',
    items: ['Zoho CRM', 'Zoho Flow', 'Zoho Creator', 'Deluge Scripting', 'REST APIs', 'Webhooks'],
  },
  {
    category: 'IT Infrastructure',
    icon: <Server size={20} />,
    color: 'from-slate-400 to-slate-600',
    borderColor: 'border-white/10',
    glowColor: 'rgba(100,116,139,0.15)',
    items: ['Windows Server', 'Linux Admin', 'Grafana', 'Zabbix', 'PowerShell', 'Bash Scripting'],
  },
]

const EXPERIENCE = [
  {
    company: 'ZM Technologies',
    role: 'AI Web Developer',
    period: 'Sept 2025 – Present',
    type: 'Full-time · Pune',
    color: 'royal',
    dotColor: 'bg-royal',
    icon: <Bot size={16} />,
    highlights: [
      'Building AI-enhanced web applications using HTML, CSS, JavaScript, and React.',
      'Automating lead capture and data synchronization via Zoho CRM & Zoho Flow using REST APIs and Webhooks.',
      'Implementing AI features including intelligent chatbots, automated forms, and AI-based security integrations.',
      'Leveraging GitHub Copilot and ChatGPT API to accelerate development velocity and code quality.',
      'Maintaining clear API and workflow documentation for long-term system scalability.',
    ],
    tags: ['React.js', 'Zoho CRM', 'Zoho Flow', 'REST API', 'ChatGPT API', 'GitHub Copilot'],
  },
  {
    company: 'Royaltech',
    role: 'System Engineer',
    period: 'Apr 2025 – Sept 2025',
    type: 'Full-time · Pune',
    color: 'teal',
    dotColor: 'bg-accent-teal',
    icon: <Server size={16} />,
    highlights: [
      'Designed and deployed scalable, secure IT environments with high availability and fault tolerance.',
      'Managed Windows Server and Linux systems, virtualization platforms, and enterprise networking components.',
      'Proactively monitored system performance using Grafana and Zabbix, preventing potential outages.',
      'Automated routine administrative tasks using Python, PowerShell, and Bash scripting.',
      'Led capacity planning efforts, analyzing usage trends to prepare infrastructure for future growth.',
    ],
    tags: ['Linux', 'Windows Server', 'Grafana', 'Zabbix', 'Python', 'PowerShell', 'Bash'],
  },
  {
    company: 'SKS Engineering Solutions',
    role: 'IT Administrator',
    period: 'Jul 2024 – Mar 2025',
    type: 'Full-time · Pune',
    color: 'slate',
    dotColor: 'bg-slate-400',
    icon: <Shield size={16} />,
    highlights: [
      'Managed end-to-end IT infrastructure including servers, networks, and user environments.',
      'Administered user accounts, access controls, and application software across the organization.',
      'Performed regular patching, backup, and disaster recovery operations to minimize downtime.',
      'Implemented security controls and monitored system access to ensure data protection compliance.',
      'Automated routine admin tasks via scripts, reducing manual errors and improving team efficiency.',
    ],
    tags: ['IT Admin', 'Security', 'Backup & Recovery', 'Networking', 'User Management'],
  },
]

const SERVICES = [
  {
    icon: <Bot size={28} />,
    title: 'AI Web Development',
    desc: 'Building modern, responsive websites accelerated by AI tools. From intelligent forms and chatbot integrations to performance-optimized single-page apps — delivered faster with higher quality.',
    gradient: 'from-royal/20 to-accent-cyan/10',
    border: 'hover:border-royal/40',
    features: ['AI Chatbot Integration', 'Intelligent Forms', 'React.js SPAs', 'Performance Optimization'],
  },
  {
    icon: <Workflow size={28} />,
    title: 'Zoho Automation',
    desc: 'End-to-end business workflow automation using the full Zoho ecosystem. Seamless CRM integration, Deluge scripting, and multi-platform orchestration via Flow.',
    gradient: 'from-accent-teal/20 to-royal/10',
    border: 'hover:border-accent-teal/40',
    features: ['Zoho CRM Setup & Integration', 'Zoho Flow Automation', 'Deluge Custom Scripts', 'Lead Capture Pipelines'],
  },
  {
    icon: <Server size={28} />,
    title: 'IT Infrastructure Consultancy',
    desc: 'Comprehensive server management, security auditing, and infrastructure design. Scalable, resilient, and monitored environments built for business continuity.',
    gradient: 'from-slate-600/20 to-slate-800/10',
    border: 'hover:border-white/20',
    features: ['Server Design & Deployment', 'Security Hardening', 'Monitoring Setup (Grafana/Zabbix)', 'Disaster Recovery Planning'],
  },
]

const STATS = [
  { value: '6+', label: 'Years in Tech' },
  { value: '3+', label: 'Zoho Products Mastered' },
  { value: '100%', label: 'AI-Assisted Workflows' },
  { value: '∞', label: 'Automation Potential' },
]

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

function SectionWrapper({ id, children, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id={id} ref={ref} className={`py-24 md:py-32 ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-6xl mx-auto px-6 md:px-10"
      >
        {children}
      </motion.div>
    </section>
  )
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="mb-16">
      <motion.span variants={fadeUp} className="section-label">{label}</motion.span>
      <motion.h2 variants={fadeUp} custom={1} className="section-title mb-4">{title}</motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} custom={2} className="text-text-secondary text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy-900/95 backdrop-blur-xl border-b border-white/[0.06] py-3' : 'py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center text-white font-bold text-sm shadow-royal">
            DK
          </div>
          <span className="font-bold text-text-primary tracking-tight hidden sm:block">
            Dipak<span className="text-royal">.</span>
          </span>
        </motion.div>

        {/* Desktop Links */}
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center gap-8"
        >
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                onClick={() => scrollTo(link)}
                className="text-text-secondary hover:text-white text-sm font-medium tracking-wide transition-colors duration-200"
              >
                {link}
              </button>
            </li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block"
        >
          <button onClick={() => scrollTo('Contact')} className="btn-primary text-sm py-2 px-5">
            Hire Me <ArrowUpRight size={14} />
          </button>
        </motion.div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-text-secondary hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-navy-800/98 backdrop-blur-xl border-t border-white/[0.06] px-6 py-6"
        >
          <ul className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <button
                  onClick={() => scrollTo(link)}
                  className="text-text-secondary hover:text-white text-base font-medium w-full text-left transition-colors"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => scrollTo('Contact')}
            className="btn-primary mt-6 w-full justify-center"
          >
            Hire Me <ArrowUpRight size={14} />
          </button>
        </motion.div>
      )}
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 80])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-navy-900" />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-pattern mask-image-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

      {/* Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-royal/20 blur-[100px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-accent-cyan/15 blur-[100px]"
      />

      {/* Content */}
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-royal/10 border border-royal/25 rounded-full text-xs font-mono font-medium text-royal/90 tracking-wider mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-royal opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-royal" />
            </span>
            Available for Freelance & Full-time
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight mb-6"
          >
            Building{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Intelligent</span>
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-royal to-accent-cyan"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            {' '}Web Solutions &{' '}
            <span className="gradient-text">Automating</span>{' '}
            Business Workflows.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-light"
          >
            Specialized in combining modern web technologies with AI-driven development and Zoho ecosystem integrations to create{' '}
            <span className="text-text-primary font-medium">scalable business solutions</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-14"
          >
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-base px-8 py-3.5"
            >
              View Work <ArrowUpRight size={16} />
            </button>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Please add your CV PDF link here.') }}
              className="btn-secondary text-base px-8 py-3.5"
            >
              Download CV
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/[0.06]"
          >
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.08 }}
              >
                <div className="text-2xl font-extrabold text-shimmer mb-1">{value}</div>
                <div className="text-text-muted text-xs tracking-wider uppercase font-medium">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary transition-colors"
      >
        <span className="text-xs tracking-widest uppercase font-mono">Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <SectionWrapper id="about" className="border-t border-white/[0.04]">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <div>
          <motion.span variants={fadeUp} className="section-label">About Me</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="section-title mb-6">
            Bridging IT, AI, and{' '}
            <span className="gradient-text">Business Automation</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-text-secondary leading-relaxed mb-5">
            I'm <strong className="text-text-primary font-semibold">Dipak Kadam</strong>, an AI Web Developer and Zoho Integration Specialist based in Pune, Maharashtra. With a B.Sc. in Computer Science and a career spanning system engineering, IT administration, and modern web development, I bring a rare combination of deep infrastructure knowledge and cutting-edge AI-assisted development.
          </motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-text-secondary leading-relaxed mb-8">
            My core strength lies in the intersection of Zoho platform integrations, intelligent web applications, and scalable IT systems — helping businesses automate complex workflows, capture leads efficiently, and build reliable digital infrastructure.
          </motion.p>

          {/* Key traits */}
          <div className="space-y-3">
            {[
              { icon: <Zap size={14} />, text: 'AI-accelerated development using Copilot & ChatGPT' },
              { icon: <Shield size={14} />, text: 'Security-first API design and data protection' },
              { icon: <Database size={14} />, text: 'Full Zoho ecosystem — CRM, Flow, Creator, Deluge' },
              { icon: <Terminal size={14} />, text: 'Linux & Windows infrastructure with Grafana monitoring' },
            ].map(({ icon, text }, i) => (
              <motion.div
                key={text}
                variants={fadeUp}
                custom={4 + i * 0.5}
                className="flex items-center gap-3 text-sm text-text-secondary"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-royal/20 text-royal flex items-center justify-center">
                  {icon}
                </span>
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Info Cards */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { icon: <MapPin size={18} />, label: 'Location', value: 'Pune, Maharashtra, India', color: 'text-royal' },
            { icon: <Globe size={18} />, label: 'Specialization', value: 'AI Web Dev + Zoho Integration', color: 'text-accent-teal' },
            { icon: <Code2 size={18} />, label: 'Education', value: 'B.Sc. Computer Science — MGM College of Engineering', color: 'text-accent-amber' },
            { icon: <Activity size={18} />, label: 'Current Role', value: 'AI Web Developer @ ZM Technologies', color: 'text-royal' },
          ].map(({ icon, label, value, color }, i) => (
            <motion.div
              key={label}
              variants={fadeUp}
              custom={i + 1}
              className="card p-5 flex items-start gap-4"
            >
              <span className={`mt-0.5 ${color}`}>{icon}</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest font-mono mb-1">{label}</p>
                <p className="text-text-primary font-medium">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

// ─── TECH STACK ───────────────────────────────────────────────────────────────

function TechStack() {
  return (
    <SectionWrapper id="stack" className="bg-navy-950/50">
      <SectionHeader
        label="Tech Stack"
        title="Tools & Technologies"
        subtitle="A carefully built toolkit spanning modern web development, the Zoho ecosystem, and enterprise IT infrastructure."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {TECH_STACK.map((stack, i) => (
          <motion.div
            key={stack.category}
            variants={fadeUp}
            custom={i + 1}
            className={`card p-7 ${stack.border} border`}
            style={{ boxShadow: `0 0 0 0 ${stack.glowColor}` }}
            whileHover={{ boxShadow: `0 0 40px 0 ${stack.glowColor}`, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stack.color} flex items-center justify-center text-white`}>
                {stack.icon}
              </div>
              <h3 className="font-bold text-text-primary">{stack.category}</h3>
            </div>

            {/* Line */}
            <div className={`h-px bg-gradient-to-r ${stack.color} opacity-30 mb-6`} />

            {/* Items */}
            <div className="flex flex-wrap gap-2">
              {stack.items.map((item) => (
                <span key={item} className="tech-badge">{item}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Other tools row */}
      <motion.div variants={fadeUp} custom={4} className="mt-8 card p-6">
        <p className="text-xs text-text-muted uppercase tracking-widest font-mono mb-4">Also Proficient In</p>
        <div className="flex flex-wrap gap-2">
          {['Postman', 'JSON', 'Git', 'Python (Basic)', 'VS Code', 'Virtualization Platforms', 'System Hardening', 'Backup & Recovery'].map((tool) => (
            <span key={tool} className="tech-badge text-xs">{tool}</span>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────

function Experience() {
  return (
    <SectionWrapper id="experience">
      <SectionHeader
        label="Career Journey"
        title="Work Experience"
        subtitle="A progressive path from IT administration and system engineering to AI-powered web development and intelligent automation."
      />

      <div className="relative pl-6 md:pl-8">
        {/* Vertical line */}
        <div className="timeline-connector" />

        <div className="space-y-14">
          {EXPERIENCE.map((job, i) => (
            <motion.div
              key={job.company}
              variants={fadeLeft}
              custom={i}
              className="relative"
            >
              {/* Dot */}
              <div className={`absolute -left-[27px] md:-left-[33px] top-1.5 w-3 h-3 rounded-full ${job.dotColor} border-2 border-navy-900`}
                style={{ boxShadow: `0 0 0 4px ${job.dotColor.includes('royal') ? 'rgba(26,86,219,0.2)' : job.dotColor.includes('teal') ? 'rgba(20,184,166,0.2)' : 'rgba(100,116,139,0.15)'}` }}
              />

              <div className="card p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-1.5">
                      {job.icon}
                      <span className="uppercase tracking-wider">{job.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{job.role}</h3>
                    <p className="text-royal font-semibold mt-0.5">{job.company}</p>
                  </div>
                  <span className="flex-shrink-0 self-start px-3 py-1.5 bg-navy-700/80 border border-white/[0.06] rounded-lg text-xs font-mono text-text-secondary whitespace-nowrap">
                    {job.period}
                  </span>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/[0.05] mb-5" />

                {/* Highlights */}
                <ul className="space-y-2.5 mb-5">
                  {job.highlights.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                      <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-royal/70" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="tech-badge text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Early career note */}
          <motion.div variants={fadeLeft} custom={3} className="relative">
            <div className="absolute -left-[27px] md:-left-[33px] top-1.5 w-3 h-3 rounded-full bg-navy-500 border-2 border-navy-900" />
            <div className="card p-5 border-dashed">
              <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Earlier Experience</p>
              <div className="flex flex-wrap gap-x-8 gap-y-1">
                {[
                  { role: 'Test Engineer', company: 'PHN Technology', date: 'May 2023' },
                  { role: 'Java Developer', company: 'Naresh i Technologies', date: 'Dec 2019 – Feb 2020' },
                  { role: 'Industrial Practice', company: 'TCS iON', date: 'Nov 2017 – Mar 2018' },
                ].map(({ role, company, date }) => (
                  <div key={role} className="text-sm">
                    <span className="text-text-primary font-medium">{role}</span>
                    <span className="text-text-muted"> · {company} · {date}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────

function Services() {
  return (
    <SectionWrapper id="services" className="bg-navy-950/50">
      <SectionHeader
        label="What I Do"
        title="Services"
        subtitle="Comprehensive solutions across web development, business automation, and IT infrastructure — all powered by AI and proven methodology."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.title}
            variants={fadeUp}
            custom={i + 1}
            className={`card ${svc.border} border p-8 flex flex-col`}
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center text-white mb-6`}>
              {svc.icon}
            </div>

            <h3 className="text-xl font-bold text-text-primary mb-3">{svc.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-grow">{svc.desc}</p>

            {/* Feature list */}
            <ul className="space-y-2">
              {svc.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-text-muted">
                  <span className="w-4 h-4 rounded-full bg-royal/20 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-royal" />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA Banner */}
      <motion.div
        variants={fadeUp}
        custom={4}
        className="mt-10 card p-8 md:p-10 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-royal/10 via-accent-cyan/5 to-royal/10" />
        <div className="relative">
          <h3 className="text-2xl font-bold text-text-primary mb-3">Have a project in mind?</h3>
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            Whether it's a new web application, a Zoho automation pipeline, or an infrastructure overhaul — let's build something that works.
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
          >
            Let's Talk <ArrowUpRight size={16} />
          </button>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, integrate with Zoho Forms, EmailJS, or Formspree
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setForm({ name: '', email: '', service: '', message: '' })
  }

  const contactDetails = [
    {
      icon: <Mail size={18} />,
      label: 'Email',
      value: 'dipak100kadam@gmail.com',
      href: 'mailto:dipak100kadam@gmail.com',
    },
    {
      icon: <Linkedin size={18} />,
      label: 'LinkedIn',
      value: 'linkedin.com/in/dipakkadamb',
      href: 'https://linkedin.com/in/dipakkadamb',
    },
    {
      icon: <Phone size={18} />,
      label: 'Phone',
      value: '+91 7796852335',
      href: 'tel:+917796852335',
    },
    {
      icon: <MapPin size={18} />,
      label: 'Location',
      value: 'Pune, Maharashtra, India',
      href: null,
    },
  ]

  return (
    <SectionWrapper id="contact" className="border-t border-white/[0.04]">
      <SectionHeader
        label="Get In Touch"
        title="Let's Build Together"
        subtitle="Ready to automate your workflows, launch a web application, or scale your infrastructure? I'd love to hear about your project."
      />

      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left: Contact Info */}
        <div className="space-y-4">
          {contactDetails.map((item, i) => (
            <motion.div key={item.label} variants={fadeUp} custom={i + 1}>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="card p-5 flex items-center gap-4 group cursor-pointer block"
                >
                  <div className="w-10 h-10 rounded-xl bg-royal/15 text-royal flex items-center justify-center flex-shrink-0 group-hover:bg-royal group-hover:text-white transition-all duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-mono mb-0.5">{item.label}</p>
                    <p className="text-text-primary font-medium group-hover:text-royal transition-colors flex items-center gap-1">
                      {item.value}
                      {item.href.startsWith('http') && <ExternalLink size={12} className="opacity-50" />}
                    </p>
                  </div>
                </a>
              ) : (
                <div className="card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-royal/15 text-royal flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-mono mb-0.5">{item.label}</p>
                    <p className="text-text-primary font-medium">{item.value}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Right: Contact Form */}
        <motion.form
          variants={fadeUp}
          custom={2}
          onSubmit={handleSubmit}
          className="card p-7 space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            {['name', 'email'].map((field) => (
              <div key={field}>
                <label className="block text-xs text-text-muted uppercase tracking-widest font-mono mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  placeholder={field === 'name' ? 'John Doe' : 'john@company.com'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full bg-navy-800 border border-white/[0.07] rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted outline-none focus:border-royal/50 focus:ring-1 focus:ring-royal/30 transition-all"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-text-muted uppercase tracking-widest font-mono mb-2">Service Needed</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full bg-navy-800 border border-white/[0.07] rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-royal/50 focus:ring-1 focus:ring-royal/30 transition-all"
            >
              <option value="" className="bg-navy-800">Select a service...</option>
              <option value="ai-web" className="bg-navy-800">AI Web Development</option>
              <option value="zoho" className="bg-navy-800">Zoho Automation</option>
              <option value="it" className="bg-navy-800">IT Infrastructure Consultancy</option>
              <option value="other" className="bg-navy-800">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted uppercase tracking-widest font-mono mb-2">Message</label>
            <textarea
              required
              rows={5}
              placeholder="Tell me about your project..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-navy-800 border border-white/[0.07] rounded-xl px-4 py-3 text-text-primary text-sm placeholder-text-muted outline-none focus:border-royal/50 focus:ring-1 focus:ring-royal/30 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className={`btn-primary w-full justify-center py-3.5 ${sent ? 'bg-accent-teal hover:bg-accent-teal' : ''}`}
          >
            {sent ? '✓ Message Sent!' : 'Send Message'}
            {!sent && <ArrowUpRight size={16} />}
          </button>

          <p className="text-center text-xs text-text-muted">
            Prefer email? <a href="mailto:dipak100kadam@gmail.com" className="text-royal hover:underline">dipak100kadam@gmail.com</a>
          </p>
        </motion.form>
      </div>
    </SectionWrapper>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="border-t border-white/[0.05] bg-navy-950/80 py-8">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-royal flex items-center justify-center text-white font-bold text-xs">DK</div>
          <span className="text-text-muted text-sm">Dipak Kadam · AI Web Developer & Zoho Specialist</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="mailto:dipak100kadam@gmail.com" className="text-text-muted hover:text-royal transition-colors"><Mail size={16} /></a>
          <a href="https://linkedin.com/in/dipakkadamb" target="_blank" rel="noreferrer" className="text-text-muted hover:text-royal transition-colors"><Linkedin size={16} /></a>
          <a href="tel:+917796852335" className="text-text-muted hover:text-royal transition-colors"><Phone size={16} /></a>
        </div>
        <p className="text-text-muted text-xs">© {currentYear} All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── SCROLL PROGRESS BAR ──────────────────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-royal via-accent-cyan to-accent-teal origin-left z-[200]"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechStack />
        <Experience />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
