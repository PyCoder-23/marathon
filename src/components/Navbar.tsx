"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut, Calendar, ChevronDown } from "lucide-react";
import styles from "./Navbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Journal", href: "/journal" },
  { label: "Tasks", href: "/tasks" },
  { label: "Planner", href: "/planner" },
  { label: "Leaderboard", href: "/leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ discordId?: string; username: string; avatar?: string; isLoggedIn: boolean } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/join");
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard" className={styles.logo}>
        <Zap size={20} fill="var(--accent)" color="var(--accent)" />
        <span>MARATHON</span>
      </Link>

      <div className={styles.links}>
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className={styles.actions}>
        {user?.isLoggedIn ? (
          <div className={styles.dropdownContainer}>
            <button 
              className={styles.profileBadge}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=00ff9f&color=000`} 
                alt="Profile" 
                className={styles.avatar}
              />
              <span className={styles.username}>{user.username}</span>
              <ChevronDown size={14} className={styles.chevron} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div className={styles.dropdownOverlay} onClick={() => setDropdownOpen(false)} />
                  <motion.div 
                    className={styles.dropdown}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>Menu</span>
                    </div>
                    
                    <div className={styles.dropdownContent}>
                      <Link 
                        href={`/profile/${user.discordId || 'me'}`} 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Zap size={16} className={styles.itemIcon} />
                        <span>My Profile</span>
                      </Link>

                      <Link 
                        href="/planners" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Calendar size={16} className={styles.itemIcon} />
                        <span>Printable Planners</span>
                      </Link>

                      <div className={styles.dropdownDivider} />

                      <button 
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                      >
                        <LogOut size={16} className={styles.itemIcon} />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/join" className={styles.joinBtn}>Join Camp</Link>
        )}
      </div>
    </nav>
  );
}
