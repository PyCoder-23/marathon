"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import AnimeOverlay from "./AnimeOverlay";

type ThemeContextType = {
  activeTheme: string | null;
  logoSrc: string;
  isMusicPlaying: boolean;
  hasThemeMusic: boolean;
  toggleMusic: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: null,
  logoSrc: "/logo.png",
  isMusicPlaying: false,
  hasThemeMusic: false,
  toggleMusic: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEME_MUSIC: Record<string, string> = {
  "thm-demon-slayer": "/ds_music.mp3",
  "thm-abyssal-waters": "/abyssal_waters.mp3",
  "thm-arctic-tundra": "/arctic_tundra.mp3",
  "thm-cosmic-void": "/cosmic_void.mp3",
  "thm-emerald-canopy": "/emerald_canopy.mp3",
  "thm-scorched-sands": "/scorched_sands.mp3",
  "thm-timberline-range": "/timberline_range.mp3",
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasThemeMusic, setHasThemeMusic] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Manage music when theme changes
  useEffect(() => {
    if (activeTheme && THEME_MUSIC[activeTheme]) {
      setHasThemeMusic(true);
      if (audioRef.current) {
        audioRef.current.src = THEME_MUSIC[activeTheme];
        audioRef.current.loop = true;
        audioRef.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch((e) => {
          console.warn("Autoplay blocked by browser:", e);
          setIsMusicPlaying(false);
        });
      }
    } else {
      setHasThemeMusic(false);
      setIsMusicPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, [activeTheme]);

  const toggleMusic = () => {
    if (!audioRef.current || !hasThemeMusic) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(e => console.error("Error playing audio:", e));
    }
  };

  useEffect(() => {
    const checkTheme = () => {
      try {
        const equippedRaw = localStorage.getItem("equippedItems");
        if (equippedRaw) {
          const equipped = JSON.parse(equippedRaw) as string[];
          const theme = equipped.find((item) => item.startsWith("thm-"));
          
          if (theme) {
            setActiveTheme(theme);
            
            // Clean up any old theme classes
            Array.from(document.body.classList).forEach(cls => {
              if (cls.startsWith('theme-')) {
                document.body.classList.remove(cls);
              }
            });

            if (theme === "thm-white-mode") {
              setLogoSrc("/white_logo.png");
              document.body.classList.add("theme-white-mode");
            } else if (theme === "thm-abyssal-waters") {
              setLogoSrc("/ocean_logo.png");
              document.body.classList.add("theme-abyssal-waters");
            } else if (theme === "thm-scorched-sands") {
              setLogoSrc("/desert_logo.png");
              document.body.classList.add("theme-scorched-sands");
            } else if (theme === "thm-cosmic-void") {
              setLogoSrc("/space_logo.png");
              document.body.classList.add("theme-cosmic-void");
            } else if (theme === "thm-arctic-tundra") {
              setLogoSrc("/snow_logo.png");
              document.body.classList.add("theme-arctic-tundra");
            } else if (theme === "thm-emerald-canopy") {
              setLogoSrc("/forest_logo.png");
              document.body.classList.add("theme-emerald-canopy");
            } else if (theme === "thm-timberline-range") {
              setLogoSrc("/mountain_logo.png");
              document.body.classList.add("theme-timberline-range");
            } else if (theme === "thm-demon-slayer") {
              setLogoSrc("/anime_ds_logo.png");
              document.body.classList.add("theme-demon-slayer");
            } else if (theme.startsWith("thm-neon-")) {
              const color = theme.replace("thm-neon-", "");
              setLogoSrc(`/${color}_logo.png`);
              document.body.classList.add(theme.replace("thm-", "theme-"));
            } else {
              setLogoSrc("/logo.png");
            }
          } else {
            setActiveTheme(null);
            setLogoSrc("/logo.png");
            Array.from(document.body.classList).forEach(cls => {
              if (cls.startsWith('theme-')) {
                document.body.classList.remove(cls);
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to parse equipped items for theme", e);
      }
    };

    checkTheme();

    // Listen for custom event or storage event if equipped items change
    window.addEventListener("storage", (e) => {
      if (e.key === "equippedItems") checkTheme();
    });
    window.addEventListener("equippedItemsUpdated", checkTheme);

    return () => {
      window.removeEventListener("storage", checkTheme);
      window.removeEventListener("equippedItemsUpdated", checkTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ activeTheme, logoSrc, isMusicPlaying, hasThemeMusic, toggleMusic }}>
      <audio ref={audioRef} />
      {activeTheme === 'thm-demon-slayer' && <AnimeOverlay />}
      {children}
    </ThemeContext.Provider>
  );
}
