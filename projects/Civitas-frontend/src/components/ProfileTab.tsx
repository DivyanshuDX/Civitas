import { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { openEmailLink } from './EmailVerification'
import CopyButton from './CopyButton'

const API_URL = import.meta.env.VITE_API_URL || ''

interface ProfileTabProps {
  role: 'User' | 'Organisation' | 'Admin'
}

const ProfileTab: React.FC<ProfileTabProps> = ({ role }) => {
  const { activeAddress } = useWallet()
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const network = algodConfig.network === '' ? 'localnet' : algodConfig.network.toLowerCase()

  useEffect(() => {
    if (!activeAddress) return
    const check = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/v1/wallet/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: activeAddress }),
        })
        const data = await res.json()
        setLinkedEmail(data.linked ? data.email : null)
      } catch {
        setLinkedEmail(null)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [activeAddress])


  if (!activeAddress) return null

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-base-content">Profile</h2>
        <p className="text-sm text-base-content/50 mt-1">Your wallet and account details</p>
      </div>

      {/* Profile Card */}
      <div className="card-glass rounded-2xl border border-base-content/[0.06] overflow-hidden">
        {/* Avatar & Role Banner */}
        <div className="bg-primary/10 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <span className="badge badge-primary badge-sm font-semibold">{role}</span>
            <p className="text-xs text-base-content/50 mt-1 capitalize">{network}</p>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-base-content/[0.06]">
          {/* Wallet Address */}
          <div className="px-6 py-4">
            <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-semibold mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-base-content bg-base-content/[0.04] px-3 py-2 rounded-lg break-all flex-1 font-mono">
                {activeAddress}
              </code>
              <CopyButton text={activeAddress} size={16} />
            </div>
            <a
              href={`https://lora.algokit.io/${network}/account/${activeAddress}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
            >
              View on Explorer
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {/* Email */}
          <div className="px-6 py-4">
            <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-semibold mb-2">Linked Email</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs" />
                <span className="text-sm text-base-content/40">Checking...</span>
              </div>
            ) : linkedEmail ? (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-sm text-base-content">{linkedEmail}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warning shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm text-base-content/50">No email linked</span>
                </div>
                <button
                  className="btn btn-primary btn-sm gap-1.5"
                  onClick={openEmailLink}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Link Email
                </button>
              </div>
            )}
          </div>

          {/* Network */}
          <div className="px-6 py-4">
            <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-semibold mb-2">Network</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${network === 'mainnet' ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-sm text-base-content capitalize">{network}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab
