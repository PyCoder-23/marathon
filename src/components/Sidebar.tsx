"use client";

import { Home, ClipboardList, BookOpen, Settings, LogOut, Zap, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: ClipboardList, label: "Planner", href: "/planner" },
  { icon: BookOpen, label: "Journal", href: "/journal" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; isLoggedIn: boolean; avatar?: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Zap size={24} fill="var(--accent)" color="var(--accent)" />
        </div>
        <span className={styles.logoText}>MARATHON</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className={styles.activeIndicator}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {user ? (
          <div className={styles.userProfile}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt="PFP" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}><User size={20} /></div>
              )}
              <div className={styles.onlineStatus} />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.userId}>#{user.username.split('_')[1] || '0001'}</span>
            </div>
            <button className={styles.logoutSmall} onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link href="/login" className={styles.loginBtn}>
            <User size={20} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
