'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="notion-buddy-theme"
    >
      <AuthProvider>
        {children}
        <Toaster richColors position="top-center" duration={2000} />
      </AuthProvider>
    </ThemeProvider>
  )
} 