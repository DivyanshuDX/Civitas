import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'
import { useWallet } from '@txnlab/use-wallet-react'
import { ThemeToggle } from './ThemeToggle'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'

const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS
const DX_APP_ID_NUM = Number(import.meta.env.VITE_DX_APP_ID)

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  title: string
  subtitle: string
  navItems: NavItem[]
  activeTab: string
  onTabChange: (id: string) => void
  statusBadge?: React.ReactNode
  children: React.ReactNode | ((openWalletModal: () => void) => React.ReactNode)
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, navItems, activeTab, onTabChange, statusBadge, children }) => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [tabKey, setTabKey] = useState(0)
  const [pageKey, setPageKey] = useState(0)
  const { activeAddress } = useWallet()
  const navigate = useNavigate()
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)
  const prevTabRef = useRef(activeTab)
  const tabScrollRef = useRef<HTMLDivElement>(null)

  const isAdmin = activeAddress === ADMIN_ADDRESS

  // Trigger page transition on route change
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setPageKey((k) => k + 1)
      prevPathRef.current = location.pathname
    }
  }, [location.pathname])

  // Trigger tab transition on tab change
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      setTabKey((k) => k + 1)
      prevTabRef.current = activeTab
    }
  }, [activeTab])

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabScrollRef.current) {
      const activeEl = tabScrollRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeTab])

  // Check if connected wallet is a whitelisted org
  useEffect(() => {
    if (!activeAddress) { setIsWhitelisted(false); return }
    const check = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        const prefix = new TextEncoder().encode('wl_')
        const addrBytes = algosdk.decodeAddress(activeAddress).publicKey
        const boxName = new Uint8Array(prefix.length + addrBytes.length)
        boxName.set(prefix)
        boxName.set(addrBytes, prefix.length)
        await algorand.client.algod.getApplicationBoxByName(DX_APP_ID_NUM, boxName).do()
        setIsWhitelisted(true)
      } catch {
        setIsWhitelisted(false)
      }
    }
    check()
  }, [activeAddress])

  const globalNav = [
    {
      path: '/', label: 'Home',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    },
    {
      path: '/user', label: 'User',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    },
    {
      path: '/org', label: 'Organisation',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>,
    },
    ...(isAdmin ? [{
      path: '/admin', label: 'Admin',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    }] : []),
  ]

  // Hide page section tabs when:
  // - No wallet connected
  // - On /org page without whitelist or admin access
  // - On /admin page without admin access
  const showPageSections = activeAddress
    && !(location.pathname === '/org' && !isWhitelisted && !isAdmin)
    && !(location.pathname === '/admin' && !isAdmin)

  return (
    <div className="h-screen flex overflow-hidden bg-base-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col
        bg-base-200/95 backdrop-blur-xl border-r border-base-content/[0.06]
        transform transition-transform duration-300 ease-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base-content text-[15px] tracking-tight block leading-tight">Civitas</span>
          </div>
          <button className="lg:hidden btn btn-ghost btn-xs btn-square rounded-lg" onClick={() => setSidebarOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-content/40">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global nav */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-[9px] uppercase tracking-[0.15em] text-base-content/25 font-semibold px-3 mb-2">Navigate</p>
          <div className="space-y-0.5">
            {globalNav.map((item) => {
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                    active
                      ? 'bg-primary/12 text-primary font-semibold shadow-sm shadow-primary/5'
                      : 'text-base-content/45 hover:text-base-content/75 hover:bg-base-content/[0.04]'
                  }`}
                >
                  <span className={`shrink-0 ${active ? 'text-primary' : 'text-base-content/30'}`}>{item.icon}</span>
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {showPageSections ? (
          <>
            <div className="mx-5 h-px bg-base-content/[0.06] my-2" />
            <div className="px-3 pt-2 pb-2 flex-1 overflow-y-auto">
              <p className="text-[9px] uppercase tracking-[0.15em] text-base-content/25 font-semibold px-3 mb-2">{title}</p>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                        active
                          ? 'bg-primary text-primary-content font-semibold shadow-sm shadow-primary/20'
                          : 'text-base-content/40 hover:text-base-content/70 hover:bg-base-content/[0.04]'
                      }`}
                    >
                      <span className={`shrink-0 ${active ? 'text-primary-content' : 'opacity-40'}`}>{item.icon}</span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}

        {/* Bottom section */}
        <div className="p-3 space-y-2 shrink-0">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] text-base-content/30 font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all duration-200 ${
              activeAddress
                ? 'bg-base-content/[0.04] hover:bg-base-content/[0.07] border border-base-content/[0.06]'
                : 'bg-primary text-primary-content hover:opacity-90'
            }`}
            onClick={() => setOpenWalletModal(true)}
          >
            {activeAddress ? (
              <>
                <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-success" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] font-semibold text-base-content truncate">{activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}</p>
                  <p className="text-[9px] text-base-content/30">Connected</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-content/20 shrink-0">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                </svg>
                <span className="font-semibold">Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-base-content/[0.06] bg-base-100 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — only on mobile when sidebar content is needed (theme toggle etc) */}
            <button className="lg:hidden btn btn-ghost btn-sm btn-square rounded-lg" onClick={() => setSidebarOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-base-content leading-tight">{title}</h1>
              <p className="text-[11px] text-base-content/35 hidden sm:block">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            <button
              className={`btn btn-sm rounded-lg ${
                activeAddress
                  ? 'btn-ghost border border-base-content/[0.08] bg-base-content/[0.03]'
                  : 'btn-primary'
              }`}
              onClick={() => setOpenWalletModal(true)}
            >
              {activeAddress ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-mono">{activeAddress.slice(0, 4)}...{activeAddress.slice(-3)}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs">
                  Connect
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile horizontal tab bar — scrollable, below header */}
        {showPageSections && navItems.length > 0 && (
          <div className="lg:hidden bg-base-100 shrink-0 border-b border-base-content/[0.06]">
            <div
              ref={tabScrollRef}
              className="flex overflow-x-auto no-scrollbar px-2 py-1.5 gap-1"
            >
              {navItems.map((item) => {
                const active = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    data-active={active}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs whitespace-nowrap shrink-0 rounded-lg transition-all duration-150 ${
                      active
                        ? 'bg-primary text-primary-content font-semibold shadow-sm shadow-primary/20'
                        : 'text-base-content/40 bg-base-content/[0.03] active:bg-base-content/[0.06]'
                    }`}
                  >
                    <span className={`shrink-0 ${active ? 'text-primary-content' : 'text-base-content/25'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div key={`page-${pageKey}`} className="page-transition">
            <div key={`tab-${tabKey}`} className="tab-transition">
              {typeof children === 'function' ? children(() => setOpenWalletModal(true)) : children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — page navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-base-200/95 backdrop-blur-xl border-t border-base-content/[0.06]">
        <div className="flex items-center justify-around px-1 py-1 safe-bottom">
          {globalNav.map((item) => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl min-w-[60px] transition-all duration-150 ${
                  active
                    ? 'text-primary'
                    : 'text-base-content/35 active:text-base-content/60'
                }`}
              >
                <span className={active ? 'text-primary' : 'text-base-content/30'}>{item.icon}</span>
                <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.label === 'Organisation' ? 'Org' : item.label}
                </span>
                {active && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
    </div>
  )
}

export default DashboardLayout
