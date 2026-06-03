import { Moon, Sun } from 'lucide-react'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  dark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {} })

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'civitas-dark' : false
  })

  useEffect(() => {
    const theme = dark ? 'civitas-dark' : 'civitas-light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [dark])

  return <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</ThemeContext.Provider>
}

export const ThemeToggle = () => {
  const { dark, toggle } = useTheme()

  return (
    <button className="btn btn-ghost btn-sm gap-2" onClick={toggle}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="text-xs">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
