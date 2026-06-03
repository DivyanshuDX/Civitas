import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()

    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setStatus('error')
      setErrorMsg('Please enter a valid email')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (res.status === 201) {
        setStatus('success')
        setEmail('')
      } else if (res.status === 200) {
        setStatus('already')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <p className="text-xs text-emerald-400">Subscribed!</p>
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l2 2 4-4" />
        </svg>
        <p className="text-xs text-white/50">Already subscribed</p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-xs text-white placeholder:text-white/25 outline-none focus:border-white/25 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/15 transition-colors disabled:opacity-50 shrink-0"
        >
          {status === 'loading' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4 31.4" className="text-white/40" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-[10px] text-red-400 mt-1.5">{errorMsg}</p>
      )}
    </div>
  )
}
