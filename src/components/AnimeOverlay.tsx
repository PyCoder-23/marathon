"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Wisteria petals data ──────────────────────────────────────
const PETALS = [
  { id: 0,  x: 8,  size: 9,  duration: 12, delay: 0,    drift: 60,   rotation: 360, opacity: 0.55, color: "#c084fc" },
  { id: 1,  x: 15, size: 7,  duration: 10, delay: 2.5,  drift: -50,  rotation: 540, opacity: 0.45, color: "#a855f7" },
  { id: 2,  x: 23, size: 11, duration: 15, delay: 1,    drift: 80,   rotation: 720, opacity: 0.6,  color: "#e879f9" },
  { id: 3,  x: 31, size: 8,  duration: 11, delay: 4,    drift: -70,  rotation: 290, opacity: 0.5,  color: "#c084fc" },
  { id: 4,  x: 39, size: 10, duration: 14, delay: 0.5,  drift: 55,   rotation: 480, opacity: 0.65, color: "#a855f7" },
  { id: 5,  x: 47, size: 6,  duration: 9,  delay: 3,    drift: -40,  rotation: 630, opacity: 0.4,  color: "#e879f9" },
  { id: 6,  x: 54, size: 12, duration: 16, delay: 1.8,  drift: 90,   rotation: 200, opacity: 0.7,  color: "#c084fc" },
  { id: 7,  x: 62, size: 7,  duration: 10, delay: 5,    drift: -60,  rotation: 410, opacity: 0.45, color: "#a855f7" },
  { id: 8,  x: 70, size: 9,  duration: 13, delay: 0.2,  drift: 45,   rotation: 550, opacity: 0.5,  color: "#e879f9" },
  { id: 9,  x: 78, size: 8,  duration: 11, delay: 3.5,  drift: -80,  rotation: 320, opacity: 0.6,  color: "#c084fc" },
  { id: 10, x: 85, size: 10, duration: 15, delay: 1.2,  drift: 65,   rotation: 680, opacity: 0.55, color: "#a855f7" },
  { id: 11, x: 92, size: 6,  duration: 8,  delay: 6,    drift: -35,  rotation: 250, opacity: 0.4,  color: "#e879f9" },
  { id: 12, x: 5,  size: 11, duration: 17, delay: 7,    drift: 75,   rotation: 500, opacity: 0.65, color: "#c084fc" },
  { id: 13, x: 19, size: 7,  duration: 9,  delay: 2,    drift: -55,  rotation: 380, opacity: 0.45, color: "#a855f7" },
  { id: 14, x: 36, size: 9,  duration: 12, delay: 4.5,  drift: 50,   rotation: 620, opacity: 0.5,  color: "#e879f9" },
  { id: 15, x: 51, size: 8,  duration: 14, delay: 0.8,  drift: -45,  rotation: 270, opacity: 0.6,  color: "#c084fc" },
  { id: 16, x: 66, size: 10, duration: 11, delay: 5.5,  drift: 70,   rotation: 450, opacity: 0.55, color: "#a855f7" },
  { id: 17, x: 74, size: 6,  duration: 10, delay: 1.5,  drift: -65,  rotation: 580, opacity: 0.4,  color: "#e879f9" },
  { id: 18, x: 88, size: 12, duration: 18, delay: 3.2,  drift: 85,   rotation: 330, opacity: 0.7,  color: "#c084fc" },
  { id: 19, x: 96, size: 8,  duration: 13, delay: 6.5,  drift: -50,  rotation: 700, opacity: 0.5,  color: "#a855f7" },
];

// ── Sub-components ────────────────────────────────────────────

function Petal({ petal }: { petal: typeof PETALS[0] }) {
  return (
    <motion.div
      style={{ position: "absolute", left: `${petal.x}vw`, top: -20 }}
      animate={{
        y: ["0px", "110vh"],
        x: [0, petal.drift, -petal.drift * 0.5, petal.drift * 0.3],
        rotate: [0, petal.rotation],
        opacity: [0, petal.opacity, petal.opacity, 0],
      }}
      transition={{
        duration: petal.duration,
        delay: petal.delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.1, 0.85, 1],
      }}
    >
      <svg width={petal.size} height={petal.size * 1.5} viewBox="0 0 10 15" fill="none">
        <ellipse cx="5" cy="7.5" rx="4" ry="6.5" fill={petal.color} opacity="0.85" />
        <ellipse cx="5" cy="7.5" rx="2" ry="4" fill={petal.color} opacity="0.4" />
      </svg>
    </motion.div>
  );
}

function WaterRipple({ delay }: { delay: number }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: "12vw",
        top: "55vh",
        width: 400,
        height: 240,
        borderRadius: "50%",
        border: "1px solid rgba(0, 200, 248, 0.2)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
      animate={{ scale: [0.6, 1.8], opacity: [0.5, 0] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

const DIALOGUES = [
  "I'll save you!",
  "You're not alone!",
  "We can do it!"
];

function StationaryTanjiro() {
  const [isHovered, setIsHovered] = useState(false);
  const [quote, setQuote] = useState("");

  const handleMouseEnter = () => {
    const randomQuote = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
    setQuote(randomQuote);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "10vh",
        left: "2vw",
        zIndex: 3,
        pointerEvents: "auto", // Allow hovering on Tanjiro
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
      transition={{ 
        opacity: { duration: 0.8 },
        x: { duration: 0.8 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Anime-style Dialogue Bubble */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            marginLeft: "-50%", // Center it roughly
            background: "#fff",
            color: "#5c1fa0",
            padding: "10px 18px",
            borderRadius: "16px",
            border: "3px solid #000",
            fontWeight: "900",
            fontSize: "15px",
            fontFamily: "var(--font-manga), sans-serif",
            whiteSpace: "nowrap",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.8)",
            zIndex: 4,
            transformOrigin: "bottom center",
          }}
        >
          {quote}
          {/* Black outline triangle */}
          <div style={{
            position: "absolute",
            bottom: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid #000",
          }} />
          {/* White inner triangle */}
          <div style={{
            position: "absolute",
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid #fff",
          }} />
        </motion.div>
      )}

      <img
        src="/tanjiro.png"
        alt="Tanjiro"
        style={{
          height: "28vh",
          minHeight: "180px",
          maxHeight: "380px",
          width: "auto",
          objectFit: "contain",
          display: "block",
          imageRendering: "auto",
          filter: "drop-shadow(0 0 20px rgba(0, 200, 248, 0.3))",
          cursor: "url('/ds_mouse.png') 4 4, pointer",
        }}
      />
    </motion.div>
  );
}

// ── Main overlay ──────────────────────────────────────────────

export default function AnimeOverlay() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
      {/* Wisteria petals */}
      {PETALS.map((petal) => (
        <Petal key={petal.id} petal={petal} />
      ))}

      {/* Water breathing ripples */}
      <WaterRipple delay={0} />
      <WaterRipple delay={2} />
      <WaterRipple delay={4} />

      {/* Stationary Tanjiro */}
      <StationaryTanjiro />
    </div>
  );
}
