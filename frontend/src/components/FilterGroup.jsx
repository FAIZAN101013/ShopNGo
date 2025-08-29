import React, { useState } from 'react'

/*
  A collapsible block of filter options. The old sidebar stacked three
  fully-expanded bordered boxes, which made the Type list of fourteen
  options push everything else off the screen.
*/
const FilterGroup = ({ title, count = 0, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gray-900">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {count}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && <div className="mt-4 flex flex-col gap-3">{children}</div>}
    </div>
  )
}

export default FilterGroup
