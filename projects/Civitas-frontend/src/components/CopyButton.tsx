import * as React from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  size?: number
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '', size = 14 }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      className={`relative btn btn-ghost btn-xs rounded-lg ${className}`}
      onClick={handleCopy}
      title="Copy address"
    >
      {copied ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {/* Tooltip */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-primary text-primary-content text-[10px] font-semibold whitespace-nowrap shadow-lg animate-fade-in-tooltip">
          Copied!
        </span>
      )}
    </button>
  )
}

export default CopyButton
