'use client'

import { useId, useState } from 'react'
import Glass from '../primitives/Glass'
import Button from '../primitives/Button'
import TdeeDropdown from './TdeeDropdown'

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'very', label: 'Very Active' },
  { value: 'athlete', label: 'Athlete' },
]

const GOAL_OPTIONS = [
  { value: 'losefat', label: 'Lose Fat' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'muscle', label: 'Build Muscle' },
]

const ACTIVITY_MULT = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
}

const GOAL_CONFIG = {
  losefat: { adj: -300, proteinPerKg: 1.8 },
  maintain: { adj: 0, proteinPerKg: 1.6 },
  muscle: { adj: 200, proteinPerKg: 2 },
}

function lbsToKg(lbs) {
  return lbs * 0.45359237
}

function ftInToCm(ft, inches) {
  return (parseFloat(ft) * 12 + parseFloat(inches)) * 2.54
}

function calculate({ age, weightKg, heightCm, sex, activity, goal }) {
  const bmr =
    sex === 'Female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5

  const maintenance = bmr * (ACTIVITY_MULT[activity] ?? 1.55)
  const goalCfg = GOAL_CONFIG[goal] ?? GOAL_CONFIG.maintain
  const calories = Math.round(maintenance + goalCfg.adj)
  const proteinG = Math.round(weightKg * goalCfg.proteinPerKg)
  const fatG = Math.round((calories * 0.25) / 9)
  const proteinCals = proteinG * 4
  const fatCals = fatG * 9
  const carbCals = Math.max(0, calories - proteinCals - fatCals)
  const carbsG = Math.round(carbCals / 4)
  const palms = Math.max(1, Math.round(proteinG / 25))

  return { calories, proteinG, carbsG, fatG, palms }
}

function UnitToggle({ value, onChange, options }) {
  return (
    <div className="flex p-0.5 rounded-full border border-[var(--line)] bg-base-3 shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`min-h-[36px] px-3 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors ${
            value === opt.value ? 'bg-ink text-base' : 'text-ink-mute hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FieldLabel({ children, htmlFor, id }) {
  return (
    <label
      id={id}
      htmlFor={htmlFor}
      className="block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute mb-1.5"
    >
      {children}
    </label>
  )
}

function ResultBlock({ label, value, unit, hint }) {
  return (
    <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-base-3/50 p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold mb-2">{label}</p>
      <p className="font-syne font-bold text-3xl sm:text-4xl tabular-nums text-[#7CB518] leading-none">
        {value}
        {unit && (
          <span className="font-mono text-sm font-normal text-ink-mute ml-1.5">{unit}</span>
        )}
      </p>
      <p className="text-sm text-ink-mute mt-3 leading-relaxed">{hint}</p>
    </div>
  )
}

export default function TdeeCalculator() {
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [height, setHeight] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [sex, setSex] = useState('Male')
  const [activity, setActivity] = useState('moderate')
  const [goal, setGoal] = useState('maintain')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const activityLabelId = useId()
  const goalLabelId = useId()

  function handleCalculate(e) {
    e.preventDefault()
    setError(null)

    const ageNum = parseInt(age, 10)
    if (!ageNum || ageNum < 15 || ageNum > 80) {
      setError('Enter an age between 15 and 80.')
      setResults(null)
      return
    }

    const weightNum = parseFloat(weight)
    if (!weightNum || weightNum <= 0) {
      setError('Enter a valid weight.')
      setResults(null)
      return
    }
    const weightKg = weightUnit === 'kg' ? weightNum : lbsToKg(weightNum)

    let heightCm
    if (heightUnit === 'cm') {
      heightCm = parseFloat(height)
      if (!heightCm || heightCm <= 0) {
        setError('Enter a valid height in cm.')
        setResults(null)
        return
      }
    } else {
      const ft = parseFloat(heightFt)
      const inches = parseFloat(heightIn)
      if (Number.isNaN(ft) || Number.isNaN(inches) || ft < 0 || inches < 0) {
        setError('Enter a valid height in feet and inches.')
        setResults(null)
        return
      }
      heightCm = ftInToCm(ft, inches)
      if (heightCm <= 0) {
        setError('Enter a valid height in feet and inches.')
        setResults(null)
        return
      }
    }

    setResults(
      calculate({
        age: ageNum,
        weightKg,
        heightCm,
        sex,
        activity,
        goal,
      })
    )
  }

  return (
    <section className="mb-24" aria-labelledby="tdee-calculator-heading">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C9A84C] mb-3">
        Free tool
      </p>
      <h2
        id="tdee-calculator-heading"
        className="font-syne font-bold text-3xl md:text-4xl text-ink leading-tight mb-3"
      >
        TDEE calculator
      </h2>
      <p className="text-ink-mute max-w-2xl leading-relaxed mb-8">
        Estimate your daily calories and macros in under a minute. Numbers are a starting point — your
        CleanEats plan refines them from your full profile.
      </p>

      <Glass goldEdge className="p-6 md:p-8">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <FieldLabel htmlFor="tdee-age">Age</FieldLabel>
              <input
                id="tdee-age"
                type="number"
                min={15}
                max={80}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="ce-input"
                placeholder="28"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <FieldLabel htmlFor="tdee-weight">Weight</FieldLabel>
                <UnitToggle
                  value={weightUnit}
                  onChange={setWeightUnit}
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lbs', label: 'lbs' },
                  ]}
                />
              </div>
              <input
                id="tdee-weight"
                type="number"
                min={1}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="ce-input"
                placeholder={weightUnit === 'kg' ? '75' : '165'}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                  Height
                </span>
                <UnitToggle
                  value={heightUnit}
                  onChange={setHeightUnit}
                  options={[
                    { value: 'cm', label: 'cm' },
                    { value: 'imperial', label: 'ft+in' },
                  ]}
                />
              </div>
              {heightUnit === 'cm' ? (
                <input
                  id="tdee-height"
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="ce-input"
                  placeholder="175"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="ce-input"
                    placeholder="ft"
                    aria-label="Height feet"
                  />
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="ce-input"
                    placeholder="in"
                    aria-label="Height inches"
                  />
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Biological sex</FieldLabel>
              <div className="flex gap-2">
                {['Male', 'Female'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSex(option)}
                    className={`flex-1 min-h-[48px] rounded-[var(--r-sm)] border text-sm font-medium transition-colors ${
                      sex === option
                        ? 'border-[#C9A84C] bg-gold/10 text-ink'
                        : 'border-[var(--line)] bg-base-3 text-ink-mute hover:text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="tdee-activity" id={activityLabelId}>
                Activity level
              </FieldLabel>
              <TdeeDropdown
                id="tdee-activity"
                aria-labelledby={activityLabelId}
                value={activity}
                onChange={setActivity}
                options={ACTIVITY_OPTIONS}
              />
            </div>

            <div>
              <FieldLabel htmlFor="tdee-goal" id={goalLabelId}>
                Goal
              </FieldLabel>
              <TdeeDropdown
                id="tdee-goal"
                aria-labelledby={goalLabelId}
                value={goal}
                onChange={setGoal}
                options={GOAL_OPTIONS}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-amber" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-ghost w-full sm:w-auto">
            Calculate
          </button>

          {results && (
            <div className="pt-6 border-t border-[var(--line)] space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <ResultBlock
                  label="TDEE"
                  value={results.calories.toLocaleString()}
                  unit="kcal"
                  hint="This is how much you need to eat daily to reach your goal"
                />
                <ResultBlock
                  label="Protein"
                  value={results.proteinG}
                  unit="g"
                  hint={`Roughly ${results.palms} palm-sized portions of chicken, fish or legumes`}
                />
                <ResultBlock
                  label="Carbs"
                  value={results.carbsG}
                  unit="g"
                  hint="Your main fuel — rice, sweet potato, oats"
                />
                <ResultBlock
                  label="Fat"
                  value={results.fatG}
                  unit="g"
                  hint="Healthy fats — eggs, nuts, avocado"
                />
              </div>

              <Button href="/signup" className="w-full sm:w-auto justify-center">
                Build My Meal Plan →
              </Button>
            </div>
          )}
        </form>
      </Glass>
    </section>
  )
}
