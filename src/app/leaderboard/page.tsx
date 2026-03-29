"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Trophy, Flame, Crown } from "lucide-react";
import styles from "./leaderboard.module.css";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  discordId: string;
  username: string;
  avatar: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
}

const RANK_ICONS: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Crown size={20} />, color: "#ffd700" },
  2: { icon: <Trophy size={20} />, color: "#c0c0c0" },
  3: { icon: <Trophy size={20} />, color: "#cd7f32" },
};

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setBoard(d.leaderboard || []);

        // Find logged-in user's rank
        const saved = localStorage.getItem("user");
        if (saved) {
          const me = JSON.parse(saved);
          const entry = d.leaderboard?.find(
            (e: LeaderboardEntry) => e.discordId === me.discordId
          );
          if (entry) setMyRank(entry.rank);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>WEEKLY_CYCLE_RANKINGS</p>
          <h1 className="text-gradient">Leaderboard</h1>
          <p className={styles.subtitle}>Resets each cycle. Stay consistent, stay on top.</p>
        </div>
        {myRank && (
          <div className={styles.myRankBadge}>
            <Zap size={14} color="var(--accent)" />
            <span>YOUR_RANK: <strong>#{myRank}</strong></span>
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingState}>FETCHING_RANKINGS...</div>
      ) : board.length === 0 ? (
        <div className={styles.emptyState}>
          <Trophy size={48} opacity={0.3} />
          <p>NO_ACTIVE_RUNNERS_THIS_CYCLE</p>
          <span>Start a session to claim the top spot.</span>
        </div>
      ) : (
        <div className={styles.boardList}>
          {board.map((entry, i) => {
            const isTop3 = entry.rank <= 3;
            const rankStyle = RANK_ICONS[entry.rank];

            return (
              <motion.div
                key={entry.discordId}
                className={`${styles.row} ${isTop3 ? styles.topRow : ""}`}
                style={isTop3 ? { borderColor: rankStyle.color + "44" } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Rank */}
                <div
                  className={styles.rankNum}
                  style={{ color: rankStyle ? rankStyle.color : "var(--text-muted)" }}
                >
                  {rankStyle ? rankStyle.icon : `#${entry.rank}`}
                </div>

                {/* Avatar + Name */}
                <img
                  src={
                    entry.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=00ff9f&color=000`
                  }
                  alt={entry.username}
                  className={styles.avatar}
                />
                <Link href={`/profile/${entry.discordId}`} className={styles.username}>
                  {entry.username}
                </Link>

                {/* Streak */}
                <div className={styles.streak}>
                  <Flame size={14} color="#f97316" />
                  <span>{entry.streak}d</span>
                </div>

                {/* XP */}
                <div className={styles.xpArea}>
                  <span className={styles.weeklyXp}>
                    {entry.weeklyXp.toLocaleString()} <span className={styles.xpUnit}>WK XP</span>
                  </span>
                  <span className={styles.totalXp}>{entry.totalXp.toLocaleString()} total</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
