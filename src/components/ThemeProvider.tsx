"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  activeTheme: string | null;
  logoSrc: string;
};

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: null,
  logoSrc: "/logo.png",
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");

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
    <ThemeContext.Provider value={{ activeTheme, logoSrc }}>
      {children}
    </ThemeContext.Provider>
  );
}
