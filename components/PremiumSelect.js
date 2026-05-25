'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Custom select with portaled menu so lists float above grid siblings (profile wizard, etc.).
 */
export default function PremiumSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  T,
  id,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find((o) => o.value === value)

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const gap = 6
    const maxMenuH = Math.min(280, window.innerHeight * 0.45)
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow
    const maxHeight = Math.min(maxMenuH, openUpward ? spaceAbove - 8 : spaceBelow - 8)

    setMenuPos({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, maxHeight),
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    })
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScrollOrResize = () => updatePosition()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, updatePosition])

  useEffect(() => {
    function handlePointer(e) {
      const target = e.target
      if (buttonRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    return () => document.removeEventListener('mousedown', handlePointer)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const triggerClass = [
    'ce-input',
    'flex items-center justify-between gap-2 text-left cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--base)]',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    T?.input && T.input !== 'ce-input' ? T.input : '',
  ]
    .filter(Boolean)
    .join(' ')

  const menu =
    mounted && open && menuPos
      ? createPortal(
          <AnimatePresence>
            <motion.ul
              ref={listRef}
              role="listbox"
              id={id ? `${id}-listbox` : undefined}
              initial={{ opacity: 0, y: menuPos.bottom != null ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: menuPos.bottom != null ? 4 : -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                left: menuPos.left,
                width: menuPos.width,
                maxHeight: menuPos.maxHeight,
                top: menuPos.top,
                bottom: menuPos.bottom,
                zIndex: 10000,
              }}
              className="rounded-[var(--r-md)] border border-[var(--line-strong)] bg-base-3 shadow-[0_20px_50px_rgba(0,0,0,0.55)] overflow-y-auto py-1 list-none m-0"
            >
              {options.map((o) => {
                const active = o.value === value
                return (
                  <li key={o.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value)
                        setOpen(false)
                      }}
                      className={`w-full min-h-[44px] px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? 'bg-green/15 text-green-soft font-medium'
                          : 'text-ink hover:bg-[rgba(201,168,76,0.08)]'
                      }`}
                    >
                      {o.label}
                    </button>
                  </li>
                )
              })}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )
      : null

  return (
    <div className={`relative ${open ? 'z-[50]' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id ? `${id}-listbox` : undefined}
        onClick={() => {
          if (disabled) return
          if (!open) updatePosition()
          setOpen((o) => !o)
        }}
        className={triggerClass}
      >
        <span className={selected ? 'text-ink' : 'text-ink-mute'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 opacity-50 text-gold-soft"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      {menu}
    </div>
  )
}
