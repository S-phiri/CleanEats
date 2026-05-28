'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function TdeeDropdown({ id, value, onChange, options, 'aria-labelledby': ariaLabelledBy }) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  const selected = options.find((opt) => opt.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function selectOption(nextValue) {
    onChange(nextValue)
    setOpen(false)
  }

  const showGoldBorder = open || focused

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={ariaLabelledBy}
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`flex w-full min-h-[48px] items-center justify-between gap-3 rounded-[var(--r-sm)] border px-4 text-left text-[16px] text-white transition-[border-color,box-shadow] duration-200 ease-out ${
          showGoldBorder
            ? 'border-[#C9A84C] shadow-[0_0_0_2px_rgba(201,168,76,0.2)]'
            : 'border-[var(--line)]'
        }`}
        style={{ backgroundColor: '#1a1a18' }}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`shrink-0 text-[#C9A84C] transition-transform duration-200 ease-out ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-labelledby={ariaLabelledBy}
        className={`absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-[var(--r-sm)] border border-[#C9A84C] py-1 shadow-lg transition-[opacity,transform] duration-200 ease-out origin-top ${
          open
            ? 'pointer-events-auto opacity-100 translate-y-0 scale-y-100'
            : 'pointer-events-none opacity-0 -translate-y-1 scale-y-[0.98]'
        }`}
        style={{ backgroundColor: '#1a1a18' }}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value
          return (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(opt.value)}
                className={`w-full px-4 py-3 text-left text-[16px] transition-colors duration-150 ${
                  isSelected ? 'text-white' : 'text-ink-mute'
                } hover:bg-[rgba(201,168,76,0.15)] hover:text-[#C9A84C]`}
              >
                {opt.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
