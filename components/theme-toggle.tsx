import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-slate-800/80 dark:border-slate-700 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform text-slate-600 dark:-rotate-90 dark:scale-0 dark:text-slate-400" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform text-slate-600 dark:rotate-0 dark:scale-100 dark:text-slate-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 