import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";
import { Mail, MessageSquare, Play, Users } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <img src="/logo.png" alt="Marathon Logo" className={styles.logo} />
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
