"use client";

import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, LayoutDashboard } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import { useTheme } from "../components/ThemeProvider";

export default function LandingPage() {
  const { logoSrc, activeTheme } = useTheme();
  const isJJK = activeTheme === 'thm-malevolent-shrine';

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      {isJJK ? (
        <section className={styles.hero} style={{ 
          position: 'relative', 
          minHeight: '80vh', 
          alignSelf: 'stretch',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Custom Google Font for JJK */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap');
            
            @font-face {
              font-family: 'Katsuha';
              src: url('/katsuha-font/KatsuhaDemo-zrnLG.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            
            .jjk-hero-bg {
              position: fixed;
              inset: 0;
              width: 100vw;
              height: 100vh;
              background-image: url('/malevolent_shrine_bg.png');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              opacity: 0.7;
              z-index: -2;
            }
            
            .jjk-hero-gradient {
              position: fixed;
              inset: 0;
              width: 100vw;
              height: 100vh;
              background: radial-gradient(circle at center, transparent 0%, rgba(3, 0, 0, 0.9) 100%),
                          linear-gradient(to bottom, transparent 40%, #030000 100%);
              z-index: -1;
            }

            .jjk-content {
              position: relative;
              z-index: 2;
              text-align: center;
            }

            .jjk-eyebrow {
              font-family: 'JetBrains Mono', monospace;
              color: #dc2626;
              letter-spacing: 4px;
              font-size: 1rem;
              margin-bottom: 1rem;
              text-transform: uppercase;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1rem;
            }

            .jjk-eyebrow::before, .jjk-eyebrow::after {
              content: '';
              height: 1px;
              width: 30px;
              background: #dc2626;
            }

            .jjk-title {
              font-family: 'Katsuha', sans-serif;
              font-size: clamp(4rem, 10vw, 8rem);
              color: #d4b8b8; /* Darkened from #ffeded */
              text-shadow: 0 0 15px rgba(180, 20, 20, 0.8), 0 0 30px rgba(180, 20, 20, 0.4); /* Reduced glow */
              letter-spacing: 4px;
              line-height: 1;
              margin: 0;
            }

            .jjk-subtitle {
              font-family: 'Katsuha', sans-serif;
              font-size: clamp(2rem, 5vw, 4rem);
              color: #b91c1c; /* Darkened from #dc2626 */
              letter-spacing: 12px;
              text-shadow: 0 0 10px rgba(180, 20, 20, 0.4); /* Reduced glow */
              margin-top: -10px;
              margin-bottom: 2rem;
            }

            .jjk-tagline {
              font-size: 1.25rem;
              color: #fca5a5;
              max-width: 600px;
              margin: 0 auto 3rem;
              line-height: 1.6;
            }

            .jjk-btn-primary {
              background: rgba(220, 38, 38, 0.1);
              border: 1px solid #dc2626;
              color: #ffeded;
              box-shadow: 0 0 20px rgba(220, 38, 38, 0.3), inset 0 0 10px rgba(220, 38, 38, 0.2);
              transition: all 0.3s ease;
            }

            .jjk-btn-primary:hover {
              background: rgba(220, 38, 38, 0.3);
              box-shadow: 0 0 30px rgba(220, 38, 38, 0.6), inset 0 0 20px rgba(220, 38, 38, 0.4);
              transform: translateY(-2px);
            }

            .jjk-btn-secondary {
              background: transparent;
              border: 1px solid rgba(255, 237, 237, 0.2);
              color: #ffeded;
              transition: all 0.3s ease;
            }

            .jjk-btn-secondary:hover {
              background: rgba(255, 237, 237, 0.05);
              border-color: rgba(255, 237, 237, 0.4);
            }

            .jjk-kanji-banner {
              position: absolute;
              left: 4vw;
              top: 50%;
              transform: translateY(-50%);
              border: 1px solid #dc2626;
              padding: 1rem 0.5rem;
              background: rgba(10, 1, 1, 0.6);
              backdrop-filter: blur(4px);
              z-index: 2;
            }

            @media (max-width: 1200px) {
              .jjk-kanji-banner {
                display: none;
              }
            }

            .jjk-kanji {
              writing-mode: vertical-rl;
              text-orientation: upright;
              font-family: 'Noto Sans JP', sans-serif;
              font-weight: 700;
              font-size: 1.5rem;
              color: #dc2626;
              letter-spacing: 6px;
              text-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
            }
          `}</style>

          <div className="jjk-hero-bg" />
          <div className="jjk-hero-gradient" />

          <div className="jjk-kanji-banner">
            <div className="jjk-kanji">両面宿儺</div>
          </div>

          <motion.div
            className="jjk-content"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="jjk-eyebrow">Malevolent Shrine</div>
            <h1 className="jjk-title">MARATHON</h1>
            <div className="jjk-subtitle">SERVER</div>
            
            <p className="jjk-tagline">
              Train Your Consistency. The only way to exorcise weakness is through <strong style={{ color: '#dc2626', textShadow: '0 0 10px rgba(220,38,38,0.5)' }}>discipline</strong>.
            </p>

            <motion.div 
              className={styles.ctaButtons}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ justifyContent: 'center' }}
            >
              <Link href="/join" className={`button ${styles.button} jjk-btn-primary`} style={{ gap: '0.5rem' }}>
                <Play size={18} fill="currentColor" /> START TRAINING
              </Link>
              <Link href="/dashboard" className={`button ${styles.button} jjk-btn-secondary`} style={{ gap: '0.5rem' }}>
                VIEW DASHBOARD <LayoutDashboard size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      ) : (
        <section className={styles.hero}>
          <motion.div 
            className={styles.logoCircle}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src={logoSrc} alt="Marathon Logo" className={styles.heroLogo} />
            <div className={styles.logoRing} />
          </motion.div>

          <motion.div
            className={styles.titleContainer}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className={styles.mainTitle}>
              <span className="text-gradient">MARATHON</span>
              <span className="glow-text-neon">SERVER</span>
            </h1>
            <p className={styles.tagline}>
              Train Your Consistency. The futuristic training camp for disciplined students.
            </p>
          </motion.div>

          <motion.div 
            className={styles.ctaButtons}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/join" className="button button-primary">
              Start Training <Play size={18} fill="currentColor" />
            </Link>
            <Link href="/dashboard" className="button button-secondary">
              View Dashboard <LayoutDashboard size={18} />
            </Link>
          </motion.div>
        </section>
      )}

      {/* Cards Section */}
      <section className={styles.features}>
        {[
          { title: 'Planning', href: '/planner' }, 
          { title: 'Profile', href: '/profile/me' }, 
          { title: 'Missions', href: '/tasks' }
        ].map((item, i) => (
          <Link href={item.href} key={item.title} style={{ textDecoration: 'none', color: 'inherit' }}>
            <motion.div 
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + (i * 0.1) }}
            >
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <div className={styles.cardGlow} />
            </motion.div>
          </Link>
        ))}
      </section>
    </div>
  );
}
// test
