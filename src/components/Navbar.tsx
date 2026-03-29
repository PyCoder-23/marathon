"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut } from "lucide-react";
import styles from "./Navbar.module.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Journal", href: "/journal" },
  { label: "Tasks", href: "/tasks" },
  { label: "Planner", href: "/planner" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ discordId?: string; username: string; avatar?: string; isLoggedIn: boolean } | null>(null);

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
          <>
            <Link href={`/profile/${user.discordId || 'me'}`} className={styles.profileBadge}>
              <img 

                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=00ff9f&color=000`} 
                alt="Profile" 
                className={styles.avatar}
              />
              <span className={styles.username}>{user.username}</span>
            </Link>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Disconnect Session">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link href="/join" className={styles.joinBtn}>Join Camp</Link>
        )}
      </div>
    </nav>
  );
}
