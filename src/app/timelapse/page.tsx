"use client";

import React from "react";
import { motion } from "framer-motion";
import { Video, FastForward, Minimize, Heart } from "lucide-react";
import styles from "./timelapse.module.css";
import Link from "next/link";

export default function TimelapsePage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-label">Screen Recorder</span>
        <h1 className="text-gradient">Session Timelapse</h1>
        <p className={styles.lead}>
          A dedicated screen recorder you must use for any screen-based proof of work.
        </p>
        <div className={styles.heroAction}>
          <Link href="https://sessionrecorder.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
            Launch Recorder
          </Link>
        </div>
      </motion.div>

      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.iconWrapper}>
            <FastForward size={24} className={styles.accentIcon} />
          </div>
          <h3>&gt; 30x Speed</h3>
          <p>Record your sessions at high speeds (ideally more than 30x) to create beautiful timelapses of your work.</p>
        </motion.div>

        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.iconWrapper}>
            <Minimize size={24} className={styles.accentIcon} />
          </div>
          <h3>360p - 480p Quality</h3>
          <p>We recommend recording in 360-480p to keep video file sizes small and memory footprint to a minimum.</p>
        </motion.div>

        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.iconWrapper}>
            <Video size={24} className={styles.accentIcon} />
          </div>
          <h3>Proof of Work</h3>
          <p>The perfect tool to generate visual proof of your focused sessions for the Marathon Server.</p>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.creditSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Heart size={32} className={styles.creditIcon} />
        <h2>Built for the Community</h2>
        <div className={styles.creditContent}>
          <p>
            This app was crafted with love by <a href="https://www.linkedin.com/in/singh-savyasachi/" target="_blank" rel="noopener noreferrer" className={styles.creditLink}>Savyasachi Singh</a> in collaboration with the Marathon Server team.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
