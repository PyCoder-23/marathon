"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, MessageSquare, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import styles from "./join.module.css";
import { useRouter } from "next/navigation";

export default function JoinCampPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 8) {
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        ...data.user,
        isLoggedIn: true
      }));
      
      setStatus("success");
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className={styles.header}>
          <div className={styles.iconBadge}>
            <img src="/logo.png" alt="Marathon Logo" className={styles.logoImg} />
          </div>
          <h1>Join the Training Camp</h1>
          <p>Follow these steps to initialize your status.</p>
        </header>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepContent}>
              <h3>Join Discord</h3>
              <p>Enter our base of operations to start your marathon journey.</p>
              <a href="https://discord.com/invite/N72xXtZtGS" target="_blank" className={styles.discordLink}>
                discord.com/invite/N72xXtZtGS <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepContent}>
              <h3>Generate ID Key</h3>
              <p>Type <code>/link</code> in any channel on the Discord server.</p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>03</div>
            <div className={styles.stepContent}>
              <h3>Sync Identity</h3>
              <p>Paste the 8-character code sent to your DMs below.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              placeholder="ENTER_ID_KEY"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={status === "loading" || status === "success"}
            />
            <button 
              type="submit" 
              className={styles.verifyBtn}
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? "SYNCING..." : "INITIALIZE"}
            </button>
          </div>
          
          {status === "error" && (
            <p className={styles.errorMessage}>INVALID_KEY: Check your DMs and try again.</p>
          )}
          {status === "success" && (
            <p className={styles.successMessage}>SYSTEM_READY: Identity Verified. Redirecting...</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
