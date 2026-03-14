'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',          label: 'overview'  },
  { href: '/projects',  label: 'projects'  },
  { href: '/sessions',  label: 'sessions'  },
  { href: '/costs',     label: 'costs'     },
  { href: '/tools',     label: 'tools'     },
  { href: '/activity',  label: 'activity'  },
  { href: '/export',    label: 'export'    },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-[#1a1d26] bg-[#0b0d12] z-40">
      <div className="px-4 pt-5 pb-4 border-b border-[#1a1d26]">
        <span
          className="text-[#c2703a] text-[14px] leading-none whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-press-start)',
            WebkitTextStroke: '0.5px #c2703a',
            textShadow: '1px 1px 0 #7a3a1a',
          }}
        >
          Claude Code Lens
        </span>
        {/* <p className="text-[11px] text-[#7a8494] font-mono mt-2">~/.claude</p> */}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-2.5 px-4 py-3 rounded-r text-base font-mono transition-colors relative',
                active
                  ? 'text-[#fbbf24] bg-[#1a1d26] border-l-2 border-l-[#d97706] pl-[14px]'
                  : 'text-[#94a3b8] hover:text-[#e8eaed] hover:bg-[#141620]/80',
              ].join(' ')}
            >
              <span className={active ? 'text-[#d97706]' : 'text-[#4a5468]'}>›</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#1a1d26]">
        <p className="text-sm text-[#4a5468] font-mono">Made by Arindam</p>
      </div>
    </aside>
  )
}
