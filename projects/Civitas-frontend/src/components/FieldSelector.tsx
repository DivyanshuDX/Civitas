import React from 'react'

const DOC_FIELD_LABELS: Record<number, { bit: number; label: string }[]> = {
  0: [ // Aadhaar
    { bit: 0b0000_0001, label: 'Full Name' },
    { bit: 0b0000_0010, label: 'Date of Birth' },
    { bit: 0b0000_0100, label: 'Gender' },
    { bit: 0b0000_1000, label: 'Address' },
    { bit: 0b0001_0000, label: 'Photo' },
    { bit: 0b0010_0000, label: 'Masked Aadhaar Number' },
  ],
  1: [ // PAN
    { bit: 0b0000_0001, label: 'Full Name' },
    { bit: 0b0000_0010, label: 'Date of Birth' },
    { bit: 0b0000_0100, label: 'PAN Number' },
    { bit: 0b0000_1000, label: "Father's Name" },
  ],
  2: [ // Voter ID
    { bit: 0b0000_0001, label: 'Full Name' },
    { bit: 0b0000_0010, label: 'Date of Birth' },
    { bit: 0b0000_0100, label: 'Gender' },
    { bit: 0b0000_1000, label: 'Address' },
    { bit: 0b0001_0000, label: 'Voter ID Number' },
    { bit: 0b0010_0000, label: 'Constituency' },
  ],
}

export function bitmaskToFieldNames(docType: number, bitmask: number): string[] {
  const fields = DOC_FIELD_LABELS[docType] ?? []
  return fields.filter((f) => (bitmask & f.bit) !== 0).map((f) => f.label)
}

interface FieldSelectorProps {
  docType: number
  value: number
  onChange: (bitmask: number) => void
  /** If set, only these fields can be toggled (used on user side to limit to requested fields) */
  allowedFields?: number
  /** Read-only mode — just display which fields are selected */
  readOnly?: boolean
  /** Compact mode for inline display */
  compact?: boolean
}

const FieldSelector: React.FC<FieldSelectorProps> = ({
  docType,
  value,
  onChange,
  allowedFields,
  readOnly = false,
  compact = false,
}) => {
  const fields = DOC_FIELD_LABELS[docType] ?? []

  const toggleField = (bit: number) => {
    if (readOnly) return
    if (allowedFields !== undefined && (allowedFields & bit) === 0) return
    onChange(value ^ bit)
  }

  const toggleAll = () => {
    if (readOnly) return
    const allBits = fields.reduce((acc, f) => {
      if (allowedFields !== undefined && (allowedFields & f.bit) === 0) return acc
      return acc | f.bit
    }, 0)
    const allSelected = (value & allBits) === allBits
    onChange(allSelected ? 0 : allBits)
  }

  const availableFields = fields.filter(
    (f) => allowedFields === undefined || (allowedFields & f.bit) !== 0
  )
  const allBits = availableFields.reduce((acc, f) => acc | f.bit, 0)
  const allSelected = allBits > 0 && (value & allBits) === allBits
  const selectedCount = availableFields.filter((f) => (value & f.bit) !== 0).length

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {fields.map((field) => {
          const isSelected = (value & field.bit) !== 0
          const isAllowed = allowedFields === undefined || (allowedFields & field.bit) !== 0
          return (
            <span
              key={field.bit}
              className={`badge badge-sm ${
                isSelected
                  ? 'badge-primary'
                  : isAllowed
                    ? 'badge-ghost'
                    : 'badge-ghost opacity-30 line-through'
              }`}
            >
              {field.label}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/40">
            {selectedCount}/{availableFields.length} fields selected
          </span>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={toggleAll}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {fields.map((field) => {
          const isSelected = (value & field.bit) !== 0
          const isAllowed = allowedFields === undefined || (allowedFields & field.bit) !== 0
          const isDisabled = readOnly || !isAllowed

          return (
            <label
              key={field.bit}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                isDisabled ? 'cursor-default' : ''
              } ${
                isSelected
                  ? 'border-primary/30 bg-primary/5'
                  : isAllowed
                    ? 'border-base-content/[0.08] hover:border-base-content/20 bg-base-content/[0.02]'
                    : 'border-base-content/[0.04] bg-base-content/[0.01] opacity-40'
              }`}
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-xs"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggleField(field.bit)}
              />
              <div className="flex items-center gap-1.5 min-w-0">
                {isSelected ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success shrink-0">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-content/30 shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                <span className={`text-xs ${isSelected ? 'text-base-content font-medium' : 'text-base-content/50'}`}>
                  {field.label}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default FieldSelector
