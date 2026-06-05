"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { Mail, MessageSquare, Play, Users } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { activeTheme, logoSrc } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDemonSlayer = mounted && activeTheme === 'thm-demon-slayer';

  if (isDemonSlayer) {
    return (
      <footer className={styles.footerDemonSlayer}>
        {/* Village night scene — full bleed background */}
        <div className={styles.dsSceneBg} />
        {/* Gradient overlay: legible sky at top, fade-out at bottom */}
        <div className={styles.dsSceneOverlay} />

        {/* Brand card — glassmorphism, top-left */}
        <motion.div
          className={styles.dsBrandCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.logoRow}>
            <img src="/anime_ds_logo.png" alt="Marathon Logo" className={styles.logo} style={{ borderRadius: '50%' }} />
            <h2 className={styles.dsBrandName}>MARATHON SERVER</h2>
          </div>
          <p className={styles.dsDescription}>
            Transform your productivity into a game. Join the elite rank of consistent achievers.
          </p>
          <div className={styles.socials}>
            <a href="https://discord.gg/FEKt8rADQu" target="_blank" rel="noopener noreferrer" className={styles.dsSocialLink}>
              <MessageSquare size={18} />
            </a>
            <a href="https://www.youtube.com/@marathon-server" target="_blank" rel="noopener noreferrer" className={styles.dsSocialLink}>
              <Play size={18} fill="currentColor" />
            </a>
            <a href="https://www.linkedin.com/company/marathon-server/" target="_blank" rel="noopener noreferrer" className={styles.dsSocialLink}>
              <Users size={18} />
            </a>
            <a href="mailto:marathonxserver@gmail.com" className={styles.dsSocialLink}>
              <Mail size={18} />
            </a>
          </div>
        </motion.div>

        {/* Footer links — floating in the sky */}
        <motion.div
          className={styles.dsLinksFloat}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className={styles.dsLinkGroup}>
            <h3 className={styles.dsGroupTitle}>Platform</h3>
            <ul className={styles.dsLinks}>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/leaderboard">Leaderboard</Link></li>
              <li><Link href="/tasks">Tasks</Link></li>
            </ul>
          </div>
          <div className={styles.dsLinkGroup}>
            <h3 className={styles.dsGroupTitle}>Legal</h3>
            <ul className={styles.dsLinks}>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className={styles.dsLinkGroup}>
            <h3 className={styles.dsGroupTitle}>Support</h3>
            <ul className={styles.dsLinks}>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/donate">Donate</Link></li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className={styles.dsBottomBar}>
          <p className={styles.dsCopyright}>© {currentYear} Marathon Server. All rights reserved.</p>
          <div className={styles.statusRow}>
            <div className={styles.dsStatusDot} />
            <span className={styles.statusText}>Systems Operational</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <img src={logoSrc} alt="Marathon Logo" className={styles.logo} style={{ borderRadius: '50%' }} />
              <h2 className={styles.brandName}>MARATHON SERVER</h2>
            </div>
            <p className={styles.description}>
              Transform your productivity into a game. Join the elite rank of consistent achievers.
            </p>
            <div className={styles.socials}>
              <a href="https://discord.gg/FEKt8rADQu" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <MessageSquare size={18} />
              </a>
              <a href="https://www.youtube.com/@marathon-server" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Play size={18} fill="currentColor" />
              </a>
              <a href="https://www.linkedin.com/company/marathon-server/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Users size={18} />
              </a>
              <a href="mailto:marathonxserver@gmail.com" className={styles.socialLink}>
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h3 className={styles.groupTitle}>Platform</h3>
              <ul className={styles.links}>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><Link href="/tasks">Tasks</Link></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h3 className={styles.groupTitle}>Legal</h3>
              <ul className={styles.links}>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h3 className={styles.groupTitle}>Support</h3>
              <ul className={styles.links}>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/donate">Donate</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.divider}></div>
          <div className={styles.copyrightRow}>
            <p className={styles.copyright}>
              © {currentYear} Marathon Server. All rights reserved.
            </p>
            <div className={styles.statusRow}>
              <div className={styles.statusDot}></div>
              <span className={styles.statusText}>Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
