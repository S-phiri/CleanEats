'use client'

import { useState, useEffect, useMemo } from 'react'
import { Clock, Check, ArrowLeftRight } from 'lucide-react'
import Glass from '../primitives/Glass'
import Button from '../primitives/Button'

function coachNoteFor(meal) {
  const note = meal?.coachNote ?? meal?.coach_note
  return typeof note === 'string' ? note.trim() : ''
}

export default function RecipePanel({
  meal,
  panelTab,
  onPanelTab,
  shoppingCount = 0,
  swapPicker = null,
  onIngredientRowTap,
  onSelectLocalSwap,
  onShowCustomSwap,
  onHideCustomSwap,
  customSwapInput = '',
  onCustomSwapInputChange,
  onConfirmCustomSwap,
  onCloseSwapPicker,
  swappingPortionIndex = null,
  onSwapMeal,
  swapMealLoading = false,
}) {
  const [completed, setCompleted] = useState(false)
  const coachNote = useMemo(() => (meal ? coachNoteFor(meal) : ''), [meal])

  const tabs = useMemo(() => [
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'shopping', label: `Shopping (${shoppingCount})` },
    ...(coachNote ? [{ id: 'coach', label: 'Coach note' }] : []),
  ], [coachNote, shoppingCount])

  useEffect(() => {
    if (panelTab === 'coach' && !coachNote) onPanelTab('ingredients')
  }, [panelTab, coachNote, onPanelTab])

  if (!meal) {
    return (
      <Glass goldEdge className="p-8 min-w-0 overflow-hidden">
        <p className="text-ink-mute text-sm">Select a meal to view recipe details.</p>
      </Glass>
    )
  }

  return (
    <Glass goldEdge className="flex flex-col min-w-0 overflow-hidden max-h-[calc(100vh-120px)]">
      <div className="px-5 pt-5 pb-0 flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gold px-2 py-1 rounded-full bg-base/80 border border-[var(--line)]">
          {(meal.type || 'MEAL').toUpperCase()}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] text-ink px-2 py-1 rounded-full bg-base/80 border border-[var(--line)]">
          <Clock size={14} strokeWidth={2} />
          32 min
        </span>
      </div>

      <div className="px-5 pb-5 flex-1 overflow-y-auto overflow-x-hidden">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mb-1">Recipe</p>
        <h2 className="font-syne font-bold text-[28px] text-ink leading-tight mb-4">{meal.name}</h2>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { l: 'Kcal', v: meal.calories ?? '—' },
            { l: 'Protein', v: meal.protein != null ? `${meal.protein}g` : '—' },
            { l: 'Carbs', v: meal.carbs != null ? `${meal.carbs}g` : '—' },
            { l: 'Fat', v: meal.fat != null ? `${meal.fat}g` : '—' },
          ].map((m) => (
            <div key={m.l} className="rounded-[var(--r-sm)] border border-[var(--line)] bg-base-3/50 p-2 text-center">
              <p className="font-mono text-[9px] uppercase text-ink-faint">{m.l}</p>
              <p className="font-syne font-bold text-sm tabular-nums text-gold-soft mt-0.5">{m.v}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-xl border border-[var(--line)] bg-base-3 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPanelTab(t.id)}
              className={`flex-1 min-h-[44px] px-2 rounded-lg text-xs font-medium transition-colors ${
                panelTab === t.id ? 'bg-ink text-base' : 'text-ink-mute'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {panelTab === 'ingredients' && (
          <ul className="space-y-0">
            {(meal.portions || []).map((p, pi) => {
              const swapping = swappingPortionIndex === pi
              const pickerOpen = swapPicker?.portionIndex === pi
              const busy = swappingPortionIndex !== null
              return (
              <li
                key={pi}
                role="button"
                tabIndex={0}
                onClick={() => !busy && onIngredientRowTap?.(pi)}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !busy) onIngredientRowTap?.(pi) }}
                className={`flex gap-3 items-center py-3 border-b border-dashed border-[var(--line)] text-sm cursor-pointer transition-colors ${
                  swapping || pickerOpen ? 'bg-green/15 border-green/30' : 'hover:bg-base-3/40'
                } ${busy && !swapping ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <span className="font-mono text-[11px] text-ink-faint w-16 shrink-0 tabular-nums">
                  {p.grams != null ? `${p.grams}g` : '—'}
                </span>
                <span className="flex-1 text-ink">{p.ingredient}</span>
                {p.measure && <span className="font-mono text-[10px] text-gold tabular-nums shrink-0">{p.measure}</span>}
                <span className={`shrink-0 ${swapping ? 'text-green-soft' : 'text-ink-mute'}`} aria-hidden>
                  <ArrowLeftRight size={16} strokeWidth={2} className={swapping ? 'animate-pulse' : ''} />
                </span>
              </li>
            )})}
            {swapPicker && (
              <li className="py-4 pt-5 list-none border-t border-[#C9A84C]/10 border-b border-[var(--line)] bg-[#0C0C0A]">
                <p className="font-syne text-[10px] uppercase tracking-[0.16em] text-[#C9A84C] mb-3">
                  SWAP {(meal.portions?.[swapPicker.portionIndex]?.ingredient || '').toUpperCase()}
                </p>
                {!swapPicker.showCustom ? (
                  <>
                    <div className="flex flex-wrap gap-2 mt-3 mb-3">
                      {swapPicker.swaps.map((s, si) => (
                        <button
                          key={si}
                          type="button"
                          onClick={() => onSelectLocalSwap?.(s)}
                          className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-xs rounded-full border border-[#C9A84C] bg-[#1A1A18] font-medium text-[#C9A84C] transition-all duration-200 hover:bg-[#C9A84C] hover:text-[#0C0C0A]"
                        >
                          {s.ingredient}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onShowCustomSwap?.()}
                        className="text-xs italic text-[#C9A84C]/55 font-sans hover:text-[#C9A84C] hover:underline transition-colors"
                      >
                        Type an ingredient you have
                      </button>
                      <button
                        type="button"
                        onClick={() => onCloseSwapPicker?.()}
                        className="text-xs text-[#888888] no-underline hover:text-[#C9A84C] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customSwapInput}
                      onChange={e => onCustomSwapInputChange?.(e.target.value)}
                      placeholder="Type an ingredient you have"
                      className="w-full mt-2 mb-2 px-4 py-3 rounded-lg border border-[#C9A84C] bg-[#1A1A18] text-sm text-white outline-none transition-shadow focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-0 focus:ring-offset-[#0C0C0A]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={swappingPortionIndex !== null || !customSwapInput.trim()}
                        onClick={() => onConfirmCustomSwap?.()}
                        className="px-4 py-2 rounded-full bg-ink text-base text-xs font-medium disabled:opacity-50"
                      >
                        {swappingPortionIndex !== null ? 'Checking…' : 'Confirm substitute'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onHideCustomSwap?.()}
                        className="px-4 py-2 rounded-full border border-[var(--line)] text-xs text-ink-mute"
                      >
                        Back to suggestions
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCloseSwapPicker?.()}
                      className="text-xs text-[#888888] no-underline hover:text-[#C9A84C] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        )}

        {panelTab === 'coach' && coachNote && (
          <div className="glass p-4 rounded-[var(--r-md)] border border-[var(--line)]">
            <p className="text-sm text-ink-mute leading-relaxed">{coachNote}</p>
          </div>
        )}

        {panelTab === 'shopping' && (
          <p className="text-sm text-ink-mute">Open the Shopping List tab for pantry mode and regeneration.</p>
        )}

        <hr className="border-[var(--line)] my-5" />
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            className="!text-xs"
            disabled={swapMealLoading || swappingPortionIndex !== null || swapPicker !== null}
            onClick={() => onSwapMeal?.()}
          >
            {swapMealLoading ? 'Swapping…' : 'Swap meal'}
          </Button>
          <Button
            className="!text-xs"
            disabled={completed}
            onClick={() => setCompleted(true)}
          >
            {completed ? (
              <>
                <Check size={16} /> Completed
              </>
            ) : (
              'Mark as completed'
            )}
          </Button>
        </div>
      </div>
    </Glass>
  )
}
