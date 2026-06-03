import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

const API_URL = import.meta.env.VITE_API_URL || ''

type Step = 'checking' | 'email' | 'otp' | 'done'

/** Call this to re-open the email link modal from anywhere (e.g. Profile tab) */
export const openEmailLink = () => {
  localStorage.removeItem('emailLinkSkipped')
  window.dispatchEvent(new CustomEvent('open-email-link'))
}

const EmailVerification = () => {
  const { activeAddress } = useWallet()
  const [step, setStep] = useState<Step>('checking')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [linkedEmail, setLinkedEmail] = useState('')
  const [emailTaken, setEmailTaken] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const checkedRef = useRef<string | null>(null)

  // Check email link status when wallet connects
  useEffect(() => {
    if (!activeAddress || checkedRef.current === activeAddress) return
    checkedRef.current = activeAddress

    const checkEmail = async () => {
      setStep('checking')
      try {
        const res = await fetch(`${API_URL}/v1/wallet/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: activeAddress }),
        })
        const data = await res.json()
        if (data.linked) {
          setLinkedEmail(data.email)
          setStep('done')
        } else {
          setStep('email')
        }
      } catch {
        setStep('email')
      }
    }

    checkEmail()
  }, [activeAddress])

  // Reset when wallet disconnects
  useEffect(() => {
    if (!activeAddress) {
      setStep('checking')
      setEmail('')
      setOtp(['', '', '', '', '', ''])
      setError('')
      setLinkedEmail('')
      checkedRef.current = null
    }
  }, [activeAddress])

  // Listen for re-open from Profile tab
  useEffect(() => {
    const handler = () => {
      checkedRef.current = null
      setStep('email')
    }
    window.addEventListener('open-email-link', handler)
    return () => window.removeEventListener('open-email-link', handler)
  }, [])

  // Instant check: is email already linked to another wallet?
  useEffect(() => {
    setEmailTaken(false)
    setError('')
    if (!activeAddress || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setCheckingEmail(true)
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/v1/wallet/email-available`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: activeAddress, email }),
          signal: controller.signal,
        })
        const data = await res.json()
        if (!data.available) {
          setEmailTaken(true)
        }
      } catch {
        // ignore abort / network errors
      } finally {
        setCheckingEmail(false)
      }
    }, 400)

    return () => {
      clearTimeout(timeout)
      controller.abort()
      setCheckingEmail(false)
    }
  }, [email, activeAddress])

  const handleSendOtp = async () => {
    if (!activeAddress || !email) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/v1/wallet/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: activeAddress, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send code')
      } else {
        setStep('otp')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    if (!activeAddress) return
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Enter all 6 digits')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/v1/wallet/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: activeAddress, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
      } else {
        setLinkedEmail(data.email)
        setStep('done')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    const skipData = { address: activeAddress, skippedAt: Date.now() }
    localStorage.setItem('emailLinkSkipped', JSON.stringify(skipData))
    setStep('done')
  }

  // Check if user skipped recently (remind again after 7 days)
  useEffect(() => {
    if (step !== 'email' || !activeAddress) return
    const stored = localStorage.getItem('emailLinkSkipped')
    if (!stored) return
    try {
      const { address, skippedAt } = JSON.parse(stored)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (address === activeAddress && Date.now() - skippedAt < sevenDays) {
        setStep('done')
      }
    } catch {
      // ignore parse errors
    }
  }, [step, activeAddress])

  if (!activeAddress || step === 'checking' || step === 'done') return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-sm">
        {step === 'email' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1 text-center">Stay in the loop</h3>
            <p className="text-sm text-base-content/60 mb-5 text-center">
              Link your email to get notified when organisations request access to your documents.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              className={`input input-bordered w-full ${emailTaken ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !emailTaken && handleSendOtp()}
            />
            {checkingEmail && (
              <p className="text-xs text-base-content/40 mt-1 flex items-center gap-1">
                <span className="loading loading-spinner loading-xs" /> Just a moment...
              </p>
            )}
            {emailTaken && (
              <p className="text-error text-sm mt-1">
                This email is already connected to another wallet. Please use a different email.
              </p>
            )}
            {error && !emailTaken && <p className="text-error text-sm mt-2">{error}</p>}
            <div className="modal-action flex-col gap-2">
              <button
                className="btn btn-primary w-full"
                disabled={!email || loading || emailTaken || checkingEmail}
                onClick={handleSendOtp}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Send Verification Code'}
              </button>
              <button
                className="btn btn-sm w-full bg-primary/10 text-base-content/40"
                onClick={handleSkip}
              >
                Skip for now.
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                  <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /><path d="M22 2l-5 5" /><path d="M17 2h5v5" />
                </svg>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1 text-center">Enter verification code</h3>
            <p className="text-sm text-base-content/60 mb-4 text-center">
              We sent a 6-digit code to <span className="font-medium text-primary">{email}</span>
            </p>
            <div className="flex gap-2 justify-center mb-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="input input-bordered w-12 h-14 text-center text-xl font-bold focus:border-primary"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>
            {error && <p className="text-error text-sm mb-2 text-center">{error}</p>}
            <div className="modal-action flex-col gap-2">
              <button
                className="btn btn-primary w-full"
                disabled={otp.join('').length !== 6 || loading}
                onClick={handleVerifyOtp}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Verify'}
              </button>
              <button
                className="btn btn-ghost btn-sm w-full text-base-content/40"
                onClick={() => {
                  setOtp(['', '', '', '', '', ''])
                  setError('')
                  setStep('email')
                }}
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

export default EmailVerification
