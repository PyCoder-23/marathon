"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Embers / Coals data ──────────────────────────────────────
// Embers float upwards, twisting and fading.
const EMBERS = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100, // starting viewport width %
  y: Math.random() * 100 + 100, // start below the screen
  size: Math.random() * 4 + 2, // 2px to 6px
  duration: Math.random() * 10 + 10, // 10s to 20s to float up
  delay: Math.random() * 15,
  drift: (Math.random() - 0.5) * 40, // drift left or right
  opacity: Math.random() * 0.6 + 0.4,
}));

function Ember({ ember }: { ember: typeof EMBERS[0] }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${ember.x}vw`,
        bottom: "-10vh",
        width: ember.size,
        height: ember.size,
        backgroundColor: "#ff3300",
        borderRadius: "50%",
        boxShadow: `0 0 ${ember.size * 2}px ${ember.size}px rgba(255, 50, 0, 0.6)`,
        zIndex: 0,
      }}
      animate={{
        y: ["0vh", "-120vh"],
        x: [0, ember.drift, -ember.drift * 0.5, ember.drift * 0.2],
        opacity: [0, ember.opacity, ember.opacity * 0.5, 0],
        scale: [1, 1.2, 0.8, 0],
      }}
      transition={{
        duration: ember.duration,
        delay: ember.delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.2, 0.8, 1],
      }}
    />
  );
}

function StationarySukuna() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "10vh",
        right: "2vw",
        zIndex: 3,
        pointerEvents: "auto", // Allow hovering on Sukuna
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
      transition={{ 
        opacity: { duration: 0.8 },
        x: { duration: 0.8 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            position: "absolute",
            top: "-60px",
            right: "0%",
            border: "1px solid #dc2626",
            padding: "10px 18px",
            background: "rgba(10, 1, 1, 0.8)",
            backdropFilter: "blur(4px)",
            color: "#dc2626",
            textShadow: "0 0 10px rgba(220, 38, 38, 0.6)",
            fontWeight: "700",
            fontSize: "15px",
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "nowrap",
            zIndex: 4,
            transformOrigin: "bottom right",
          }}
        >
          "Go Grind! you weak human!"
        </motion.div>
      )}

      <img
        src="/sukuna.png"
        alt="Sukuna"
        style={{
          height: "35vh",
          minHeight: "220px",
          maxHeight: "450px",
          width: "auto",
          objectFit: "contain",
          display: "block",
          imageRendering: "auto",
          filter: "drop-shadow(0 0 20px rgba(220, 38, 38, 0.3))",
          cursor: "pointer",
        }}
      />
    </motion.div>
  );
}

export default function JJKOverlay() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Floating Embers */}
      {EMBERS.map((ember) => (
        <Ember key={ember.id} ember={ember} />
      ))}
      
      <StationarySukuna />
    </div>
  );
}
