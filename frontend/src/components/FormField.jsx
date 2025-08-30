import React from 'react'

/*
  One definition of what an input looks like across the auth pages. The
  border, padding and focus treatment were repeated on every field, so they
  had already started to disagree with each other.
*/
export const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors hover:border-gray-400 focus:border-gray-900'

const FormField = ({ id, label, hint, error, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {hint}
    </div>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-red-600">{error}</p>
    )}
  </div>
)

export default FormField
