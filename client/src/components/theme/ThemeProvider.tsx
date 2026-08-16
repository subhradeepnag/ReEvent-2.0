'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'reevent-theme'

type ThemeContextValue = {
  /** What the user picked — 'system' follows the OS. */
  theme: ThemePreference
  /** What is actually on screen right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemePreference) => void
  /** True once the client has mounted; guards against hydration mismatches. */
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Runs before React hydrates (injected as a blocking script in the layout) so the
// correct theme is painted on the very first frame — no white flash on a dark page.
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || ((!stored || stored === 'system') && prefersDark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // Adopt whatever the init script already decided, so provider state and DOM agree
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null
    const preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'

    setThemeState(preference)
    setResolvedTheme(preference === 'system' ? systemTheme() : preference)
    setMounted(true)
  }, [])

  // Only while on 'system' does the OS get to change the theme under us
  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const next = media.matches ? 'dark' : 'light'
      setResolvedTheme(next)
      applyTheme(next)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: ThemePreference) => {
    const resolved = next === 'system' ? systemTheme() : next

    setThemeState(next)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    localStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, mounted }), [theme, resolvedTheme, setTheme, mounted])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside a ThemeProvider')
  return context
}
