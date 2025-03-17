'use client'

import { Share2, Check } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  shareUrl: string
}

export function ShareButton({ shareUrl }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setIsCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      className="h-8 w-8"
      aria-label="Share chat"
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  )
} 