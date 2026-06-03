import React from 'react'

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (size: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const isFirst = currentPage <= 1
  const isLast = currentPage >= totalPages

  return (
    <div className="flex items-center justify-between px-2 py-3 text-xs">
      <div className="flex items-center gap-2 text-base-content/40">
        <span>
          {totalItems > 0 ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)}` : '0'} of{' '}
          {totalItems}
        </span>
        <select
          className="select select-bordered select-xs bg-base-200/30 min-w-[70px]"
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value))
            onPageChange(1)
          }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-xs" onClick={() => onPageChange(currentPage - 1)} disabled={isFirst}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="px-2 text-base-content/60">
          {currentPage} / {totalPages}
        </span>
        <button className="btn btn-ghost btn-xs" onClick={() => onPageChange(currentPage + 1)} disabled={isLast}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination
