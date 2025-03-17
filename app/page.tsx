'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'
import { Sparkles, Layout, Clock, Lightbulb } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const { user, signInWithGoogle, loading } = useAuth()

  // Handle authenticated users
  useEffect(() => {
    if (user && !loading) {
      router.replace('/chat')
    }
  }, [user, loading, router])

  const handleAction = async () => {
    if (user) {
      router.replace('/chat')
      router.refresh()
    } else {
      try {
        await signInWithGoogle()
      } catch (error) {
        console.error('Failed to sign in:', error)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Theme toggle */}
      <div className="fixed right-4 top-4 z-[60]">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-8 px-4 text-center">
        {/* Hero section */}
        <div className="space-y-4">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Notion Assistant</span>
          </div>
          <h1 className="bg-gradient-to-br from-slate-800 to-slate-900 bg-clip-text text-5xl font-bold text-transparent dark:from-slate-200 dark:to-slate-400 md:text-6xl">
            Your Notion Expert
            <br />
            Available 24/7
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Get instant answers, templates, and best practices for Notion. Transform your workspace with AI-powered insights and expert guidance.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Layout className="mb-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">Templates & Layouts</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Get customized templates for any use case</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Clock className="mb-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">Instant Answers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Quick solutions to all your Notion questions</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Lightbulb className="mb-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-200">Best Practices</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Learn expert tips and optimization tricks</p>
          </div>
        </div>

        {/* CTA button */}
        <Button
          onClick={handleAction}
          disabled={loading}
          className="group relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 px-8 py-3 text-lg font-medium text-white transition-all hover:shadow-[0_8px_16px_rgba(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-70"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative">
            {loading ? 'Loading...' : user ? 'Continue to Chat' : 'Sign in with Google'}
          </span>
        </Button>

        {/* Trust badge */}
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Powered by advanced AI technology • Secure Google sign-in
        </p>
      </div>
    </div>
  )
}
