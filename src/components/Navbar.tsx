"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut, Calendar, ChevronDown, Heart, BookOpen, CheckSquare, ClipboardList, Volume2, VolumeX } from "lucide-react";
import styles from "./Navbar.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Shop", href: "/shop" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Squads", href: "/squads" },
  { label: "Timelapse", href: "/timelapse" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ discordId?: string; username: string; avatar?: string; isLoggedIn: boolean } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { activeTheme, logoSrc, isMusicPlaying, hasThemeMusic, toggleMusic } = useTheme();

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
      <Link href="/" className={styles.logo}>
        <span className={styles.brandName}>MARATHON</span>
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
        {hasThemeMusic && (
          <button 
            className={`${styles.musicToggle} ${isMusicPlaying ? styles.playing : ''}`}
            onClick={toggleMusic}
            title={isMusicPlaying ? "Pause Theme Music" : "Play Theme Music"}
          >
            {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        )}
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
                        href="/planner" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ClipboardList size={16} className={styles.itemIcon} />
                        <span>Planner</span>
                      </Link>

                      <Link 
                        href="/planners" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Calendar size={16} className={styles.itemIcon} />
                        <span>Printable Planners</span>
                      </Link>

                      <Link 
                        href="/journal" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen size={16} className={styles.itemIcon} />
                        <span>Journal</span>
                      </Link>

                      <Link 
                        href="/tasks" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <CheckSquare size={16} className={styles.itemIcon} />
                        <span>Tasks</span>
                      </Link>

                      <Link 
                        href="/donate" 
                        className={styles.dropdownItem}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Heart size={16} className={styles.itemIcon} />
                        <span>Donate to Server</span>
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
          <Link href="/join" className={styles.joinBtn}>Access Community</Link>
        )}
      </div>
    </nav>
  );
}
