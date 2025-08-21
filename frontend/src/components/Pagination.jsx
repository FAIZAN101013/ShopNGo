import React from 'react'

// Builds the list of page buttons, collapsing long runs into an ellipsis so
// the control stays the same width whether there are 5 pages or 500.
// e.g. current 7 of 20  ->  1 … 6 7 8 … 20
const buildPages = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('start-ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('end-ellipsis')

  pages.push(total)
  return pages
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = buildPages(currentPage, totalPages)

  const buttonBase =
    'min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-md text-sm transition-colors'

  return (
    <nav
      aria-label="Collection pages"
      className="flex flex-wrap items-center justify-center gap-2 pt-12 pb-4"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${buttonBase} border border-gray-300 text-gray-700 hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300`}
      >
        Prev
      </button>

      {pages.map((page) =>
        typeof page === 'string' ? (
          <span key={page} className="px-1 text-gray-400 select-none">
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${buttonBase} ${
              page === currentPage
                ? 'bg-black text-white font-medium'
                : 'border border-gray-300 text-gray-700 hover:border-gray-900'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${buttonBase} border border-gray-300 text-gray-700 hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300`}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
