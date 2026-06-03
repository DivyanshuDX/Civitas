import React, { useState, useEffect, useRef } from 'react'

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'Expired'] as const
const DOC_TYPE_OPTIONS = ['All', 'Aadhaar', 'PAN', 'Voter ID'] as const

export type StatusFilter = (typeof STATUS_OPTIONS)[number]
export type DocTypeFilter = (typeof DOC_TYPE_OPTIONS)[number]

export interface SearchFilters {
  query: string
  status: StatusFilter
  docType: DocTypeFilter
}

interface SearchBarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  showDocType?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, onChange, showDocType = true }) => {
  const [localQuery, setLocalQuery] = useState(filters.query)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocalQuery(filters.query)
  }, [filters.query])

  const handleQueryChange = (value: string) => {
    setLocalQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, query: value })
    }, 300)
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by address or request ID..."
          className="input input-bordered input-sm w-full pl-9 bg-base-200/30"
          value={localQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {localQuery && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
            onClick={() => {
              setLocalQuery('')
              onChange({ ...filters, query: '' })
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <select
        className="select select-bordered select-sm bg-base-200/30 min-w-[130px]"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as StatusFilter })}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === 'All' ? 'All Status' : s}
          </option>
        ))}
      </select>

      {showDocType && (
        <select
          className="select select-bordered select-sm bg-base-200/30 min-w-[130px]"
          value={filters.docType}
          onChange={(e) => onChange({ ...filters, docType: e.target.value as DocTypeFilter })}
        >
          {DOC_TYPE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Documents' : d}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

export default SearchBar
