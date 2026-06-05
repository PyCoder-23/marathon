"use client";

import { motion } from "framer-motion";
import { Zap, Play, ArrowRight, LayoutDashboard } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";
import { useTheme } from "../components/ThemeProvider";

export default function LandingPage() {
  const { logoSrc } = useTheme();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
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
