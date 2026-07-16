import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeToggleProps {
  className?: string;
  lang?: string;
}

export default function ThemeToggle({ className = "", lang = "en" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isRtl = lang === "ar";

  return (
    <div
      id="theme-toggle-controller"
      className={`bg-white dark:bg-[#0a1930] p-2 px-4 rounded-[24px] border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 transition-all duration-200 ${className}`}
    >
      <div className={`flex flex-col select-none ${isRtl ? "text-right" : "text-left"}`}>
        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight leading-none mb-0.5">
          {isRtl ? "المظهر النشط" : "Active Theme"}
        </span>
        <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 capitalize leading-none">
          {isRtl ? (theme === 'light' ? 'الوضع المضيء' : 'الوضع الداكن') : `${theme} Mode`}
        </span>
      </div>
      
      {/* Dynamic Vertical Divider */}
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Beautiful Rounded Button */}
      <button
        onClick={toggleTheme}
        id="theme-toggle-btn"
        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/80 transition-all duration-200 shadow-sm hover:shadow hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shrink-0 cursor-pointer"
        aria-label={isRtl ? (theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع المضيء') : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={isRtl ? (theme === 'light' ? 'التحويل للوضع الداكن' : 'التحويل للوضع المضيء') : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="light"
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-[#0f172a]" />
            </motion.div>
          ) : (
            <motion.div
              key="dark"
              initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

