"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Users, Shield, Award } from "lucide-react";
import styles from "./about.module.css";

export default function AboutPage() {
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
        <span className="section-label">Our Mission</span>
        <h1 className="text-gradient">Fueling Consistency Through Community</h1>
        <p className={styles.lead}>
          Consistency is the engine of progress, but it's hard to maintain alone. 
          Marathon Server turns productivity into a shared journey.
        </p>
      </motion.div>

      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Target size={24} className={styles.accentIcon} />
          </div>
          <h3>Consistency First</h3>
          <p>We focus on building habits that last. It's not about the sprint; it's about the marathon of daily action.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Users size={24} className={styles.accentIcon} />
          </div>
          <h3>Driven by Community</h3>
          <p>Join a network of ambitious students pushing each other to excel. You go further when you go together.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Shield size={24} className={styles.accentIcon} />
          </div>
          <h3>Built-in Accountability</h3>
          <p>Visible progress and communal tracking keep you honest with yourself. No more ghosting your own goals.</p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Award size={24} className={styles.accentIcon} />
          </div>
          <h3>Real Life Rewards</h3>
          <p>Earn XP, level up, and unlock rewards that matter. Gamifying progress makes the hard work feel like play.</p>
        </div>
      </motion.div>

      <motion.div 
        className={styles.storySection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2>The Marathon Philosophy</h2>
        <div className={styles.storyContent}>
          <p>
            Marathon Server was born from a simple observation: students work better when they feel part of something 
            bigger. By combining game mechanics with high-performance study systems, we've created a platform 
            where discipline is the currency of success.
          </p>
          <p>
            Our project aims to bridge the gap between "knowing what to do" and "actually doing it." Through 
            automated tracking and community validation, we eliminate the friction of starting.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
