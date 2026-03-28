'use client';

import Link from 'next/link';
import {
  Zap,
  Trophy,
  Code2,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  Terminal,
  Timer,
  Sparkles,
} from 'lucide-react';
import styles from './page.module.css';

const features = [
  {
    icon: Trophy,
    title: 'Live Contests',
    description: 'Create and join competitive programming contests with real-time scoring and ranking.',
    color: 'cyan',
  },
  {
    icon: Code2,
    title: 'Code Editor',
    description: 'Full-featured Monaco editor with syntax highlighting, autocomplete, and multi-language support.',
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Leaderboard',
    description: 'Watch rankings update live via WebSocket. See AC/WA verdicts flash across the board.',
    color: 'green',
  },
  {
    icon: Timer,
    title: 'Codeforces-Style Scoring',
    description: 'Dynamic scoring with penalty time. Wrong attempts reduce points — solve fast for maximum score.',
    color: 'amber',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Join contests with unique codes, manage participants, and compete with programmers worldwide.',
    color: 'pink',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description: 'OAuth2 with Google & GitHub, JWT-based sessions, and role-based access control.',
    color: 'cyan',
  },
];

const colorMap: Record<string, string> = {
  cyan: 'var(--accent-cyan)',
  violet: 'var(--accent-violet)',
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  pink: 'var(--accent-pink)',
};

const dimColorMap: Record<string, string> = {
  cyan: 'var(--accent-cyan-dim)',
  violet: 'var(--accent-violet-dim)',
  green: 'var(--accent-green-dim)',
  amber: 'var(--accent-amber-dim)',
  pink: 'rgba(236, 72, 153, 0.15)',
};

export default function Home() {
  return (
    <main>
      {/* ═══ Hero Section ═══ */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          {/* Background effects */}
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.gridOverlay} aria-hidden="true" />

          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>The Future of Competitive Programming</span>
            </div>

            <h1 className={styles.heroTitle}>
              Code. Compete.
              <br />
              <span className="text-gradient">Conquer.</span>
            </h1>

            <p className={styles.heroDescription}>
              Real-time competitive programming platform with live leaderboards,
              Monaco code editor, and Codeforces-style scoring. 
              Create contests, solve problems, climb rankings.
            </p>

            <div className={styles.heroCtas}>
              <Link href="/contests" className="btn btn-primary btn-lg" id="hero-cta-browse">
                Browse Contests
                <ArrowRight size={18} />
              </Link>
              <Link href="/auth/register" className="btn btn-secondary btn-lg" id="hero-cta-register">
                Get Started Free
              </Link>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>∞</span>
                <span className={styles.statLabel}>Contests</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>Real-time</span>
                <span className={styles.statLabel}>Leaderboard</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>WebSocket</span>
                <span className={styles.statLabel}>Live Updates</span>
              </div>
            </div>
          </div>

          {/* Hero terminal illustration */}
          <div className={styles.heroVisual}>
            <div className={styles.terminal}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <span className={styles.terminalTitle}>contest-arena</span>
              </div>
              <div className={styles.terminalBody}>
                <div className={styles.terminalLine}>
                  <span className={styles.prompt}>$</span>
                  <span className={styles.cmd}>submit solution.cpp</span>
                </div>
                <div className={styles.terminalLine}>
                  <span className={styles.output}>Compiling...</span>
                </div>
                <div className={styles.terminalLine}>
                  <span className={styles.output}>Running test cases...</span>
                </div>
                <div className={`${styles.terminalLine} ${styles.lineAc}`}>
                  <span className={styles.verdict}>✓ ACCEPTED</span>
                  <span className={styles.score}>+500 pts</span>
                </div>
                <div className={styles.terminalLine}>
                  <span className={styles.output}>Rank: #1 → Updated</span>
                </div>
                <div className={styles.terminalLine}>
                  <span className={styles.prompt}>$</span>
                  <span className={styles.cursor}>_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className={`section ${styles.features}`} id="features">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Everything you need to compete</h2>
            <p className={styles.sectionSubtitle}>
              A complete platform for hosting and participating in programming contests,
              powered by microservices and real-time event streaming.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`${styles.featureCard} animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              >
                <div
                  className={styles.featureIcon}
                  style={{
                    color: colorMap[feature.color],
                    backgroundColor: dimColorMap[feature.color],
                  }}
                >
                  <feature.icon size={22} />
                </div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Architecture Section ═══ */}
      <section className={`section ${styles.architecture}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Built for <span className="text-gradient">Performance</span></h2>
            <p className={styles.sectionSubtitle}>
              Event-driven microservices architecture with Kafka, Redis, and WebSocket
              for sub-second leaderboard updates.
            </p>
          </div>

          <div className={styles.archCards}>
            <div className={styles.archCard}>
              <Terminal size={24} className={styles.archIcon} />
              <h4>Auth Service</h4>
              <p>JWT + OAuth2 (Google, GitHub). Secure user identity across services.</p>
              <span className={`badge badge-cyan`}>Port 8081</span>
            </div>
            <div className={styles.archCard}>
              <Trophy size={24} className={styles.archIcon} />
              <h4>Contest Service</h4>
              <p>Manage contests, problems, and registrations. Kafka event streaming.</p>
              <span className={`badge badge-violet`}>Port 8082</span>
            </div>
            <div className={styles.archCard}>
              <BarChart3 size={24} className={styles.archIcon} />
              <h4>Leaderboard Service</h4>
              <p>Redis sorted sets, STOMP WebSocket, live rank updates on every verdict.</p>
              <span className={`badge badge-green`}>Port 8085</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className={`section ${styles.cta}`}>
        <div className={`container ${styles.ctaContent}`}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <h2>Ready to compete?</h2>
          <p className={styles.ctaText}>
            Join ContestArena and start solving problems, climbing leaderboards,
            and sharpening your competitive programming skills.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/auth/register" className="btn btn-primary btn-lg" id="cta-register">
              Create Account
              <ArrowRight size={18} />
            </Link>
            <Link href="/contests" className="btn btn-secondary btn-lg" id="cta-browse">
              Browse Contests
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Zap size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span className={styles.footerLogo}>ContestArena</span>
            </div>
            <p className={styles.footerText}>
              © {new Date().getFullYear()} ContestArena. Built with Next.js, Spring Boot, Kafka & Redis.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
