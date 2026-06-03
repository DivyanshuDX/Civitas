import React from 'react'

const DOC_FIELD_LABELS: Record<number, { bit: number; label: string; key: string }[]> = {
  0: [ // Aadhaar
    { bit: 0b0000_0001, label: 'Full Name', key: 'fullName' },
    { bit: 0b0000_0010, label: 'Date of Birth', key: 'dob' },
    { bit: 0b0000_0100, label: 'Gender', key: 'gender' },
    { bit: 0b0000_1000, label: 'Address', key: 'address' },
    { bit: 0b0001_0000, label: 'Photo', key: 'photo' },
    { bit: 0b0010_0000, label: 'Masked Aadhaar Number', key: 'aadhaarNumber' },
  ],
  1: [ // PAN
    { bit: 0b0000_0001, label: 'Full Name', key: 'fullName' },
    { bit: 0b0000_0010, label: 'Date of Birth', key: 'dob' },
    { bit: 0b0000_0100, label: 'PAN Number', key: 'panNumber' },
    { bit: 0b0000_1000, label: "Father's Name", key: 'fatherName' },
  ],
  2: [ // Voter ID
    { bit: 0b0000_0001, label: 'Full Name', key: 'fullName' },
    { bit: 0b0000_0010, label: 'Date of Birth', key: 'dob' },
    { bit: 0b0000_0100, label: 'Gender', key: 'gender' },
    { bit: 0b0000_1000, label: 'Address', key: 'address' },
    { bit: 0b0001_0000, label: 'Voter ID Number', key: 'voterIdNumber' },
    { bit: 0b0010_0000, label: 'Constituency', key: 'constituency' },
  ],
}

export function getDocFieldDefs(docType: number) {
  return DOC_FIELD_LABELS[docType] ?? []
}

/** Try to parse idDetails as JSON field values. Returns null if it's a legacy URL or invalid. */
export function parseFieldValues(idDetails: string): Record<string, string> | null {
  if (!idDetails) return null
  try {
    const parsed = JSON.parse(idDetails)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, string>
    }
  } catch {
    // not JSON — legacy URL format
  }
  return null
}

const MASKED = '••••••••'

/* ─── Card Styles per Doc Type ─── */

const DOC_STYLES: Record<number, {
  headerBg: string
  headerText: string
  title: string
  subtitle: string
  accent: string
  numberLabel: string
}> = {
  0: {
    headerBg: 'bg-gradient-to-r from-orange-500 via-white to-green-600',
    headerText: 'text-gray-800',
    title: 'भारत सरकार',
    subtitle: 'GOVERNMENT OF INDIA',
    accent: 'border-orange-400/30',
    numberLabel: 'Aadhaar No.',
  },
  1: {
    headerBg: 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500',
    headerText: 'text-white',
    title: 'आयकर विभाग',
    subtitle: 'INCOME TAX DEPARTMENT',
    accent: 'border-blue-400/30',
    numberLabel: 'PAN',
  },
  2: {
    headerBg: 'bg-gradient-to-r from-orange-400 via-amber-100 to-green-500',
    headerText: 'text-gray-800',
    title: 'भारत निर्वाचन आयोग',
    subtitle: 'ELECTION COMMISSION OF INDIA',
    accent: 'border-orange-400/30',
    numberLabel: 'Voter ID',
  },
}

const DOC_NAMES = ['Aadhaar Card', 'PAN Card', 'Voter ID Card']

/* ─── Main Component ─── */

interface DocumentCardProps {
  docType: number
  sharedFields: number
  fieldValues: Record<string, string>
  compact?: boolean
  photoUrl?: string
}

const DocumentCard: React.FC<DocumentCardProps> = ({ docType, sharedFields, fieldValues, compact = false, photoUrl }) => {
  const fields = DOC_FIELD_LABELS[docType] ?? []
  const style = DOC_STYLES[docType] ?? DOC_STYLES[0]

  const isShared = (bit: number) => (sharedFields & bit) !== 0
  const getValue = (key: string, bit: number) => {
    if (!isShared(bit)) return MASKED
    return fieldValues[key] || MASKED
  }

  // Get primary number field for bottom display
  const numberField = fields.find(f =>
    f.key === 'aadhaarNumber' || f.key === 'panNumber' || f.key === 'voterIdNumber'
  )

  // Fields to show in the body (excluding the number field and photo)
  const bodyFields = fields.filter(f => f.key !== 'photo' && f !== numberField)

  return (
    <div className={`rounded-xl overflow-hidden border ${style.accent} bg-base-100 shadow-sm ${compact ? 'max-w-xs' : 'max-w-sm'}`}>
      {/* Header — tricolor / gradient bar */}
      <div className={`${style.headerBg} px-4 ${compact ? 'py-2' : 'py-2.5'}`}>
        <div className={`${style.headerText} text-center`}>
          <p className={`font-bold ${compact ? 'text-[10px]' : 'text-xs'} leading-tight`}>{style.title}</p>
          <p className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-semibold tracking-wider uppercase opacity-80`}>{style.subtitle}</p>
        </div>
      </div>

      {/* Body */}
      <div className={`${compact ? 'px-3 py-2.5' : 'px-4 py-3.5'}`}>
        {/* Doc type label */}
        <p className="text-[9px] text-base-content/30 uppercase tracking-wider mb-2">
          {DOC_NAMES[docType] ?? 'Document'}
        </p>

        <div className="flex gap-3">
          {/* Photo placeholder */}
          <div className={`shrink-0 ${compact ? 'w-12 h-14' : 'w-14 h-16'} rounded-md border border-base-content/10 bg-base-content/[0.03] flex items-center justify-center overflow-hidden`}>
            {fields.some(f => f.key === 'photo') && isShared(fields.find(f => f.key === 'photo')!.bit) ? (
              photoUrl ? (
                <img src={photoUrl} alt="ID Photo" className="w-full h-full object-cover" />
              ) : (
              <svg width={compact ? 20 : 24} height={compact ? 20 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/40">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              )
            ) : (
              <div className="w-full h-full bg-base-content/[0.05] flex items-center justify-center">
                <svg width={compact ? 14 : 16} height={compact ? 14 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-content/15">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {bodyFields.map((field) => {
              const shared = isShared(field.bit)
              const val = getValue(field.key, field.bit)
              return (
                <div key={field.key}>
                  <p className="text-[9px] text-base-content/30 uppercase tracking-wider leading-none">{field.label}</p>
                  <p className={`${compact ? 'text-[11px]' : 'text-xs'} font-medium leading-snug ${shared ? 'text-base-content' : 'text-base-content/20 select-none blur-[2px]'}`}>
                    {val}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Document number — bottom bar */}
        {numberField && (
          <div className={`mt-3 pt-2.5 border-t border-base-content/[0.06] flex items-center justify-between`}>
            <span className="text-[9px] text-base-content/30 uppercase tracking-wider">{style.numberLabel}</span>
            <span className={`font-mono ${compact ? 'text-xs' : 'text-sm'} font-bold tracking-wider ${isShared(numberField.bit) ? 'text-base-content' : 'text-base-content/20 blur-[3px] select-none'}`}>
              {getValue(numberField.key, numberField.bit)}
            </span>
          </div>
        )}
      </div>

      {/* Footer — testnet disclaimer */}
      <div className="px-4 py-1.5 bg-warning/5 border-t border-warning/10">
        <p className="text-[8px] text-warning/60 text-center">Testnet — sample data only</p>
      </div>
    </div>
  )
}

/* ─── Field Input Form (used in User.tsx consent approval) ─── */

interface DocumentFieldFormProps {
  docType: number
  sharedFields: number
  fieldValues: Record<string, string>
  onChange: (values: Record<string, string>) => void
  photoUrl?: string
}

export const DocumentFieldForm: React.FC<DocumentFieldFormProps> = ({ docType, sharedFields, fieldValues, onChange, photoUrl }) => {
  const fields = DOC_FIELD_LABELS[docType] ?? []
  const sharedFieldDefs = fields.filter(f => (sharedFields & f.bit) !== 0)

  if (sharedFieldDefs.length === 0) {
    return <p className="text-xs text-base-content/40">Select fields above to enter values.</p>
  }

  // Check if values were auto-filled (from DigiLocker mock)
  const filledCount = sharedFieldDefs.filter(f => (fieldValues[f.key] ?? '').trim()).length
  const isAutoFilled = filledCount > 0

  return (
    <div className="space-y-3">
      {isAutoFilled ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/15">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="text-[11px] text-success font-medium">Fetched from DigiLocker — verified data</p>
          <span className="text-[10px] text-base-content/30 ml-auto">{filledCount} fields</span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-base-content/50 font-medium">Enter your document details:</p>
          <span className="text-[10px] text-base-content/30">{filledCount}/{sharedFieldDefs.length} filled</span>
        </div>
      )}
      <div className="space-y-2">
        {sharedFieldDefs.map((field) => {
          const value = fieldValues[field.key] ?? ''
          const hasValue = value.trim().length > 0
          return (
            <div key={field.key}>
              <label className="text-[10px] text-base-content/40 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                {field.label}
                {hasValue && isAutoFilled && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-success">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </label>
              {field.key === 'photo' ? (
                <div className="text-[10px] text-success/60 italic py-1 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Photo verified via DigiLocker
                </div>
              ) : field.key === 'address' ? (
                <textarea
                  className={`textarea textarea-bordered textarea-xs w-full text-xs leading-snug ${hasValue && isAutoFilled ? 'bg-success/[0.03] border-success/20' : 'bg-base-200/30'}`}
                  rows={2}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={value}
                  readOnly={hasValue && isAutoFilled}
                  onChange={(e) => onChange({ ...fieldValues, [field.key]: e.target.value })}
                />
              ) : (
                <input
                  type="text"
                  className={`input input-bordered input-xs w-full text-xs ${hasValue && isAutoFilled ? 'bg-success/[0.03] border-success/20' : 'bg-base-200/30'}`}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={value}
                  readOnly={hasValue && isAutoFilled}
                  onChange={(e) => onChange({ ...fieldValues, [field.key]: e.target.value })}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Live preview */}
      {filledCount > 0 && (
        <div>
          <p className="text-[10px] text-base-content/30 mb-2">Preview — what the organisation will see:</p>
          <DocumentCard docType={docType} sharedFields={sharedFields} fieldValues={fieldValues} compact photoUrl={photoUrl} />
        </div>
      )}
    </div>
  )
}

export default DocumentCard
