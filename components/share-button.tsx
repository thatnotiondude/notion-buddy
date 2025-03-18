'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonProps {
  shareUrl?: string
  onShare: () => Promise<string>
}

export function ShareButton({ shareUrl = '', onShare }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      console.log('Share button clicked')
      const url = await onShare()
      console.log('Got share URL:', url)
      
      if (!url) {
        throw new Error('No share URL generated')
      }

      await navigator.clipboard.writeText(url)
      console.log('Copied to clipboard:', url)
      
      setCopied(true)
      toast.success('Share link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error in share button:', error)
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to copy share link')
      } else {
        toast.error('Failed to copy share link')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Share chat"
    >
      {copied ? (
        <Check className="h-5 w-5" />
      ) : (
        <Share2 className="h-5 w-5" />
      )}
    </button>
  )
} 