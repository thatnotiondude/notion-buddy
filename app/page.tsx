'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { addChat } = useStore()

  const handleEnter = () => {
    // Create a new chat and navigate to it
    addChat()
    router.push('/chat')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Theme toggle */}
      <div className="fixed right-4 top-4 z-[60]">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-6 px-4 text-center">
        {/* Title and description */}
        <div className="space-y-4">
          <h1 className="bg-gradient-to-br from-slate-800 to-slate-900 bg-clip-text text-5xl font-bold text-transparent dark:from-slate-200 dark:to-slate-400 md:text-6xl">
            Notion Buddy
          </h1>
          <p className="max-w-md text-lg text-slate-600 dark:text-slate-400">
            Your AI-powered assistant for Notion. Get instant help with templates, features, and best practices.
          </p>
        </div>

        {/* Enter button */}
        <Button
          onClick={handleEnter}
          className="group relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 px-8 py-3 text-lg font-medium text-white transition-all hover:shadow-[0_8px_16px_rgba(79,70,229,0.3)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative">Enter Notion Buddy</span>
        </Button>
      </div>
    </div>
  )
}
