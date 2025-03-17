'use client'

import { Menu } from 'lucide-react'
import { Button } from './ui/button'

interface MobileSidebarToggleProps {
  onToggle: () => void
  isOpen: boolean
}

export function MobileSidebarToggle({ onToggle, isOpen }: MobileSidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={onToggle}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
} 