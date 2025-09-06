import React, { useEffect, useRef } from 'react'

/*
  Six boxes for a six digit code.

  One long text field would have been less work, but a code arrives as six
  separate characters and people type it that way - glancing at the email,
  typing two, glancing back. Boxes hold your place.

  The fiddly parts are the ones people notice: pasting the whole code from
  the email fills every box, backspace on an empty box steps back rather
  than doing nothing, and the arrow keys move between boxes.
*/
const OtpInput = ({ value, onChange, length = 6, disabled, autoFocus = true }) => {
  const inputs = useRef([])

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus()
  }, [autoFocus])

  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  /*
    Writing is clamped to the end of what has been typed so far, so the code
    can never end up with a hole in it. Clicking box 5 on an empty form and
    typing puts the digit in box 1, where it belongs - joining an array with
    gaps in it would silently have shifted everything left instead.
  */
  const setAt = (index, digit) => {
    const chars = value.split('')
    const target = Math.min(index, chars.length)

    if (digit === '') chars.splice(target, 1)
    else chars[target] = digit

    onChange(chars.join('').slice(0, length))
  }

  const handleChange = (index, raw) => {
    // Strip anything that is not a digit, so a stray letter cannot land in
    // a box and quietly make the code wrong.
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) return setAt(index, '')

    if (cleaned.length > 1) {
      // Several digits at once: someone typed fast or pasted into a box.
      const merged = (value.slice(0, index) + cleaned).slice(0, length)
      onChange(merged)
      inputs.current[Math.min(merged.length, length - 1)]?.focus()
      return
    }

    setAt(index, cleaned)
    if (index < length - 1) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index].trim() && index > 0) {
      event.preventDefault()
      setAt(index - 1, '')
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus()
  }

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputs.current[index] = el }}
          // Numeric keypad on a phone, without the spinner arrows a number
          // input would add.
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit.trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => {
            // Clicking ahead of where you have typed jumps back to the box
            // that is actually next, rather than looking editable and not
            // being it.
            if (index > value.length) inputs.current[value.length]?.focus()
            else e.target.select()
          }}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-full rounded-lg border border-gray-300 bg-white text-center text-xl font-medium text-gray-900 outline-none transition-colors hover:border-gray-400 focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 sm:h-16 sm:text-2xl"
        />
      ))}
    </div>
  )
}

export default OtpInput
