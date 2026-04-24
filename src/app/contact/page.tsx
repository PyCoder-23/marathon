"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Play, Users, ArrowRight, ExternalLink } from "lucide-react";
import styles from "./contact.module.css";

const contactMethods = [
  {
    id: "email",
    title: "Email Us",
    description: "For general inquiries, support, or partnership opportunities, send us an email.",
    value: "marathonxserver@gmail.com",
    btnText: "Send Mail",
    link: "mailto:marathonxserver@gmail.com",
    icon: <Mail className={styles.mailIcon} />,
    color: "#00ff9f",
    type: "email"
  },
  {
    id: "discord",
    title: "Join Discord",
    description: "Connect with the community, get real-time support, and participate in events on our Discord server.",
    value: "discord.gg/FEKt8rADQu",
    btnText: "Join Server",
    link: "https://discord.gg/FEKt8rADQu",
    icon: <MessageSquare className={styles.discordIcon} />,
    color: "#7289da",
    type: "social"
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    description: "Follow us on LinkedIn for updates, announcements, and professional networking opportunities.",
    value: "company/marathon-server",
    btnText: "Follow Us",
    link: "https://www.linkedin.com/company/marathon-server/",
    icon: <Users className={styles.linkedinIcon} />,
    color: "#0077b5",
    type: "social"
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "Subscribe to our YouTube channel for tutorials, updates, and community highlights.",
    value: "@marathon-server",
    btnText: "Subscribe",
    link: "https://www.youtube.com/@marathon-server",
    icon: <Play className={styles.youtubeIcon} fill="currentColor" />,
    color: "#ff0000",
    type: "social"
  }
];

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className="section-label">Connect</span>
        <h1 className="text-gradient">Get In Touch</h1>
        <p className={styles.lead}>
          Whether you have a question, a suggestion, or just want to say hi, 
          we're always here to listen. Choose a method below.
        </p>
      </header>

      <div className={styles.grid}>
        {contactMethods.map((method, index) => (
          <motion.div 
            key={method.id}
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer} style={{ background: `${method.color}15`, border: `1px solid ${method.color}30` }}>
                {React.cloneElement(method.icon as any, { color: method.color })}
              </div>
              <h3>{method.title}</h3>
            </div>
            
            <p className={styles.description}>{method.description}</p>
            
            <div className={styles.actionArea}>
              {method.type === "email" ? (
                <a 
                  href={method.link} 
                  className={styles.primaryBtn} 
                  style={{ background: method.color, color: method.color === "#00ff9f" ? "#000" : "#fff" }}
                >
                  {method.value}
                </a>
              ) : (
                <a 
                  href={method.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.secondaryBtn}
                  style={{ '--btn-accent': method.color } as any}
                >
                  {method.btnText} <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className={styles.footerInfo}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className={styles.responseTime}>
          <span className={styles.pulseDot}></span> We usually respond within 24 hours
        </p>
      </motion.div>
    </div>
  );
}
