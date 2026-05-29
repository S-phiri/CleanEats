'use client'

import Link from 'next/link'
import { CalendarDays, ClipboardList, User } from 'lucide-react'

const ITEMS = [
  { id: 'today', label: 'Today', icon: CalendarDays, href: null },
  { id: 'plan', label: 'My Plan', icon: ClipboardList, href: null },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
]

export default function MobileBottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line)] bg-[rgba(12,12,10,0.95)] backdrop-blur-[14px] safe-area-pb"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {ITEMS.map(({ id, label, icon: Icon, href }) => {
          const active = href ? false : activeTab === id
          const className = `flex flex-1 flex-col items-center justify-center gap-1 min-h-[56px] py-2 px-2 text-[10px] font-medium uppercase tracking-wide transition-colors ${
            active ? 'text-green-soft' : 'text-ink-mute hover:text-ink'
          }`

          if (href) {
            return (
              <Link key={id} href={href} className={className} aria-label={label}>
                <Icon size={22} strokeWidth={active ? 2.25 : 2} aria-hidden />
                <span>{label}</span>
              </Link>
            )
          }

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange?.(id)}
              className={className}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 2} aria-hidden />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
