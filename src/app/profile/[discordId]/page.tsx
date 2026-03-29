"use client";

import { useEffect, useState, use } from "react";
import styles from "./profile.module.css";
import { Zap, Target, Star, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProfileData {
  user: {
    discordId: string;
    username: string;
    avatar: string;
    xp: number;
    joinedAt: string;
    streak: number;
  };
  stats: {
    totalSessions: number;
    completedTasks: number;
  };
}

export default function ProfilePage({ params }: { params: Promise<{ discordId: string }> }) {
  const { discordId: rawId } = use(params);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the route is /profile/me, resolve from localStorage
    if (rawId === 'me') {
      const saved = localStorage.getItem('user');
      if (saved) {
        const u = JSON.parse(saved);
        fetchData(u.discordId);
      } else {
        setError(true);
        setLoading(false);
      }
    } else {
      fetchData(rawId);
    }
  }, [rawId]);

  const fetchData = async (id: string) => {
    try {
      const res = await fetch(`/api/user?discordId=${id}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound} style={{ opacity: 0.5 }}>
          <p style={{ fontFamily: 'monospace' }}>LOADING_AGENT_DATA...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>AGENT NOT FOUND</h2>
          <p>This user does not exist in the Marathon database.</p>
          <Link href="/dashboard" className="button button-secondary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = data.user.joinedAt
    ? new Date(data.user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.glow} />

        <img
          src={data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=00ff9f&color=000`}
          alt={data.user.username}
          className={styles.avatar}
        />

        <h1 className={styles.username}>{data.user.username}</h1>
        <div className={styles.discordId}>ID: {data.user.discordId}</div>
        <div className={styles.joinDate}>Member since {joinDate}</div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <Zap size={22} color="var(--accent)" />
            <span className={styles.statValue}>{data.user.xp.toLocaleString()}</span>
            <span className={styles.statLabel}>Total XP</span>
          </div>
          <div className={styles.statBox}>
            <Star size={22} color="#fcd34d" />
            <span className={styles.statValue}>{data.user.streak}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
          <div className={styles.statBox}>
            <Target size={22} color="#f87171" />
            <span className={styles.statValue}>{data.stats.completedTasks}</span>
            <span className={styles.statLabel}>Tasks Done</span>
          </div>
          <div className={styles.statBox}>
            <Calendar size={22} color="#60a5fa" />
            <span className={styles.statValue}>{data.stats.totalSessions}</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
