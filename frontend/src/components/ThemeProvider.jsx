"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../store/settingsSlice";

export function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  useEffect(() => {
    // Apply theme to document immediately
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    } else if (systemPrefersDark) {
      dispatch(setTheme("dark"));
    } else {
      dispatch(setTheme("light"));
    }
  }, [dispatch]);

  return <>{children}</>;
}
